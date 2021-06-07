<template>
<div class='is-fullheight'>
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu></admin-side-menu>

    <div id="project-details" class="container column">
      <div v-if="project">
        <h1>{{project.name}}</h1>
        <p>Has {{surveyCount}} surveys</p>
        <ul id='survey-list'>
          <survey-summary v-for="survey in surveyList" :key="survey.id" :v-model="surveyList" :survey="survey" />
        </ul>
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
import SurveySummary from '@/components/ProjectsDashboard/SurveySummary.vue';

export default {
  name: 'project-details',
  components: {
    AdminHeader,
    AdminSideMenu,
    SurveySummary,
  },
  props: {
    projectID: String,
  },
  data() {
    return {
      project: null,
      surveyList: [],
    };
  },
  computed: {
    surveyCount() {
      return this.surveyList.length;
    }
  },
  methods: {
    /* async setLoadedSurveys(projectID) {
      const surveys = await this.$store.dispatch('findProjectSurveys', projectID);
      console.log('ProjectDetails.setLoadedSurveys: surveys=', surveys);
      this.surveyList = surveys;
    }, */
    async setActiveProject(projectID) {
      const foundProject = await this.$store.dispatch('findEditProject', projectID);
      console.log('setting this.project=', foundProject);
      this.project = foundProject;
      // this.setLoadedSurveys(projectID);

      const surveys = await this.$store.dispatch('findProjectSurveys', projectID);
      console.log('ProjectDetails.setLoadedSurveys: surveys=', surveys);
      this.surveyList = surveys;
    },
  },
  watch: {
    $route(to) {
      console.log('ProjectDetails.route!');
      console.log('  to.params=', to.params);
      this.setActiveProject(to.params.projectID);
    },
  },
  async created() {
    console.log('ProjectDetails.created');

    await this.$store.dispatch('loadProjects');
    this.setActiveProject(this.projectID);
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

</style>
