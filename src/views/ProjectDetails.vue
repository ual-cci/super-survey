<template>
<div class='is-fullheight'>
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu></admin-side-menu>

    <div id="project-details" class="container column">
      <div v-if="project">
        <h1>{{project.name}}</h1>
      </div>
      <div v-else>
        <h2>Project is loading...</h2>
      </div>
    </div>
  </section>
</div>
</template>

<script>

import AdminHeader from '@/components/Display/AdminHeader.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';
import Vue from 'vue';

export default {
  name: 'project-details',
  components: {
    AdminHeader,
    AdminSideMenu,
  },
  props: {
    projectID: String,
  },
  data() {
    return {
      project: null,
    };
  },
  methods: {
    setLoadedSurveys(projectID) {

    },
    setActiveProject(projectID) {
      return this.$store.dispatch('findEditProject', projectID)
        .then((foundProject) => {
          console.log('setting this.project=', foundProject);
          this.project = foundProject;
        });
    },
  },
  watch: {
    $route(to) {
      console.log('ProjectDetails.route!');
      console.log('  to.params=', to.params);
      this.setActiveProject(to.params.projectID);
    },
  },
  created() {
    console.log('ProjectDetails.created');

    this.$store.dispatch('loadProjects')
      .then(() => this.setActiveProject(this.projectID));
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

</style>
