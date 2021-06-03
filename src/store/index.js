/* eslint no-param-reassign: "off" */
/* eslint arrow-body-style: "off" */
/* eslint arrow-parens: "off" */
import Vue from 'vue';
import Vuex from 'vuex';
import Cookie from 'js-cookie';
import firebase from '@firebase/app';
import '@firebase/firestore';

import adminStore from './adminStore';

Vue.use(Vuex);

const USER_COOKIE_NAME = 'user_id';

export default new Vuex.Store({
  modules: {
    admin: adminStore,
  },
  state: () => ({
    user: {
      admin: false,
      id: Cookie.get(USER_COOKIE_NAME),
    },
    survey: {
      title: '',
      id: null,
      elements: [],
    },
    questionBank: {},
    projects: {},
    loadedAllProjects: false,
    surveyElementClass: 'default-element',
    historyPoints: {
      surveyPage: 0, // before start
      demographics: 0,
    },
    questions: {},
    fontSize: 16,
    surveyIDMap: {},
    demographics: {},
  }),
  mutations: {
    setEditSurveys(state, surveys) {
      Vue.set(state, 'editSurveys', surveys);
    },
    addProject(state, project) {
      Vue.set(state.projects, project.id, project);
    },
    deleteProject(state, project) {
      Vue.delete(state.projects, project.id);
    },
    addProjects(state, projects) {
      Vue.set(state, 'projects', projects);
      state.loadedAllProjects = true;
    },
    clearProjects(state) {
      Vue.delete(state, 'projects');
    },
    setSurveys(state, payload) {
      const { project, surveys } = payload;
      console.log('setSurveys: state=', state);
      Vue.set(state.projects[project.id], 'surveys', surveys);
      surveys.forEach((survey, index) => {
        state.surveyIDMap[survey.id] = {
          projectID: project.id,
          index,
        };
      });
    },
    syncSurveys(state) {
      if (state.projects) {
        const { surveys } = [state.survey.project.id];
        if (surveys) {
          const surveyIDs = surveys.map(s => s.id);
          const index = surveyIDs.indexOf(state.survey.id);
          surveys[index] = state.survey;
        }
      }
    },
    addSurvey(state, payload) {
      const { project, survey } = payload;
      const { surveys } = state.projects[project.id];
      surveys.push(survey);
      state.surveyIDMap[survey.id] = {
        projectID: project.id,
        index: surveys.length - 1,
      };
    },
    addDemographicsSurvey(state, payload) {
      state.demographics[payload.id] = payload;
    },
    clearQuestionBank(state) {
      state.questionBank = [];
    },
    addQuestion(state, question) {
      Vue.set(state.questionBank, question.id, question);
    },
    setUser(state, user) {
      Cookie.set(USER_COOKIE_NAME, user.id, { expires: 3000 });
      state.user = user;
    },
    history(state, data) {
      state.historyPoints = Object.assign({}, state.historyPoints, data);
      if (!data.dontUpdate) {
        window.history.pushState(state.historyPoints, null);
      }
    },
  },
  getters: {
    noProjects: (state) => {
      return Object.keys(state.projects).length === 0;
    },
    surveyFromID: (state) => (surveyID) => {
      if (surveyID in state.surveyIDMap) {
        const { projectID, index } = state.surveyIDMap[surveyID];
        try {
          return state.projects[projectID].surveys[index];
        } catch (e) {
          return null;
        }
      }
      if (surveyID in state.demographics) {
        return state.demographics[surveyID];
      }
      return null;
    },
    /* eslint no-unused-vars: "off" */
    projectHasSurveys: (state) => (project) => {
      return project && project.surveys === undefined;
    },
    filteredQuestions: (state) => (regex) => {
      const questions = Object.values(state.questionBank);
      return questions.filter(q => q.text.search(regex) !== -1);
    },
    validUser: (state) => {
      return state.user.id && !state.user.admin;
    },
    isAdmin: (state) => {
      return state.user.admin;
    },
    donePreamble: (state) => {
      const preambles = state.user.completed_preambles;
      const projectID = state.survey.project.id;
      return (preambles && preambles.indexOf(projectID) !== -1);
    },
    surveyPage: (state) => {
      return state.historyPoints.surveyPage;
    },
    demographicsPoint: (state) => {
      return state.historyPoints.demographics;
    },
    surveyInfo: (state) => {
      return {
        project: {
          id: state.survey.project.id,
        },
        survey: {
          title: state.survey.title,
          id: state.survey.id,
        },
        user: {
          id: state.user.id || null, // incase admin
          anonID: state.user.anonID || null,
        },
        timestamp: new Date(),
      };
    },
    questionIDs: (state) => {
      return Object.keys(state.questions);
    },
    precedingQuestion: (state) => (id) => {
      const ids = Object.keys(state.questions);
      const prevIndex = ids.indexOf(id) - 1;
      if (prevIndex >= 0) {
        return state.questions[ids[prevIndex]];
      }
      return null;
    },
  },
  actions: {
    /* getProject({ state, commit }, { id }) {
      return new Promise((resolve) => {
        if (state.projects[id]) {
          resolve(state.projects[id]);
        } else {
          firebase.firestore().collection('projects').doc(id)
            .get()
            .then((docRef) => {
              if (docRef.exists) {
                const project = docRef.data();
                project.id = docRef.id;
                project.surveys = null;
                commit('addProject', project);
                resolve(project);
              }
            });
        }
      });
    }, */
    getUser({ state }) {
      if (state.user.id && !state.user.anonID) {
        return firebase.firestore().collection('users').doc(state.user.id)
          .get()
          .then((docRef) => {
            if (docRef.exists) {
              state.user = Object.assign({}, docRef.data(), state.user);
            }
          });
      }
      return null;
    },
  },
});
