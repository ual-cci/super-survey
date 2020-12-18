import 'babel-polyfill';
import Vue from 'vue';
import firebase from '@firebase/app';
import '@firebase/firestore';
import '@firebase/auth';
import '@firebase/storage';

import App from './App.vue';
import router from './router';
import store from './store';
import firebaseConfig from './firebaseConfig';

Vue.config.productionTip = false;

firebase.initializeApp(firebaseConfig);

const firebasePlugin = {
  /* eslint-disable no-param-reassign */
  install(v) {
    v.prototype.$auth = firebase.auth();
    v.prototype.$db = firebase.firestore();
    v.prototype.$storage = firebase.storage();
  },
};

Vue.use(firebasePlugin);

Vue.mixin({
  methods: {
    makeTitle: str => str.charAt(0).toUpperCase() + str.slice(1),
    stripElement: str => str.split('-')[0],
    arrayUnion: firebase.firestore.FieldValue.arrayUnion,
    abbreviate: (s, l = 50) => {
      if (s.length >= l) {
        const bit = s.substr(0, l - 3);
        return `${bit}...`;
      }
      return s;
    },
    grabKeys: (o, keys, initial) => {
      const output = initial || {};
      keys.forEach((k) => { output[k] = o[k]; });
      return output;
    },
    questionNumber: (page, number, target) => {
      const prefix = target === 'survey' ? 'Q' : 'D';
      const part = String.fromCharCode('a'.charCodeAt(0) + number - 1);
      return `${prefix}${page}${part}`;
    },
    removeNulls: (o) => {
      const output = {};
      Object.keys(o).forEach((key) => {
        const value = o[key];
        if (value !== null) {
          output[key] = o[key];
        }
      });
      return output;
    },
    /* eslint no-useless-escape: "off" */
    validEmail: email => email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null,
    validPhone: phone => phone.match(/^(PFR-)?[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/) !== null,
  },
});

Vue.use({
  install(v) {
    v.prototype.mediaIcons = {
      photo: 'fa-image',
      audio: 'fa-microphone',
      video: 'fa-video',
    };
  },
});

firebase.auth().onAuthStateChanged((user) => {
  store.state.user.admin = !!user;
  store.dispatch('getUser');

  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app');
});
