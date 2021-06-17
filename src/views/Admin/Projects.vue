<template>
<div class='is-fullheight'>
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu></admin-side-menu>

    <div id="projects" class="container column">
      <div class="projects">
        <h1>Projects</h1>

        <ul v-if="sortedProjectList" class="project-list">
          <project-overview
            v-for="project in sortedProjectList"
            :key="project.id"
            :project="project" />
        </ul>
      </div>
      <div id='add-project'>
        <a class="button" @click="addProject">
          <i class="fas fa-plus-circle"></i>&nbsp;
          Add New Project
        </a>
      </div>
    </div>
  </section>
  <create-project-popup ref='createProjectPopup' />
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import AdminHeader from '@/components/Display/AdminHeader.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';
import ProjectOverview from '@/components/ProjectsDashboard/ProjectOverview.vue';
import CreateProjectPopup from '@/components/admin/popups/CreateProjectPopup.vue';

export default {
  name: 'projects',
  components: {
    AdminHeader,
    AdminSideMenu,
    ProjectOverview,
    CreateProjectPopup,
  },
  computed: {
    ...mapGetters({ sortedProjectList: 'getSortedProjectList' }),
  },
  methods: {
    addProject() {
      console.log('Projects.addProject:');
      this.$refs.createProjectPopup.show();
    },
  },
  beforeMount() {
    console.log('Projects.vue beforeMount()');
    this.$store.dispatch('setEditProjectByID', null);
  },
  async created() {
    await this.$store.dispatch('loadDataForAdmin', this.$auth.currentUser);
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

#projects {
  #add-project {
    input {
      max-width: 200px;
      display: inline-block;
      margin-right: 5px;
    }
  }
}

</style>
