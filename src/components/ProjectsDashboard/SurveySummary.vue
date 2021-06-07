<template>
<li class='survey-overview'>
  <h2>
    <router-link :to="surveyLinkArgs()">
              {{survey.title}}
    </router-link>
  </h2>
</li>
</template>

<script>

export default {
  name: 'survey-overview',
  components: {
  },
  methods: {
    surveyLinkArgs() {
      return {
        name: 'survey-designer',
        params: { surveyID: this.survey.id },
      };
    },
  },
  props: {
    survey: Object,
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

</style>
