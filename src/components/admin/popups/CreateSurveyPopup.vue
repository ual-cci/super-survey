<template>
<modal-popup ref='popup'>
  <h2>Create New Survey</h2>
  <p v-if="project">Create new survey in <em>{{project.name}}</em>.</p>
  <input
    v-model="newSurveyTitle"
    class="input"
    type="text"
    ref="newSurveyInput"
    v-on:keydown.enter="okay" />

  <div class='btns'>
    <button @click="okay">Okay</button>&nbsp;
    <button @click="cancel">Cancel</button>
  </div>
</modal-popup>
</template>

<script>
import ModalPopup from './ModalPopup.vue';

export default {
  name: 'create-survey-popup',
  components: {
    ModalPopup,
  },
  data() {
    return {
      newSurveyTitle: '',
      project: null,
    };
  },
  methods: {
    show(project) {
      this.project = project;
      this.$refs.popup.open();
    },
    async okay() {
      this.$refs.popup.close();
      const payload = {
        surveyTitle: this.newSurveyTitle,
        project: this.project,
        user: this.$auth.currentUser,
      };
      await this.$store.dispatch('createSurveyInProject', payload);
      /* this.$router.push({
        name: 'survey-details',
        params: { surveyID: survey.id },
      }); */
    },
    cancel() {
      this.$refs.popup.close();
    },
  },
};
</script>

<style  lang="scss" scoped>
</style>
