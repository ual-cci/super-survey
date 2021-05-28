// project overview
<template>
<li class='project-overview'>
  <h2>
    <router-link :to="projectLinkArgs()">
              {{project.name}}
    </router-link>
  </h2>
  <p>Some more stats about this project</p>
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
}
</style>
