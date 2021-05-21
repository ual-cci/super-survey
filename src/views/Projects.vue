<template>
<div class='is-fullheight'>
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu :projects="projectList"></admin-side-menu>

    <div id="projects" class="container column is-10">
      <div class="projects">
        <div class="intro">
          <div class="add">
            <input v-if="addProjectInputVisible"
                  v-model="newProjectName"
                  class="input" type="text" ref="newProjectInput"
                  v-on:keydown.enter="addProject"/>
            <a class="button is-primary"
                    :disabled="addProjectInputVisible && newProjectName === ''"
                    @click="addProject">
              <i class="fas fa-plus-circle"></i>
              Add New Project
            </a>
          </div>
        </div>

        <transition name="fade">
          <div v-if="projects" class="project-list">
            <project v-for="project in projectList" :key="project.id"
                    :project="project"
                    :user="user">
            </project>
          </div>
        </transition>
      </div>

      <prompt :show="!user.displayName"
              :intro="'Looks like this is the first time you\'ve signed in.'"
              :text="'What\'s your name?'"
              @set="setUserName">
      </prompt>
    </div>
  </section>
</div>
</template>

<script>
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import AdminNarrow from '@/components/Display/AdminNarrow.vue';
import AdminHeader from '@/components/Display/AdminHeader.vue';
import Project from '@/components/ProjectsDashboard/Project.vue';
import Prompt from '@/components/Prompt.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';

export default {
  name: 'projects',
  components: {
    AdminNarrow,
    AdminHeader,
    AdminSideMenu,
    Project,
    Prompt,
  },
  data() {
    return {
      addProjectInputVisible: false,
      newProjectName: '',
    };
  },
  computed: {
    user() {
      return this.$auth.currentUser;
    },
    projectList() {
      if (this.projects) {
        const projects = Object.values(this.projects);
        return projects.sort((a, b) => b.created - a.created);
      }
      return [];
    },
    ...mapState(['projects', 'loadedAllProjects']),
    ...mapGetters([
      'noProjects',
    ]),
  },
  methods: {
    addProject() {
      if (!this.addProjectInputVisible) {
        this.newProjectName = '';
        this.addProjectInputVisible = true;
        Vue.nextTick(() => {
          this.$refs.newProjectInput.focus();
        });
      } else if (this.newProjectName !== '') {
        const project = {
          name: this.newProjectName,
          created: new Date(),
          owner: {
            email: this.user.email,
          },
          visibleTo: [this.user.email],
          participation: null,
          consent: null,
          preambleStatus: 'disabled',
          demographicsStatus: 'disabled',
        };

        this.$db.collection('projects')
          .add(project)
          .then((docRef) => {
            project.id = docRef.id;
            this.$store.commit('addProject', Object.assign(project, { surveys: null }));
          });

        this.addProjectInputVisible = false;
      }
    },
    setUserName(value) {
      this.$auth.currentUser.updateProfile({
        displayName: value,
      }).then(() => {
        this.$forceUpdate();
      });
    },
  },
  created() {
    if (this.$auth.currentUser) {
      if (this.noProjects || !this.loadedAllProjects) {
        this.$store.commit('clearProjects');
        this.$db.collection('projects')
          .where('visibleTo', 'array-contains', this.user.email)
          .get()
          .then((snapshot) => {
            const projects = {};
            snapshot.forEach((doc) => {
              const project = doc.data();
              project.id = doc.id;
              project.created = new Date(project.created.seconds * 1000);
              project.surveys = null;
              projects[project.id] = project;
            });
            this.$store.commit('addProjects', projects);
          });
      }
    }
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
    float: right;
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
