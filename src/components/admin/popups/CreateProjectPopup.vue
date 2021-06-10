<template>
<modal-popup ref='popup'>
  <h2>Create New Project</h2>
  <input
    v-model="newProjectName"
    class="input"
    type="text"
    ref="newProjectInput"
    v-on:keydown.enter="addProject" />

  <div class='btns'>
    <button @click="okay">Okay</button>&nbsp;
    <button @click="cancel">Cancel</button>
  </div>
</modal-popup>
</template>

<script>
import ModalPopup from './ModalPopup.vue';

export default {
  name: 'create-project-popup',
  components: {
    ModalPopup,
  },
  data() {
    return {
      newProjectName: '',
      resolvePromise: null,
      rejectPromise: null,
    };
  },
  methods: {
    show() {
      this.$refs.popup.open();
    },
    async okay() {
      this.$refs.popup.close();
      const payload = {
        projectName: this.newProjectName,
        user: this.$auth.currentUser,
      };
      const project = await this.$store.dispatch('addProject', payload);
      this.$router.push({
        name: 'project-details',
        params: { projectID: project.id },
      });
    },
    cancel() {
      this.$refs.popup.close();
    },
  },
};
</script>

<style  lang="scss" scoped>
</style>
