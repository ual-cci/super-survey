import Vue from 'vue';
import firebase from '@firebase/app';
import '@firebase/firestore';
import _ from 'lodash';

/* class Cacheable {
  thing: null, // thing to be 
  isLoading: false,
  loadedAt: null
} */

const adminStore = {
  state: () => ({
    admin: {
      projectTable: {},
      surveyTable: {},

      // projectList: Projects the currently logged in user has access to
      projectList: [],

      // editProject: The selected project to work with
      editProject: null,

      // surveyList: Surveys in the editProject 
      surveyList: [],

      // editSurvey: The user-selected survey to manipulate
      editSurvey: null,

      /* currentProjectID: null,
      currentSurveyID: null, */
    },
  }),
  mutations: {
    setAdminProjects(state, projectTable) {
      Vue.set(state.admin, 'projectTable', projectTable);
      console.log('setAdminProjects: projectTable=', projectTable);
      // state.admin.projectList
    },
    setAdminSurveys(state, surveyTable) {
      Vue.set(state.admin, 'surveyTable', surveyTable);
      console.log('setAdminSurveys: surveyTable=', surveyTable);
    },
    /* setAdminProjects(state, projectList) {
      console.log('setting admin projects');
      console.log('  projectList=', projectList);
      Vue.set(state.admin, 'projectList', projectList);
    }, */
    setEditProject(state, project) {
      console.log('store.commit.setEditProject: project=', project);
      Vue.set(state.admin, 'editProject', project);
    },
    setEditSurveys(state, surveys) {
      console.log('store.commit.setEditProject: surveys=', surveys);
      Vue.set(state.admin, 'surveyList', surveys);
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

    appendAdminProject(state, newProject) {
      const projectList = [
        ...state.admin.projectList,
        newProject,
      ];
      Vue.set(state.admin, 'projectList', projectList);
    },
    removeAdminProject(state, project) {
      const index = state.admin.projectList.findIndex(prj => prj.id === project.id);
      if (index === -1) return;

      console.log('removeAdminProject: index=', index);
      Vue.delete(state.admin.projectList, index);
    },
  },
  getters: {
    getSortedProjectList(state) {
      const stringCompare = (f) => {
        return (argA, argB) => {
          const a = f(argA);
          const b = f(argB);
          if (a < b) return -1;
          if (a > b) return 1;
          return 0;
        };
      };

      const projects = Object.values(state.admin.projectTable);
      projects.sort(stringCompare(x => x.name));
      return projects;
    },
    getAdminProjectList: state => state.admin.projectList,
    getAdminEditProject: state => state.admin.editProject,
    // projectList: state => state.admin.projectList,
    /* getAdminEditProject: (state) => {
      console.log('AdminStore.getAdminEditProject');
      console.log('  state.admin.editProject=', state.admin.editProject);
      return state.admin.editProject;
    }, */
    projectList: (state) => {
      console.log('adminStore.getters.projectList');
      console.log('  projectList=', state.admin.projectList);
      return state.admin.projectList;
    },
  },
  actions: {
    async loadDataForAdmin({ commit }, user) {
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
    },
    async loadProjects({ state, commit }) {
      console.log('store.actions.loadProjects');
      if (state.admin.projectList.length === 0) {
        const response = await firebase.firestore().collection('projects').get();
        const projects = response.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        commit('setAdminProjects', projects);
        Promise.resolve(projects);
      } else {
        Promise.resolve(state.admin.projectList);
      }
    },
    async findEditProject({ state, commit }, projectID) {
      console.log('store.findEditProject: projectID=', projectID);
      console.log('  projectList=', [...state.admin.projectList]);
      const foundProject = state.admin.projectList.find(
        project => project.id === projectID,
      );
      console.log('  foundProject=', foundProject);
      commit('setEditProject', foundProject);
      return foundProject;
    },
    async findProjectSurveys({ commit }, projectID) {
      console.log('adminStore.findProjectSurveys: projectID=', projectID);

      const dbPromise = firebase.firestore()
        .collection('surveys')
        .where('project.id', '==', projectID)
        .where('target', '==', 'survey');

      const response = await dbPromise.get();

      const surveys = response.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));

      commit('setEditSurveys', surveys);
      return surveys;
    },
    clearEditProject({ commit }) {
      commit('clearEditProject');
      commit('clearEditSurvey');
      commit('clearSurveyList');
    },
    async addProject({ commit }, payload) {
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
      commit('appendAdminProject', project);
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
  },
};

export default adminStore;
