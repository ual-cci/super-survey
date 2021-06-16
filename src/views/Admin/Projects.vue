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
  <confirm-popup ref='confirmDeletePopup' />
  <create-project-popup ref='createProjectPopup' />
</div>
</template>

<script>
import AdminHeader from '@/components/Display/AdminHeader.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';
import ProjectOverview from '@/components/ProjectsDashboard/ProjectOverview.vue';
import ConfirmPopup from '@/components/admin/popups/ConfirmPopup.vue';
import CreateProjectPopup from '@/components/admin/popups/CreateProjectPopup.vue';

export default {
  name: 'projects',
  components: {
    AdminHeader,
    AdminSideMenu,
    ProjectOverview,
    ConfirmPopup,
    CreateProjectPopup,
  },
  data() {
    return {
      sortedProjectList: [],
      /* projectList: [],
      newProjectName: '', */
    };
  },
  /* computed: {
    sortedProjectList() {
      return this.$store.getSortedProjectList;
    },
  }, */
  methods: {
    addProject() {
      console.log('Projects.addProject:');
      this.$refs.createProjectPopup.show();
    },
  },
  beforeMount() {
    console.log('Projects.vue beforeMount()');
    this.$store.dispatch('clearEditProject');
  },
  async created() {
    await this.$store.dispatch('loadDataForAdmin', this.$auth.currentUser);

    this.sortedProjectList = this.$store.getters.getSortedProjectList;
    console.log('sortedProjectList=', this.sortedProjectList);

    /* this.$store.dispatch('loadProjects')
      .then(() => {
        const { projectList } = this.$store.getters;
        console.log('Projects.created: projectList=', projectList);
        this.projectList = projectList;
      }); */
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

aside.menu {
  background-color: #eee;
}

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
