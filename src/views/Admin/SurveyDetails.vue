<template>
<div class="is-fullheight">
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu></admin-side-menu>

    <div v-if="survey" id="survey-details" class="container column">
      <h1>{{survey.title}}</h1>

      <Tabs>
        <Tab name='Questions' :selected='true'>
          <p>
            <router-link :to="{
                        name: 'survey-designer',
                        params: { surveyID: survey.id }
              }">
              Go to Survey Designer.
            </router-link>
          </p>
          <p>
            Something about survey Questions
          </p>
        </Tab>
        <Tab name='Settings'>
          <h2>Publishing Status</h2>
          <p>
            This survey is <em>{{survey.status}}</em> status.
          </p>
          <p>
            Delete this survey&nbsp;
            <button  class='button delete-button' @click="doDeleteSurvey">Delete</button>
          </p>
        </Tab>
      </Tabs>
    </div>
  </section>
  
</div>
</template>

<script>
import { Tabs, Tab } from '@crow1796/vue-bulma-tabs';
import AdminHeader from '@/components/Display/AdminHeader.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'survey-details',
  components: {
    Tabs,
    Tab,
    AdminHeader,
    AdminSideMenu,
  },
  props: {
    surveyID: String,
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters({ 
      survey: 'getEditSurvey',
    }),
  },
  methods: {
    async doDeleteSurvey() {
      console.log('Surveys.doDeleteSurvey: survey=', this.survey);

      const okay = await this.$refs.confirmDeletePopup.show({
        title: 'Delete Survey?',
        message: `Confirm Survey "${this.survey.title}" delete? Once deleted the Survey will be gone forever`,
      });
      console.log('demoPopup: okay=', okay);
      if (okay) {
        await this.$store.dispatch('deleteSurvey', this.survey);
        this.$router.push({ name: 'projects' });
      }
    },
  },
  created() {
    this.$store.dispatch('loadDataForAdmin', this.$auth.currentUser);
  },
  async mounted() {
    console.log('SurveyDetails.mounted');
    await this.$store.dispatch('setEditSurveyByID', this.surveyID);
  }
};

</script>

<style lang="scss">
@import "@/styles/admin.scss";
</style>
