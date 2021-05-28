<template>
<div class='is-fullheight'>
  <admin-header></admin-header>

  <section class="main-content columns is-fullheight">
    <admin-side-menu :projects="projectList"></admin-side-menu>

    <div id="project-details" class="container column">

      <section :key="project.name" class="box project">
        <div class="project-title" :class="{ 'click-enabled': surveysLoaded }">
          <span class="icon is-medium">
            <i v-if="surveysLoaded" class="fas fa-chevron-right"></i>
            <i v-else class="fa fa-spinner fa-pulse"></i>
          </span>
          <span class="title is-4" :title="project.id">{{ project.name }}</span>
          <span class="status-summary">{{ projectStatusSummary(project) }}</span>
          <span v-if="project.owner.email !== user.email" class="owner">
            {{ project.owner.email }}
          </span>
        </div>


        <div class="project-content">
          <div class="sections">
            <project-header :projectID="project.id"></project-header>
            <hr>
          </div>
          <table class="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Survey</th>
                <th>Status</th>
                <th>Created</th>
                <th>Answers</th>
                <th>Completed</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(survey, surveyIndex) in surveys" :key="survey.title">
                <td>
                  <div class="survey-title">
                    <input v-if="survey.title ==''" v-model="tempSurveyName"
                            class="input" ref="surveyTitle"
                            @keydown.enter="commitSurveyTitle(index=surveyIndex)"
                            @blur="commitSurveyTitle(index=surveyIndex)" />
                    <router-link v-else-if="survey.id"
                                  :to="{
                                    name: 'survey-designer',
                                    params: { surveyID: survey.id }
                                  }">
                      <b>{{ survey.title }}</b>
                    </router-link>
                  </div>
                </td>
                <td>
                  <a :href="`/survey/${survey.id}`" target="_blank">
                    {{ makeTitle(survey.status) }}
                  </a>
                </td>
                <td>{{ survey.created.toLocaleDateString("en-GB") }}</td>
                <td>{{ survey.answers || 0 }}</td>
                <td>{{ survey.completed || 0 }}</td>
                <td>
                  <router-link :to="{ name: 'survey-stats', params: { surveyID: survey.id } }">
                    <i class="fas fa-chart-bar"></i>Stats
                  </router-link>
                </td>
                <td>
                  <div class="dropdown is-right"
                        :class="{ 'is-active': controlsVisible === `survey-${survey.id}` }">
                    <div class="dropdown-trigger"
                          @click="controlsVisible = controlsVisible !== `survey-${survey.id}`
                                  ? `survey-${survey.id}` : false">
                      <span class="icon is-small">
                        <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                      </span>
                    </div>
                    <div class="dropdown-menu survey-controls" role="menu">
                      <div class="dropdown-content">
                        <a v-for="c in controlsForSurvey(survey)" :key="c"
                            class="dropdown-item"
                            @click="surveyEdit(c, survey)"
                            :class="{ 'has-text-danger': c === 'delete' }">
                          {{ makeTitle(c) }}
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>
                  <span @click="tempSurveyName === null
                              ? addSurvey(project.id) : null"
                              :class="{
                                'is-disabled': tempSurveyName !== undefined
                              }">
                    <i class="fas fa-plus-circle"></i><span>Add new survey</span>
                  </span>
                <td>
                <td v-for="_ in 4" :key="_"></td>
                <td>
                  <div class="dropdown is-right"
                        :class="{ 'is-active': controlsVisible === 'project' }">
                    <div class="dropdown-trigger"
                          @click="controlsVisible = controlsVisible !== 'project' ? 'project' : false">
                      <span class="icon is-small">
                        <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                      </span>
                    </div>
                    <div class="dropdown-menu survey-controls" role="menu">
                      <div class="dropdown-content">
                        <a class="dropdown-item"
                            @click="displayPrompt = true">
                          Share project
                        </a>
                        <a class="dropdown-item has-text-danger"
                            @click="deleteProject(project)">
                          Delete project
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <confirm :message="showConfirm ? showConfirm.message : null"
                  @cancel="showConfirm = null"
                  @accept="showConfirm.func(); showConfirm = null">
        </confirm>
        <prompt :show="displayPrompt"
            :text="'Enter the email address of who you\'d like to share with'"
            :showCancel="true"
            :setText="'Share'"
            @set="shareProject"
            @cancel="displayPrompt = false">
        </prompt>
      </section>

    </div>
  </section>
</div>
</template>

<script>

import AdminHeader from '@/components/Display/AdminHeader.vue';
import AdminSideMenu from '@/components/AdminSideMenu.vue';
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import slugify from 'slugify';
import Confirm from '@/components/Confirm.vue';
import Prompt from '@/components/Prompt.vue';
import ProjectHeader from '@/components/ProjectsDashboard/ProjectHeader.vue';

export default {
  name: 'project-details',
  components: {
    AdminHeader,
    AdminSideMenu,
    ProjectHeader,
    Confirm,
    Prompt,
  },
  props: {
    projectID: String,
  },
  data() {
    return {
      tempSurveyName: null,
      controlsVisible: null,
      surveyControls: ['rename', 'copy', 'close', 'delete'],
      showConfirm: null,
      displayPrompt: false,
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
    surveysLoaded() {
      return !!this.project.surveys;
    },
    ...mapState({
      surveys(state) {
        return state.editSurveys; //state.projects[this.project.id].surveys;
      },
    }),
    ...mapGetters(['projectHasSurveys']),
    ...mapState(['project']),
  },
  watch: {
    /* hidden() {
      this.surveys.forEach((survey) => {
        if (this.hidden) {
          if (survey.stopCompletedUpdates) {
            survey.stopCompletedUpdates();
          }
        } else {
          const completedRef = this.$db.doc(`/surveys/${survey.id}/public/stats`);
          const updateCompleted = (d) => {
            const { completed, answered } = d.data();
            survey.completed = completed;
            survey.answers = answered;
            this.$forceUpdate();
          };

          survey.stopCompletedUpdates = completedRef.onSnapshot(updateCompleted);
        }
      });
    }, */
  },
  methods: {
    addSurvey() {
      this.$store.commit('addSurvey', {
        project: this.project,
        survey: {
          title: '',
          slug: '',
          created: new Date(),
          forceDemographics: false,
          showLogo: true,
          showTitle: true,
          showSignup: true,
          demographicsFirst: false,
          status: 'draft',
          target: 'survey',
        },
      });
      this.tempSurveyName = '';

      Vue.nextTick(() => {
        this.$refs.surveyTitle.forEach((e) => {
          e.focus();
        });
      });
    },
    commitSurveyTitle(index = null) {
      const surveyIndex = index !== null ? index : this.surveys.length - 1;
      const survey = this.surveys[surveyIndex];

      if (survey.title === '') {
        if (this.tempSurveyName === '') {
          this.$store.state.projects[this.project.id].surveys.splice(-1, 1);
        } else {
          survey.title = this.tempSurveyName;
          survey.slug = slugify(survey.title, { lower: true });

          if (survey.id === undefined) {
            // first time edit
            const surveyDoc = Object.assign(survey, {
              owner: {
                email: this.user.email,
              },
              project: {
                name: this.project.name,
                id: this.project.id,
              },
            });

            this.$db.collection('surveys').add(surveyDoc).then((docRef) => {
              Vue.set(survey, 'id', docRef.id);
              survey.project = { id: this.project.id };
              this.controlsVisible = null;
            });
          } else {
            // rename
            const { title, slug } = survey;
            [
              `/surveys/${survey.id}`,
              `/surveys/${survey.id}/public/survey`,
            ].forEach((d) => {
              this.$db.doc(d).get().then((doc) => {
                if (doc.exists) {
                  doc.ref.update({
                    title,
                    slug,
                  });
                }
              });
            });
          }
        }
      }
      this.tempSurveyName = null;
    },
    projectStatusSummary() {
      const { surveys } = this.project;

      if (surveys === undefined) {
        return 'OwO';
      } if (surveys.length === 0) {
        return 'No surveys yet';
      }

      const counts = {};
      surveys.forEach((survey) => {
        if (counts[survey.status] === undefined) {
          counts[survey.status] = 1;
        } else {
          counts[survey.status] += 1;
        }
      });
      const parts = Object.keys(counts).sort().map(status => `${counts[status]} ${this.makeTitle(status)}`);

      return parts.join(', ');
    },
    surveyEdit(type, survey) {
      this[`${type}Survey`].call(this, survey);
      this.controlsVisible = null;
    },
    renameSurvey(survey) {
      this.tempSurveyName = survey.title;
      survey.title = '';
      Vue.nextTick(() => {
        this.$refs.surveyTitle.forEach((e) => {
          e.focus();
        });
      });
    },
    copySurvey(survey) {
      const copy = Object.assign({}, survey);
      copy.title += ' copy';
      copy.created = new Date();
      copy.status = 'draft';
      copy.completed = copy.answers = 0;

      ['id', 'stopCompletedUpdates'].forEach((p) => {
        delete copy[p];
      });

      this.surveys.push(copy);

      this.$db.collection('surveys').add(copy).then((docRef) => {
        Vue.set(copy, 'id', docRef.id);
        this.controlsVisible = null;
      });
    },
    closeSurvey(survey) {
      Vue.set(survey, 'status', 'closed');

      this.$db.collection('surveys').doc(survey.id).update({
        status: 'closed',
      });

      this.$db.collection('surveys').doc(survey.id)
        .collection('public').doc('survey')
        .update({
          live: false,
        });
    },
    openSurvey(survey) {
      Vue.set(survey, 'status', 'draft');

      this.$db.collection('surveys').doc(survey.id).update({
        status: 'draft',
      });
    },
    deleteSurvey(survey) {
      this.showConfirm = {
        message: `delete ${survey.title}`,
        func: () => {
          this.$db.collection('surveys').doc(survey.id).delete();

          for (let i = 0; i < this.surveys.length; i++) {
            if (this.surveys[i].id === survey.id) {
              this.surveys.splice(i, 1);
              break;
            }
          }
        },
      };
    },
    deleteProject(project) {
      this.showConfirm = {
        message: `delete ${project.name} and all its surveys`,
        func: () => {
          this.$db.collection('projects').doc(project.id).delete();

          this.$store.commit('deleteProject', project);
        },
      };
      this.controlsVisible = null;
    },
    shareProject(email) {
      this.$db.collection('projects').doc(this.project.id).update({
        visibleTo: this.arrayUnion(email),
      }).then(() => {
        this.displayPrompt = false;
      });
    },
    controlsForSurvey(survey) {
      const controls = [...this.surveyControls];
      if (survey.status === 'closed') {
        controls[controls.indexOf('close')] = 'open';
      }
      return controls;
    },
  },
  created() {
    this.$db.collection('projects').doc(this.projectID)
      .get()
      .then((doc) => {
        const project = doc.data();
        console.log('loaded project: ', project);

        project.id = this.projectID;
        this.$store.commit('setEditProject', project);
        this.project = project;
        //this.$store.state.project = project;
        console.log('   state:', this.$store.state);

        this.$db.collection('surveys')
          .where('project.id', '==', project.id)
          .where('target', '==', 'survey')
          .get()
          .then((snapshot) => {
            const surveys = [];
            snapshot.forEach((surveyDoc) => {
              const survey = surveyDoc.data();
              survey.created = survey.created.toDate();
              survey.id = doc.id;
              surveys.push(survey);
            });

            console.log('  surveys:', surveys);
            surveys.sort((a, b) => a.created - b.created);
            //this.$store.commit('setSurveys', { project, surveys });
            this.$store.commit('setEditSurveys', surveys);
            this.surveys = surveys;
          })
          .catch((err) => {
            console.log(err);
          });
      });
  },
  mounted() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.showConfirm = null;
        this.controlsVisible = null;
        this.displayPrompt = false;
      }
    });
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
