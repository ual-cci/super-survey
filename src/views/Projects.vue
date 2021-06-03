<template>
<div class='is-fullheight'>
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu></admin-side-menu>

    <div id="projects" class="container column">
      <div class="projects">
        <h1>Projects</h1>

        <div v-if="projectList" class="project-list">
          <project-overview v-for="project in projectList" :key="project.id"
                      :project="project">
          </project-overview>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import AdminHeader from '@/components/Display/AdminHeader.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';
import ProjectOverview from '@/components/ProjectsDashboard/ProjectOverview.vue';

export default {
  name: 'projects',
  components: {
    AdminHeader,
    AdminSideMenu,
    ProjectOverview,
  },
  data() {
    return {
      projectList: [],
    };
  },
  /* computed: {
    projectList() {
      return this.$store.state.admin.projectList;
    },
  }, */
  methods: {
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

.container {

}

aside.menu {
  background-color: #eee;
}

#projects .projects {

  div.intro {
    margin-bottom: 20px;

    & h1.title {
      margin-bottom: 5px;
    }
    & h2.subtitle {
      padding-top: 5px;
    }
  }

  .add {
    input {
      max-width: 200px;
      display: inline-block;
      margin-right: 5px;
    }
  }

  .project-list {
    clear: both;
  }

  span, a {
    i.fas {
      margin-right: 5px;
    }
  }

  .survey-title.closed {
    color: #ddd;
  }
}

</style>
