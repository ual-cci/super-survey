<template lang="html">
  <div class="end-page">
    <h2>Thanks so much for taking part!</h2>
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
      this.$db
        .collection('misc')
        .doc('signups')
        .set(
          {
            [thing]: this.arrayUnion(this.email),
          },
          { merge: true },
        );

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
