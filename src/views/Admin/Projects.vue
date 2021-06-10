<template>
<div class='is-fullheight'>
  <admin-header></admin-header>
  
  <section class="main-content columns is-fullheight">
    <admin-side-menu></admin-side-menu>

    <div id="projects" class="container column">
      <div class="projects">
        <h1>Projects</h1>

        <ul v-if="projectList" class="project-list">
          <project-overview
            v-for="project in projectList"
            :key="project.id"
            :project="project"
            :delete-project-callback="doDeleteProject" />
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
      projectList: [],
      newProjectName: '',
    };
  },
  /* computed: {
    projectList() {
      return this.$store.state.admin.projectList;
    },
  }, */
  methods: {
    addProject() {
      console.log('Projects.addProject:');
      this.$refs.createProjectPopup.show();
    },
    async doDeleteProject(project) {
      console.log('Projects.doDeleteProject: project=', project);

      const okay = await this.$refs.confirmDeletePopup.show({
        title: 'Delete Project?',
        message: `Confirm project "${project.name}" delete? Once deleted the project (and surveys) will be gone forever`,
      });
      console.log('demoPopup: okay=', okay);
      if (okay) {
        this.$store.dispatch('deleteProject', project);
      }
    },
  },
  beforeMount() {
    console.log('Projects.vue beforeMount()');
    this.$store.dispatch('clearEditProject');
  },
  created() {
    this.$store.dispatch('loadProjects')
      .then(() => {
        const { projectList } = this.$store.getters;
        console.log('Projects.created: projectList=', projectList);
        this.projectList = projectList;
      });
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
