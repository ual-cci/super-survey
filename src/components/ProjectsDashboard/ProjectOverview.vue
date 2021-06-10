<template>
<li class='project-overview'>
  <h2>
    <router-link :to="projectLinkArgs()">
              {{project.name}}
    </router-link>
  </h2>
  <p>X surveys, Y are live.</p>
  <button class='delete-button' @click="deleteProjectCallback(project)">Delete</button>
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
    deleteProjectCallback: {
      required: true,
      type: Function,
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

  button {
    display: inline-block;
  }

  &:hover {
    background-color: #eee;
  }
}


</style>
