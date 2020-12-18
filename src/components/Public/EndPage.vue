<template lang="html">
<div class="end-page">
  <h2>Thanks so much for taking part!</h2>
  <video src="https://firebasestorage.googleapis.com/v0/b/heartnsoul-asks.appspot.com/o/video%2FRobyn_Video06_Goodbye_1.mp4?alt=media&token=6acdfba1-5ac8-46f0-89a5-4c7cbd941ead"
          controls controlslist="nodownload">
  </video>
  <br>
  <p>
    By taking part, you are helping our research, which explores the value of
    difference and questions what is ‘normal’.
  </p>
  <p>
    Heart n Soul at The Hub is a research project based at Wellcome Collection
    led by autistic people and people with and without learning disabilities.
    The project was brought together by award-winning creative arts charity
    <a href="https://www.heartnsoul.co.uk" target="_blank">Heart n Soul</a>.
  </p>
  <p>
    Find Answer more of our research questions by visiting the
    <a href="https://www.heartnsouleye.com/asks" target="_blank">Heart n Soul Asks page</a>
    of our website.
  </p>
  <p>
    Find out more about Heart n Soul at The Hub project on our
    <a href="https://www.heartnsouleye.com" target="_blank">homepage</a>.
  </p>
  <template v-if="survey.showSignup">
    <p>
      Would you like us to send you future surveys?
    </p>
    <p v-if="'more-surveys' in signedUp">Thanks!</p>
    <p v-else>
      <input v-if="!hideEmail"
             class="input" type="text" v-model="email"
             :placeholder="placeholder" @keydown.enter="signup('newsletter')">
      <button class="button is-info" :disabled="buttonsDisabled"
              @click="signup('more-surveys')">
        Yes, please!
      </button>
    </p>
    <p>
      Would you also like to sign up to our mailing list and
      hear more about the project?
    </p>
    <p v-if="'newsletter' in signedUp">Thanks!</p>
    <p v-else>
      <input v-if="!hideEmail"
             class="input" type="text" v-model="email"
             :placeholder="placeholder" @keydown.enter="signup('newsletter')">
      <button class="button is-info" :disabled="buttonsDisabled"
              @click="signup('newsletter')">
        Yes, sign me up!
      </button>
    </p>
  </template>
</div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      email: '',
      hideEmail: true,
      placeholder: 'Please enter your email',
      signedUp: {},
    };
  },
  computed: {
    ...mapState(['user', 'survey']),
    buttonsDisabled() {
      return !this.validEmail(this.email);
    },
  },
  methods: {
    signup(thing) {
      if (this.buttonsDisabled) {
        return;
      }
      this.$db.collection('misc').doc('signups').set({
        [thing]: this.arrayUnion(this.email),
      }, { merge: true });

      Vue.set(this.signedUp, thing, true);
    },
  },
  mounted() {
    if (this.user.idType === 'email') {
      this.email = this.user.id;
    } else {
      this.hideEmail = false;
    }
  },
};
</script>

<style lang="scss" scoped>
.input {
  max-width: 360px;
  margin: 0 10px 10px 0;
}
p:not(:first-child) {
  margin-bottom: 1em;
}
</style>
