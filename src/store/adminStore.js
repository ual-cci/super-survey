import Vue from 'vue';
import firebase from '@firebase/app';
import '@firebase/firestore';

const adminStore = {
  state: () => ({
    admin: {
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
    setAdminProjects(state, projectList) {
      console.log('setting admin projects');
      console.log('  projectList=', projectList);
      Vue.set(state.admin, 'projectList', projectList);
    },
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
  },
  getters: {
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
  },
};

export default adminStore;