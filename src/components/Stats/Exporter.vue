<template lang="html">
<div class="exporter">
  <p>
    <button class="button is-link" @click="download('answers')">
      Export survey answers
      <i v-if="fetching.answers" class="fa fa-spinner fa-pulse"></i>
    </button>
    <label class="checkbox">
      <input type="checkbox" v-model="numberAnswers">
      Answers as numbers
    </label>
    <label class="checkbox">
      <input type="checkbox" v-model="answerColumns">
      Separate checkboxes into columns
    </label>
  <p>
  <p>
    <button class="button is-link" @click="download('description')">
      Export survey description
      <i v-if="fetching.description" class="fa fa-spinner fa-pulse"></i>
    </button>
  </p>
</div>
</template>

<script>
import Vue from 'vue';
import download from 'downloadjs';

export default {
  props: {
    surveyID: String,
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      production: true,
      fetching: {},
      numberAnswers: false,
      answerColumns: false,
    };
  },
  methods: {
    download(thing) {
      Vue.set(this.fetching, thing, true);
      this.$auth.currentUser.getIdToken(true)
        .then((token) => {
          let baseURL = 'https://europe-west1-heartnsoul-asks.cloudfunctions.net/app';
          if (!this.production) {
            baseURL = 'http://localhost:5000/heartnsoul-asks/us-central1/app';
          }
          const url = `${baseURL}/survey/${thing}/${this.surveyID}?numbers=${this.numberAnswers}&columns=${this.answerColumns}`;

          fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then(response => response.blob())
            .then((blob) => {
              const filename = `${this.title}_${thing}.csv`;
              download(blob, filename, 'text/csv');
              Vue.set(this.fetching, thing, false);
            });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
label {
  padding: 8px;
}
p {
  margin-bottom: 1em;
}
</style>
