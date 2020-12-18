<template>
<header class="project-header">
  <div class="preamble buttons">
    <span class="button" @click="preambleVisibile = true">
      <span>{{ preambleSections.join(' & ') }}</span>
      <status-tag :status="project.preambleStatus"></status-tag>
    </span>
    <span class="button" @click="loadDemographics">
      <span>Demographics</span>
      <i v-if="creatingDemographics" class="fa fa-spinner fa-pulse"></i>
      <status-tag v-else :status="project.demographicsStatus"></status-tag>
    </span>
  </div>
  <div class="project-meta modal"
        :class="{ 'is-active': preambleVisibile }">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <div class="tabs is-medium">
          <ul>
            <li v-for="title in preambleSections" :key="title"
                :class="{ 'is-active': showing === title }"
                @click="showing = title">
              <a>{{ title }}</a>
            </li>
          </ul>
        </div>
        <div v-show="showing === 'Participation Information'">
          <p v-if="completed" v-html="preambleCache.participation"></p>
          <text-editor v-else ref="participation"
                        :parentAlive="true"
                        @update="$emit('update')">
          </text-editor>
        </div>
        <div v-show="showing === 'Consent'">
          <p v-if="completed" v-html="preambleCache.consent"></p>
          <text-editor v-else ref="consent"
                        :parentAlive="true"
                        @update="$emit('update')">
          </text-editor>
        </div>
        <div class="field is-grouped is-grouped-right">
          <p class="control">
            <a class="button is-danger"
                @click="action('cancel')">
              Cancel
            </a>
          </p>
          <template v-if="completed">
            <p class="control">
              <a class="button is-info" @click="action('edit', true)">
                Edit
              </a>
            </p>
          </template>
          <template v-else>
            <p class="control">
              <a class="button is-info" @click="action('draft')">
                Save draft
              </a>
            </p>
            <p class="control">
              <a class="button is-primary" @click="action('complete')">
                Complete
              </a>
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</header>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import TextEditor from '@/components/TextEditor.vue';
import StatusTag from '@/components/StatusTag.vue';

export default {
  name: 'project-meta',
  components: {
    TextEditor,
    StatusTag,
  },
  props: {
    projectID: String,
  },
  data() {
    return {
      preambleVisibile: false,
      showing: 'Participation Information',
      preambleSections: [
        'Participation Information',
        'Consent',
      ],
      preambleCache: {},
      creatingDemographics: false,
    };
  },
  computed: {
    completed() {
      return this.project.preambleStatus === 'complete';
    },
    ...mapState({
      project(state) {
        return state.projects[this.projectID];
      },
    }),
  },
  watch: {
    preambleVisibile(v) {
      if (v && !this.completed) {
        this.saveState();
      }
    },
  },
  methods: {
    loadDemographics() {
      if (this.project.demographicsStatus === 'disabled') {
        this.creatingDemographics = true;
        const survey = {
          target: 'demographics',
          title: `${this.project.name} Demographics`,
          owner: {
            email: this.$auth.currentUser.email,
          },
          project: {
            id: this.project.id,
          },
          created: new Date(),
          status: 'draft',
        };

        this.$db.collection('surveys')
          .add(survey)
          .then((docRef) => {
            const payload = {
              demographicsID: docRef.id,
              demographicsStatus: survey.status,
            };
            this.$db.collection('projects').doc(this.project.id).update(payload);
            Object.keys(payload).forEach((k) => {
              this.project[k] = payload[k];
            });

            survey.id = docRef.id;
            this.$store.commit('addDemographicsSurvey', survey);

            this.creatingDemographics = false;

            this.openDemographics();
          });
      } else {
        this.openDemographics();
      }
    },
    openDemographics() {
      this.$router.push({
        name: 'survey-designer',
        params: {
          surveyID: this.project.demographicsID,
        },
      });
    },
    action(type, keepOpen = false) {
      if (type === 'draft' || type === 'complete') {
        this.project.preambleStatus = type;
        const payload = {
          preambleStatus: this.project.preambleStatus,
        };

        ['participation', 'consent'].forEach((e) => {
          const html = this.$refs[e].getHTML().trim();
          if (html !== '' && html.trim() !== '<p></p>') {
            payload[e] = this.$refs[e].getHTML();
          } else {
            payload[e] = null;
          }
        });

        this.$db.collection('projects').doc(this.project.id).update(payload);
        this.saveState();
      } else if (type === 'cancel' && !this.completed) {
        const { participation, consent } = this.preambleCache;
        if (participation) {
          this.$refs.participation.editor.setContent(participation);
        }
        if (consent) {
          this.$refs.consent.editor.setContent(consent);
        }
      } else if (type === 'edit') {
        this.project.preambleStatus = 'draft';
        Vue.nextTick(() => {
          const { participation, consent } = this.preambleCache;
          this.$refs.participation.editor.setContent(participation);
          this.$refs.consent.editor.setContent(consent);
        });
      }
      if (!keepOpen) {
        this.preambleVisibile = false;
      }
    },
    saveState() {
      const preamble = {
        participation: this.$refs.participation.getHTML(),
        consent: this.$refs.consent.getHTML(),
      };
      Object.assign(this.project, preamble, { status: this.project.preambleStatus });
      this.preambleCache = JSON.parse(JSON.stringify(preamble));
    },
  },
  mounted() {
    const { participation, consent } = this.project;
    if (!this.completed) {
      this.$refs.participation.editor.setContent(participation);
      this.$refs.consent.editor.setContent(consent);
    } else {
      this.preambleCache = {
        participation,
        consent,
      };
    }
    window.addEventListener('keydown', (e) => {
      if (this.preambleVisibile && e.key === 'Escape') {
        this.action('cancel');
      }
    });
  },
};
</script>

<style lang="scss">
header.project-header .preamble.buttons {
  display: inline;
  .buttons {
    display: inline;
    margin-bottom: 0;
  }
  .button {
    border-width: 0;
    border-bottom-width: 1px;
    &:hover {
      background: #eee;
    }
    span:first-child {
      margin-right: 10px;
    }
  }
  span.button {
    color: #555;
    font-size: 1.1rem;
    font-weight: bold;
  }
}

.project-meta.modal .modal-content {
  width: 70% !important;
  max-width: 700px;

  hr {
    margin: 5px 0px;
  }
  h2 {
    margin-top: 10px;
  }
}

.project-meta {
  .tabs ul {
    margin: 0px;
    font-weight: bold;
    li:first-child {
      margin-top: 5px;
    }
  }
}

.project-meta .editor .editor-content {
  height: 250px;
  div {
    height: 100%;
    outline-width: 0px;
    border: 1px solid #ddd;
    border-radius: 5px;
    overflow-y: scroll;
  }
}

</style>
