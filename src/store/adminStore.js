import Vue from 'vue';
import firebase from '@firebase/app';
import '@firebase/firestore';
import _ from 'lodash';
import slugify from 'slugify';

const stringCompare = (f) => {
  return (argA, argB) => {
    const a = f(argA);
    const b = f(argB);
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };
};

const adminStore = {
  state: () => ({
    admin: {
      tablesAreLoaded: false,

      projectTable: {},
      surveyTable: {},

      // editProject: The selected project to work with
      editProjectID: null,

      // editSurvey: The user-selected survey to manipulate
      editSurveyID: null,
    },
  }),
  mutations: {
    setAdminProjects(state, projectTable) {
      Vue.set(state.admin, 'projectTable', projectTable);
    },
    setAdminSurveys(state, surveyTable) {
      Vue.set(state.admin, 'surveyTable', surveyTable);
    },
    setEditProjectID(state, projectID) {
      console.log('store.commit.setEditProject: project=', projectID);
      Vue.set(state.admin, 'editProjectID', projectID);
    },

    clearEditProject(state) {
      Vue.set(state.admin, 'editProject', null);
    },
    clearEditSurvey(state) {
      Vue.set(state.admin, 'editSurvey', null);
    },
    clearSurveyList(state) {
      Vue.set(state.admin, 'surveyList', []);
    },

    addAdminProject(state, newProject) {
      Vue.set(state.admin.projectTable, newProject.id, newProject);
    },
    removeAdminProject(state, project) {
      console.log('removeAdminProject: id=', project.id);
      Vue.delete(state.admin.projectTable, project.id);
    },

    addAdminSurvey(state, newSurvey) {
      Vue.set(state.admin.surveyTable, newSurvey.id, newSurvey);
    },
    removeAdminSurvey(state, survey) {
      Vue.delete(state.admin.surveyTable, survey.id);
    },
  },
  getters: {
    getSortedProjectList(state) {
      const projects = Object.values(state.admin.projectTable);
      projects.sort(stringCompare(x => x.name));
      return projects;
    },
    getEditProject(state) {
      if (!state.admin.editProjectID) return null;

      return state.admin.projectTable[state.admin.editProjectID];
    },
    getProjectSurveyCount(state) {
      return (countProject) => {
        const surveys = Object.values(state.admin.surveyTable);
        let count = 0;

        surveys.forEach((survey) => {
          if (survey.project.id === countProject.id) {
            count += 1;
          }
        });

        return count;
      };
    },
    getProjectLiveSurveyCount(state) {
      return (countProject) => {
        const surveys = Object.values(state.admin.surveyTable);
        let count = 0;

        surveys.forEach((survey) => {
          if (survey.project.id === countProject.id && survey.status === 'live') {
            count += 1;
          }
        });

        return count;
      };
    },
    getSortedSurveysForProject(state) {
      return (findForProject) => {
        const surveys = Object.values(state.admin.surveyTable);
        const projectSurveys = [];

        surveys.forEach((survey) => {
          if (survey.project.id === findForProject.id) {
            projectSurveys.push(survey);
          }
        });

        projectSurveys.sort(stringCompare(x => x.title));

        return projectSurveys;
      };
    },
  },
  actions: {
    async loadDataForAdmin({ state, commit }, user) {
      if (state.admin.tablesAreLoaded) return;

      console.log('adminStore.loadDataForAdmin');
      console.log('  user.email=', user.email);
      const projectTable = {};
      const surveyTable = {};

      // first load all the projects
      const projectResponse = await firebase
        .firestore()
        .collection('projects')
        .where('owner.email', '==', user.email)
        .get();

      projectResponse.docs.forEach((doc) => {
        const project = {
          ...doc.data(),
          id: doc.id,
        };
        console.log('  project=', project);
        projectTable[doc.id] = project;
      });

      console.log('  projects.length=', _.size(projectTable));
      commit('setAdminProjects', projectTable);

      // surveys
      const projectIDs = Object.keys(projectTable);
      console.log('  projectIDs=', projectIDs);
      const surveyResponse = await firebase
        .firestore()
        .collection('surveys')
        .where('project.id', 'in', projectIDs)
        .get();

      surveyResponse.docs.forEach((doc) => {
        const survey = {
          ...doc.data(),
          id: doc.id,
        };

        surveyTable[doc.id] = survey;
      });

      console.log('  surveys.length=', _.size(surveyTable));
      commit('setAdminSurveys', surveyTable);

      state.admin.tablesAreLoaded = true;
    },
    setEditProjectByID({ commit }, projectID) {
      commit('setEditProjectID', projectID);
    },

    clearEditProject({ commit }) {
      commit('clearEditProject');
      commit('clearEditSurvey');
      commit('clearSurveyList');
    },
    async createProject({ commit }, payload) {
      const { projectName, user } = payload;

      const project = {
        name: projectName,
        created: new Date(),
        owner: {
          email: user.email,
        },
        visibleTo: [user.email],
        participation: null,
        consent: null,
        preambleStatus: 'disabled',
        demographicsStatus: 'disabled',
      };

      const docRef = await firebase
        .firestore()
        .collection('projects')
        .add(project);

      project.id = docRef.id;
      console.log('AdminStore.addProject: project=', project);
      commit('addAdminProject', project);
      return project;
    },
    async deleteProject({ commit }, project) {
      if (project) {
        console.log('deleteProject: project=', project);
        await firebase
          .firestore()
          .collection('projects')
          .doc(project.id)
          .delete();

        // also delete all the surveys?

        commit('removeAdminProject', project);
      }
    },
    async createSurveyInProject({ commit }, payload) {
      const { user, project, surveyTitle } = payload;

      const surveyDetails = {
        title: surveyTitle,
        owner: { email: user.email },
        project: {
          name: project.name,
          id: project.id,
        },

        slug: slugify(surveyTitle, { lower: true }),
        created: new Date(),
        forceDemographics: false,
        showLogo: true,
        showTitle: true,
        showSignup: true,
        demographicsFirst: false,
        status: 'draft',
        target: 'survey',
      };

      const doc = await firebase
        .firestore()
        .collection('surveys')
        .add(surveyDetails);

      surveyDetails.id = doc.id;

      commit('addAdminSurvey', surveyDetails);
    },
  },
};

export default adminStore;
