<template>
<aside class="column menu is-2  section is-fullheight">
  <p class="menu-label">
    Projects
  </p>
  <div class="project-list">
    <ul class="menu-list" :key="fudge">
      <li v-for="project in projectList" :key="project.id">
        <router-link :to="{
                        name: 'project-details',
                        params: { projectID: project.id }
                      }"
                      :class="classForProjectLink(project)">
          {{project.name}}
        </router-link>
      </li>
    </ul>
  </div>
</aside>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'admin-side-menu',
  data() {
    return {
      fudge: 0,
    };
  },
  watch: {
    $route() {
      console.log('AdminSideMenu.route!');
      this.refreshView();
    },
  },
  computed: {
    ...mapGetters({
      projectList: 'getAdminProjectList',
      editProject: 'getAdminEditProject',
    }),
  },
  methods: {
    classForProjectLink(project) {
      if (project && this.editProject && project.id === this.editProject.id) {
        return 'is-active';
      }
      return '';
    },
    refreshView() {
      console.log('AdminSideMenu.refreshView');
      this.$forceUpdate();
      //this.fudge += 1;
      // const { projectList, editProject } = this.$store.state.admin;
      // this.projectList = projectList;
      // this.editProject = editProject;
    },
  },
  created() {
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

aside.menu {
  background-color: #eee;
}

</style>
