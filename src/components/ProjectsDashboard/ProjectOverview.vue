<template>
<li class='project-overview'>
  <h2>
    <router-link :to="projectLinkArgs()">
              {{project.name}}
    </router-link>
  </h2>
  <!-- 
    FIXME: survey counts should be generated algorithmically
      so proper english grammar can be observed
  -->
  <p>{{surveyCount}} surveys, {{liveSurveyCount}} are live.</p>
</li>
</template>

<script>

export default {
  name: 'project-overview',
  props: {
    project: {
      required: true,
      type: Object,
    },
  },
  components: {
  },
  computed: {
    surveyCount() {
      const counter = this.$store.getters.getProjectSurveyCount;
      return counter(this.project);
    },
    liveSurveyCount() {
      const counter = this.$store.getters.getProjectLiveSurveyCount;
      return counter(this.project);
    },
  },
  methods: {
    projectLinkArgs() {
      return {
        name: 'project-details',
        params: { projectID: this.project.id },
      };
    },
  },
  created() {
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

.project-overview {
  list-style-type: none;
  margin-bottom: 2em;
}


</style>
