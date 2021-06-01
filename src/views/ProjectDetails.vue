<template>
<div class='is-fullheight'>
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu></admin-side-menu>

    <div id="project-details" class="container column">
      <h1>Project Details</h1>
      <template v-if="project">
        <h2>{{project.name}}</h2>
      </template>
      <template v-if="!project">
        <h2>Project is loading...</h2>
      </template>
      
      <h2>{{project}}</h2>
      
    </div>
  </section>
</div>
</template>

<script>

import AdminHeader from '@/components/Display/AdminHeader.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';
import Vue from 'vue';

export default {
  name: 'project-details',
  components: {
    AdminHeader,
    AdminSideMenu,
  },
  props: {
    projectID: String,
  },
  data() {
    return {
      project: null,
    };
  },
  /* computed: {
    projectLoaded() {
      return !!this.$store.state.admin.editProject;
    },
    project() {
      return this.$store.state.admin.editProject;
    },
  }, */
  methods: {
    setActiveProject(projectID) {
      return this.$store.dispatch('findEditProject', projectID)
        .then(() => {
          const project = this.$store.state.admin.editProject;
          console.log('setting this.project=', project);
          this.project = project;
        });
    },
  },
  watch: {
    $route(to) {
      console.log('ProjectDetails.route!');
      console.log('  to.params=', to.params);
      this.setActiveProject(to.params.projectID);
    },
  },
  created() {
    console.log('ProjectDetails.created');
    
    this.$store.dispatch('loadProjects')
      .then(() => {
        return this.setActiveProject(this.projectID);
      });
  },
  mounted() {
    console.log('ProjectDetails.mounted');

    /* window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.showConfirm = null;
        this.controlsVisible = null;
        this.displayPrompt = false;
      }
    }); */
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

$show-duration: 0.5s;
$title-width: 300px;
$row-height: 40px;

section.box {
  padding: 0px;
}

div.project-title {
  position: relative;
  padding: 6px 10px !important;
  margin: 0px !important;
  background: #dee;

  .status-summary {
    position: absolute;
    padding-top: 4px;
    left: calc(#{$title-width} + 11px);
    // padding-left: 400px;
  }

  .owner {
    color: #99b;
    float: right;
    margin-top: 3px;
  }

  &.click-enabled:hover {
    cursor: pointer;
  }

  i {
    transition: transform $show-duration ease-in-out;
    transform: rotate(0deg);
    color: #999;
  }

  i.visible {
    transform: rotate(90deg);
  }

}
.project-content {
  padding-bottom: 1px;
  .sections {
    padding: 0.75em;
    padding-bottom: 0;
    h2 {
      display: inline;
    }
    hr {
      margin: 0;
    }
  }
}

table {
  width: 100%;
  margin-bottom: 3px;

  thead tr th:first-child {
    width: $title-width;
  }

  tr {
    height: $row-height;
    th {
      vertical-align: bottom;
    }
    td {
      vertical-align: middle;
    }
  }

  tfoot {
    font-weight: bold;

    span:hover {
      cursor: pointer;
    }

    &td.is-disabled {
      color: #bbb;

      &:hover {
        cursor: default;
      }
    }
  }
}

div.survey-controls {
  min-width: unset;
}
.dropdown-trigger:hover {
  cursor: pointer;
}
</style>
