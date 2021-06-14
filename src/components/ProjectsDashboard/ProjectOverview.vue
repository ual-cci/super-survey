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
  props: {
    project: {
      required: true,
      type: Object,
    },
  },
  components: {
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
  margin-bottom: 1em;

  &:hover {
    background-color: #eee;
  }
}


</style>
