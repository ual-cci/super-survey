<template>
<li class='project-overview'>
  <h2>
    <router-link :to="projectLinkArgs()">
              {{project.name}}
    </router-link>
  </h2>
  <p>X surveys, Y are live.</p>
</li>
</template>

<script>

export default {
  name: 'project-overview',
  components: {
  },
  methods: {
    projectLinkArgs() {
      console.log(this.project);
      return {
        name: 'project-details',
        params: { projectID: this.project.id },
      };
    },
  },
  props: {
    project: Object,
  },
  created() {
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

.project-overview {
  list-style-type: none;
  margin-bottom: 1em;
}
</style>
