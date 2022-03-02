import Vue from 'vue';
import Router from 'vue-router';
import firebase from '@firebase/app';
import '@firebase/firestore';
import '@firebase/auth';
import store from './store';

Vue.use(Router);

const guards = {
  onlyAdmin(to, from, next) {
    const user = firebase.auth().currentUser;
    if (user) {
      user.getIdTokenResult()
        .then((tr) => {
          if (to.name !== 'answer-editor' && tr.claims.onlyTranscription) {
            next('/');
          } else {
            next();
          }
        });
    } else {
      next({ name: 'admin-login', params: { nextPage: to.name } });
    }
  },
  needsSignedInUser(to, from, next) {
    if (store.state.user.id || firebase.auth().currentUser) {
      next();
    } else {
      next({
        name: 'enter',
        params: { surveyID: to.params.surveyID },
      });
    }
  },

  surveyRedirect(to, from, next) {
    firebase.firestore().collection('misc').doc('slugs')
      .get()
      .then((docRef) => {
        const slugs = docRef.data();
        const id = slugs[to.params.surveySlug];
        if (id === undefined) {
          next('/');
        } else {
          next({ name: 'survey', params: { surveyID: id } });
        }
      });
  },
};

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/landing',
      name: 'landing',
      component: () => import('./views/Landing.vue'),
      meta: { publicFacing: true },
    },
    {
      path: '/admin/:nextPage?',
      name: 'admin-login',
      component: () => import('./views/Login.vue'),
      meta: { publicFacing: true },
      props: true,
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('./views/Projects.vue'),
      beforeEnter: guards.onlyAdmin,
      meta: { hasHeader: true },
    },
    {
      path: '/survey/stats/:surveyID',
      name: 'survey-stats',
      component: () => import('./views/SurveyStats.vue'),
      beforeEnter: guards.onlyAdmin,
      meta: { hasHeader: true },
      props: true,
    },
    {
      path: '/answers/edit/:surveyID?/:answerID?',
      name: 'answer-editor',
      component: () => import('./views/AnswerEditor.vue'),
      beforeEnter: guards.onlyAdmin,
      meta: { hasHeader: true },
      props: true,
    },
    {
      path: '/answers/user/:anonID',
      name: 'user-answers',
      component: () => import('./views/UserAnswers.vue'),
      beforeEnter: guards.onlyAdmin,
      meta: { hasHeader: true },
      props: true,
    },
    {
      path: '/survey/edit/:surveyID',
      name: 'survey-designer',
      component: () => import('./views/SurveyDesigner.vue'),
      beforeEnter: guards.onlyAdmin,
      props: true,
    },
    {
      path: '/survey/:surveyID',
      name: 'survey',
      component: () => import('./views/Survey.vue'),
      props: true,
      beforeEnter: guards.needsSignedInUser,
      meta: { publicFacing: true },
    },
    {
      path: '/enter/:surveyID/:stage?',
      name: 'enter',
      component: () => import('./views/Enter.vue'),
      props: true,
      meta: { publicFacing: true },
    },
    {
      path: '/s/:surveySlug',
      beforeEnter: guards.surveyRedirect,
    },
    {
      path: '/email-signups',
      name: 'email-signups',
      beforeEnter: guards.onlyAdmin,
      component: () => import('./views/EmailSignups.vue'),
    },
    {
      path: '/',
      name: 'root',
      component: () => import('./views/Root.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'route-not-found',
      component: () => import('./views/RouteNotFound.vue'),
    },


  ],
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});
