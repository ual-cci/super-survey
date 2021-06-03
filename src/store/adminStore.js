import Vue from 'vue';
import firebase from '@firebase/app';
import '@firebase/firestore';

const adminStore = {
  state: () => ({
    admin: {
      projectList: [],
      // projectListLoading: false,
      surveyList: [],
      // surveyListLoading: false,

      editProject: null,
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
  },
  getters: {
    getAdminProjectList: state => state.admin.projectList,
    // getAdminEditProject: state => state.admin.editProject,
    projectList: state => state.admin.projectList,
    getAdminEditProject: (state) => {
      console.log('AdminStore.getAdminEditProject');
      console.log('  state.admin.editProject=', state.admin.editProject);
      return state.admin.editProject;
    },
  },
  actions: {
    loadProjects({ state, commit }) {
      return new Promise((resolve) => {
        console.log('store.actions.loadProjects');
        if (state.admin.projectList.length === 0) {
          firebase.firestore().collection('projects')
            .get()
            .then((querySnapshot) => {
              const projects = querySnapshot.docs.map((doc) => {
                return {
                  ...doc.data(),
                  id: doc.id,
                };
              });
              commit('setAdminProjects', projects);
              resolve();
            });
        } else {
          resolve();
        }
      });
    },
    findEditProject({ state, commit }, projectID) {
      return new Promise((resolve) => {
        console.log('store.findEditProject: projectID=', projectID);
        console.log('  projectList=', [...state.admin.projectList]);
        const foundProject = state.admin.projectList.find(
          project => project.id === projectID,
        );
        console.log('  foundProject=', foundProject);
        commit('setEditProject', foundProject);
        resolve(foundProject);
      });
    },
  },
};

export default adminStore;
