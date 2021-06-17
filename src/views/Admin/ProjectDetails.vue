<template>
<div class='is-fullheight'>
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu></admin-side-menu>

    <div id="project-details" class="container column">
      <h1 v-if="project">{{project.name}}</h1>

      <Tabs>
        <Tab name='Surveys' :selected='true'>
          <div v-if="project">
            <p>Has {{surveyCount}} surveys</p>
            <ul id='survey-list'>
              <survey-summary
                v-for="survey in surveyList"
                :key="survey.id"
                :v-model="surveyList"
                :survey="survey" />
            </ul>
          </div>
          <div v-else>
            <h2>Project is loading...</h2>
          </div>

        </Tab>
        <Tab name='Settings'>
          <p>
            Delete project and all surveys within
            <button class='button delete-button' @click="doDeleteProject">Delete</button>
          </p>
        </Tab>
      </Tabs>
    </div>
  </section>

  <confirm-popup ref='confirmDeletePopup' />
</div>
</template>

<script>

import { Tabs, Tab } from '@crow1796/vue-bulma-tabs';
import AdminHeader from '@/components/Display/AdminHeader.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';
import SurveySummary from '@/components/ProjectsDashboard/SurveySummary.vue';
import ConfirmPopup from '@/components/admin/popups/ConfirmPopup.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'project-details',
  components: {
    Tabs,
    Tab,
    AdminHeader,
    AdminSideMenu,
    SurveySummary,
    ConfirmPopup,
  },
  props: {
    projectID: String,
  },
  data() {
    return {
      surveyList: [],
    };
  },
  computed: {
    surveyCount() {
      return this.surveyList.length;
    },
    ...mapGetters({ project: 'getEditProject' }),
  },
  methods: {
    /* async setLoadedSurveys(projectID) {
      const surveys = await this.$store.dispatch('findProjectSurveys', projectID);
      console.log('ProjectDetails.setLoadedSurveys: surveys=', surveys);
      this.surveyList = surveys;
    }, */
    /* async setActiveProject(projectID) {
      const foundProject = await this.$store.dispatch('findEditProject', projectID);
      console.log('setting this.project=', foundProject);
      this.project = foundProject;
      // this.setLoadedSurveys(projectID);

      const surveys = await this.$store.dispatch('findProjectSurveys', projectID);
      console.log('ProjectDetails.setLoadedSurveys: surveys=', surveys);
      this.surveyList = surveys;
    }, */
    async doDeleteProject() {
      console.log('Projects.doDeleteProject: project=', this.project);

      const okay = await this.$refs.confirmDeletePopup.show({
        title: 'Delete Project?',
        message: `Confirm project "${this.project.name}" delete? Once deleted the project (and surveys) will be gone forever`,
      });
      console.log('demoPopup: okay=', okay);
      if (okay) {
        await this.$store.dispatch('deleteProject', this.project);
        this.$router.push({ name: 'projects' });
      }
    },
  },
  watch: {
    $route(to) {
      console.log('ProjectDetails.route!');
      console.log('  to.params=', to.params);
      // this.setActiveProject(to.params.projectID);
      this.$store.dispatch('setEditProjectByID', to.params.projectID);
    },
  },
  created() {
    console.log('ProjectDetails.created');

    return this.$store.dispatch('loadDataForAdmin', this.$auth.currentUser);
  },
  mounted() {
    console.log('ProjectDetails.mounted');
    this.$store.dispatch('setEditProjectByID', this.projectID);
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

</style>
