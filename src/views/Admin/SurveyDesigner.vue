<template>
<div class="columns">
  <div class="column left-column">
    <router-link :to="{ name: 'projects' }">
      <img src="/img/logo.png" alt="">
    </router-link>

    <span class="heading">Elements</span>
    <draggable v-if="isEditable" class="columns is-gapless is-multiline is-mobile"
               :group="{ name: 'g', pull: 'clone', put: false }"
               :sort="false">
      <div v-for='e in availableElements' :key="e.name"
           class="column" :class="`is-${e.width}`" :data-type="e.type">
        <div class="add-element-container">
          <a class="button" :class="e.cls"
             @click="appendElement({ type: e.type })">
            <span v-if="e.icon" class="icon">
              <i class="fas" :class="e.icon"></i>
            </span>
            <span>{{ e.name }}</span>
          </a>
        </div>
      </div>
    </draggable>

    <template v-if="survey.target === 'survey'">
      <span class="heading">Settings</span>
      <div v-if="survey.target === 'survey'" class="left-align extra-settings">
        <label class="checkbox">
          <input type="checkbox"
                 v-model="survey.forceDemographics"
                 @change="reflowElements()">
          Reissue demographics
        </label>
        <label class="checkbox">
          <input type="checkbox"
                 v-model="survey.showLogo"
                 @change="reflowElements()">
          Show logo
        </label>
        <label class="checkbox">
          <input type="checkbox"
                 v-model="survey.showTitle"
                 @change="reflowElements()">
          Display title
        </label>
        <label class="checkbox">
          <input type="checkbox"
                 v-model="survey.showSignup"
                 @change="reflowElements()">
          Show signups
        </label>
        <label class="checkbox">
          <input type="checkbox"
                 v-model="survey.demographicsFirst"
                 @change="reflowElements()">
          Demographics first
        </label>
      </div>
    </template>

    <span class="heading">Stored questions</span>
    <div  class="question-bank">
      <p class="control has-icons-left">
        <input class="input" type="text" placeholder="Search for a question"
                v-model="questionFilter">
        <span class="icon is-left">
          <i class="fas fa-search" aria-hidden="true"></i>
        </span>
      </p>
      <div class="inner">
        <ul>
          <li v-for="question in filteredQuestionBank"
              :key="question.id"
              class="box question"
              @click="addQuestionFromBank(question)">
            {{ question.text }}
          </li>
        </ul>
      </div>
    </div>
  </div> <!-- end left column -->

  <div v-if="loading" class="question-editor loading">
    <span>
      <i class="fa fa-spinner fa-pulse"></i>
    </span>
  </div>
  <div v-else class="column is-rest question-editor">
    <header>
      <div v-if="isEditable" class="buttons settings">
        <a class="button" :class="{ 'is-link': isLive }"
           :href="`/survey/${survey.id}`" target="_blank">
          <span v-if="!isLive" class="icon">
            <i class="fas fa-play"></i>
          </span>
          <span>{{ isLive ? 'Live survey' : 'Preview' }}</span>
        </a>
        <div v-if="survey.target === 'survey'">
          <button class="button"
                  @click="survey.status = 'live'; reflowElements()"
                  :disabled="isLive || !isPublishable"
                  :title="isPublishable ?
                    'Make this survey live' :
                    'You need to complete the project before you publish'">
            <span class="icon">
              <i class="fas fa-upload"></i>
            </span>
            <span>{{ 'Publish' + (isLive ? 'ed' : '') }}</span>
          </button>
        </div>
        <div v-else-if="survey.target === 'demographics'">
          <button class="button" :class="{ 'is-primary': survey.status === 'complete'}"
                  @click="completeDemographics">
            <span class="icon">
              <i class="fas fa-check-square"></i>
            </span>
            <span>Complete</span>
          </button>
        </div>
      </div>
      <div class="project-name">
        <span v-if="survey.title" class="subtitle is-4 survey-title">
          {{ survey.title }}
        </span>
        <span class="subtitle is-6 has-text-grey-light changes"
        :class="{ visible: changesSaved }">
        All changes saved
      </span>
    </div>
    </header>
    <transition name="fade">
      <draggable v-if="elements.length > 0"
                  v-model="elements"
                  handle=".handle"
                  draggable=".draggable"
                  :disabled="!isEditable"
                  :group="'g'"
                  class="elements"
                  @start="drag = true" @end="reflowElements"
                  @add="insertElement">
        <wrapper  v-for="(el, index) in elements"
                  :class="{ draggable: index > 0 }"
                  @remove="removeElement(index)"
                  :type="el.type"
                  :key="el.id"
                  :index="index"
                  :element-class="el.elementClass"
                  :auto="el.autoPlaced"
                  :editable="isEditable">
            <component  :is="el.type"
                        :key="el.id"
                        :id="el.id"
                        :initial="el.value"
                        :number="el.number"
                        :index="index"
                        :editable="isEditable"
                        @empty="removeElement(index)"
                        @update="reflowElements"
                        ref="elements">
            </component>
        </wrapper>
      </draggable>
    </transition>
    <div>

    </div> <!-- button section -->
  </div>
  <confirm :message="showConfirm ? showConfirm.message : null"
            @cancel="showConfirm = null"
            @accept="showConfirm.func(); showConfirm = null">
  </confirm>
</div>
</template>

<script>
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import slugify from 'slugify';
import draggable from 'vuedraggable';
import Wrapper from '@/components/SurveyDesigner/Wrapper.vue';
import Description from '@/components/SurveyDesigner/Description.vue';
import Heading from '@/components/SurveyDesigner/Heading.vue';
import Page from '@/components/SurveyDesigner/Page.vue';
import Question from '@/components/SurveyDesigner/Question.vue';
import Styling from '@/components/SurveyDesigner/Styling.vue';
import Branch from '@/components/SurveyDesigner/Branch.vue';
import Confirm from '@/components/Confirm.vue';

export default {
  name: 'survey-designer',
  components: {
    draggable,
    Wrapper,
    Heading,
    Description,
    Question,
    Page,
    Styling,
    Branch,
    Confirm,
  },
  props: {
    surveyID: String,
  },
  data() {
    return {
      loading: false,
      isPublishable: false,
      availableElements: [
        {
          name: 'Question', icon: 'fa-plus-square', cls: 'is-success', width: 'half',
        },
        {
          name: 'Description', icon: 'fa-file-alt', cls: 'is-link', width: 'half',
        },
        {
          name: 'Heading', icon: 'fa-file-alt', cls: 'is-info', width: 'half',
        },
        {
          name: 'Styling', icon: 'fa-palette', cls: 'is-warning', width: 'half',
        },
        {
          name: 'Page', icon: 'fa-file', cls: 'is-primary', width: 'half',
        },
        {
          name: 'Section', icon: 'fa-hashtag', cls: 'is-link is-outlined', width: 'half',
        },
        {
          name: 'Branch', icon: 'fa-code-branch', cls: 'is-link is-outlined', width: 'half',
        },
      ],
      numPages: 0,
      questionFilter: '',
      currentElementClass: '#fff',
      changesSaved: false,
      showConfirm: null,
      cachedPayload: '',
      snapshotListener: null,
      lastSaveTimestamp: null,
      storeFullyLoaded: false,
    };
  },
  watch: {
    questionFilter() {
      if (!this.storeFullyLoaded) {
        this.loadStore();
      }
    },
  },
  computed: {
    filteredQuestionBank() {
      const regex = new RegExp(this.questionFilter, 'i');
      return this.$store.getters.filteredQuestions(regex);
    },
    isLive() {
      return this.survey && this.survey.status === 'live';
    },
    isEditable() {
      return this.survey && this.survey.status !== 'closed';
    },
    elements: {
      get() {
        return this.survey && this.survey.elements;
      },
      set(elements) {
        Vue.set(this.$store.state.survey, 'elements', elements);
      },
    },
    ...mapState(['survey', 'projects', 'demographics', 'questions']),
    ...mapGetters(['surveyFromID']),
  },
  methods: {
    nextID() {
      return Math.random().toString(16).slice(2);
    },
    insertElement({ newIndex, item }) {
      const { type } = item.dataset;
      item.remove();
      this.appendElement({ type }, newIndex);
    },
    appendElement(element, index = null) {
      const { type } = element;
      if (type === 'section') {
        this.appendElement({ type: 'heading', value: 'Section Heading' }, index);
        this.appendElement({
          type: 'description',
          value: 'Section Description',
        }, index = index ? index + 1 : null);
      } else {
        const newElement = Object.assign({
          id: this.nextID(),
          elementClass: this.currentElementClass,
        }, element);

        if (index === null) {
          this.elements.push(newElement);
        } else {
          this.elements.splice(index, 0, newElement);
        }

        if (type === 'page') {
          newElement.number = ++this.numPages;
        } else if (type === 'branch') {
          newElement.value = Object.assign({}, newElement.value, {
            pageNumber: this.numPages,
          });
        }
        if (['page', 'styling', 'question', 'branch'].some(t => type === t)) {
          this.reflowElements();
        }
      }
    },
    removeElement(index) {
      const element = this.elements[index];
      let showConfirm = true;
      if (element.type === 'question' || element.type === 'description') {
        showConfirm = element.value && element.value.text !== '';
      } else if (element.type === 'heading') {
        showConfirm = element.value !== '';
      }

      if (showConfirm) {
        this.showConfirm = {
          message: 'delete this element',
          func: () => {
            this.elements.splice(index, 1);
            Vue.nextTick(() => { this.reflowElements(); });
          },
        };
      } else {
        this.elements.splice(index, 1);
      }
    },
    addBranchPages() {
      this.$store.state.survey.elements = this.elements.filter(e => e.autoPlaced === undefined);

      let pageCounter = 1;
      const addedPages = new Set();
      const nextPageID = () => `page-${pageCounter}`;
      const addPage = (pos) => {
        if (!addedPages.has(pos)) {
          this.elements.splice(pos, 0, {
            type: 'page',
            id: nextPageID(),
            autoPlaced: true,
            number: pageCounter,
          });
          addedPages.add(pos);
        }
      };
      const branchDestinations = new Set();
      for (let i = 1; i < this.elements.length; i++) {
        const e0 = this.elements[i - 1];
        const e1 = this.elements[i];

        if (e0.type === 'page') {
          pageCounter++;
        }

        if (e1.type === 'branch') {
          branchDestinations.add(e1.value.destination);
        }

        if (e0.type === 'branch' && e1.type !== 'branch' && e1.type !== 'page') {
          addPage(i);
        }

        if (e1.type === 'question' && branchDestinations.has(e1.number)) {
          if (e0.type !== 'page') {
            addPage(i);
          }
        }
      }
      if (this.elements[this.elements.length - 1].type === 'branch') {
        addPage(this.elements.length);
      }
    },
    reflowElements(options = { save: true }) {
      this.addBranchPages();
      Vue.nextTick(() => {
        this.numPages = 0;
        let lastQuestion = null;
        let questionCounter = 0;
        const numberParts = {};
        this.currentElementClass = 'default-element';
        this.$store.state.questions = {};

        this.$refs.elements.map(e => e.getValue())
          .sort((a, b) => a.index - b.index)
          .forEach((e, i) => {
            if (this.elements[i]) {
            // we're still referencing this.elements[i]!
              const element = Object.assign(this.elements[i], e);
              if (element.type === 'page') {
                element.number = ++this.numPages;
                questionCounter = 0;
              } else if (element.type === 'question') {
                lastQuestion = element;

                // set question number
                const { condition } = element.value;
                if (condition && this.questions[condition.source]) {
                  const { number } = this.questions[condition.source];
                  if (numberParts[number] === undefined) numberParts[number] = 0;
                  numberParts[number]++;
                  const section = Array(numberParts[number]).fill('i').join('');
                  element.number = `${number}${section}`;
                } else {
                  element.number = this.questionNumber(this.numPages,
                    ++questionCounter, this.survey.target);
                  numberParts[element.number] = 0;
                }

                this.$store.state.questions[element.id] = element;
              } else if (element.type === 'styling') {
                this.currentElementClass = element.value;
              } else if (element.type === 'branch') {
                element.value.precedingQuestion = lastQuestion;
              }

              element.elementClass = this.currentElementClass;
            }
          });

        this.addBranchPages();
        if (options.save) {
          this.save();
        }
        this.$store.commit('syncSurveys');
      });
    },
    getPayload() {
      const { target } = this.survey;
      if (target === 'survey' || !target) {
        const payload = this.grabKeys(this, ['elements']);
        return this.grabKeys(this.survey, [
          'forceDemographics',
          'showLogo',
          'showTitle',
          'showSignup',
          'demographicsFirst',
          'status',
        ], payload);
      }
      if (target === 'demographics') {
        return { elements: this.elements };
      }
      return {};
    },
    save() {
      if (!this.isEditable) {
        return;
      }

      const payload = this.getPayload();
      const payloadJson = JSON.stringify(payload);
      if (payloadJson !== this.cachedPayload) {
        this.cachedPayload = payloadJson;
        payload.lastEdit = new Date();
        this.$db.collection('surveys').doc(this.survey.id)
          .update(payload)
          .then(() => {
            this.changesSaved = true;
            setTimeout(() => { this.changesSaved = false; }, 2000);
          })
          .catch(() => {
            console.log('no update!');
          });

        if (this.survey.target === 'survey') {
          this.savePublic();
        } else if (this.survey.target === 'demographics') {
          const survey = this.createPagedSurvey([this.survey]);
          this.$db.doc(`/surveys/${this.survey.id}/public/survey`)
            .set(survey, { merge: true });
        }
        this.lastSaveTimestamp = new Date();
      }
    },
    addQuestionFromBank(question) {
      this.appendElement({ type: 'question', value: question });
      this.reflowElements(); // upload
    },
    createPagedSurvey(surveys) {
      const output = {
        pages: {},
        questionPageMap: {},
        branches: {},
        endPage: 2,
        demographicsStartPage: null,
      };

      const elements = [];
      surveys.forEach((s) => {
        elements.push(...s.elements.map(e => Object.assign(e, { target: s.target })));
      });

      let currentPageNumber = 0;
      let questionCounter = 0;

      elements.forEach((element) => {
        let e = Object.assign({}, element);
        if (e.type === 'page') {
          output.pages[++currentPageNumber] = [];
          output.endPage = Math.max(output.endPage, currentPageNumber + 1);
        } else {
          if (element.type === 'question') {
            e = Object.assign(e, e.value);
            delete e.value;

            output.questionPageMap[e.number] = currentPageNumber;
            // flat array for choices
            e.answerChoices = e.answerChoices.map(a => a.value);
            e.hasOther = e.answerChoices.some(c => c.match(/^other$/i));
            e.index = questionCounter++;

            const sentences = e.text.match(/[^.!?:]+[.!?:]/g);
            if (sentences) {
              const questionsSentences = sentences.map(s => s.trim())
                .filter(sentence => sentence.includes('?'));
              e.questionSentence = questionsSentences[0] || sentences[0];
            }
          } else {
            // index might be useful for questions,
            // but we don't need it for anything else
            delete e.index;
          }

          if (e.target === 'demographics' && output.demographicsStartPage === null) {
            output.demographicsStartPage = currentPageNumber;
          }

          if (e.type === 'branch') {
            // put all branches for page in one place
            const value = Object.assign({}, e.value);
            try {
              output.branches[currentPageNumber].push(value);
            } catch (_) {
              output.branches[currentPageNumber] = [value];
            }
          } else {
            output.pages[currentPageNumber].push(e);
          }
        }
      });
      return output;
    },
    savePublic() {
      let payload = null;
      this.$store.dispatch('getProject', { id: this.survey.project.id })
        .then((project) => {
          payload = this.grabKeys(project, ['participation', 'consent']);
          payload.live = this.isLive;
          return this.grabKeys(this.survey, [
            'title',
            'project',
            'forceDemographics',
            'slug',
            'showLogo',
            'showTitle',
            'showSignup',
          ], payload);
        })
        .then(() => {
          const { demographicsID } = this.projects[payload.project.id];
          if (demographicsID) {
            return this.$db.collection('surveys').doc(demographicsID)
              .get();
          }
          return false;
        })
        .then((docRef) => {
          const surveys = [this.survey];
          if (docRef) {
            const demographics = docRef.data();
            if (this.survey.demographicsFirst) {
              surveys.unshift(demographics);
            } else {
              surveys.push(demographics);
            }
          }
          const pagedSurvey = this.createPagedSurvey(surveys);
          return Object.assign(payload, pagedSurvey);
        })
        .then((finalPayload) => {
          this.$db.doc(`/surveys/${this.survey.id}/public/survey`)
            .set(finalPayload, { merge: true });
        });
    },
    completeDemographics() {
      this.demographics[this.survey.id].status = 'complete';
      this.projects[this.survey.project.id].demographicsStatus = 'complete';
      this.$db.collection('surveys').doc(this.survey.id)
        .update({
          status: 'complete',
          completed: new Date(), // to force update
        });

      this.$db.collection('projects').doc(this.survey.project.id)
        .update({
          demographicsStatus: 'complete',
        });
    },
    init() {
      if (new Date() - this.lastSaveTimestamp < 300) {
        // let's say that if this gets called this quickly that it's been
        // called from its own snapshot update, so no need to init again
        return;
      }

      if ('elements' in this.survey) {
        this.numPages = this.elements.filter(e => e.type === 'page').length;
        this.elements.forEach((element) => {
          if (element.type === 'question') {
            this.$store.state.questions[element.id] = element;
          }
        });
      } else {
        // blank survey...
        this.elements = [];
        this.appendElement({ type: 'page' });
      }

      this.reflowElements({ save: false });

      /* this.$store.dispatch('findEditProject', this.survey.project.id)
        .then((project) => {
          this.isPublishable = project.preambleStatus === 'complete';
        }); */

      const project = this.$store.getters.getEditProjectMaybeBySurvey;
      this.isPublishable = project.preambleStatus === 'complete';

      this.loading = false;
    },
    loadStore(limit = null) {
      let collection = this.$db.collection('question-bank');

      if (limit !== null) {
        collection = collection.limit(limit);
      }

      collection.get()
        .then((snapshot) => {
          this.$store.commit('clearQuestionBank');
          snapshot.forEach((doc) => {
            this.$store.commit('addQuestion', doc.data());
          });

          if (limit === null) {
            this.storeFullyLoaded = true;
          }
        });
    },
  },
  async created() {
    await this.$store.dispatch('loadDataForAdmin', this.$auth.currentUser);
    await this.$store.dispatch('setEditSurveyByID', this.surveyID);

    const { surveyID } = this;
    const survey = this.surveyFromID(surveyID);
    if (!survey) {
      this.loading = true;
      const update = (doc) => {
        const data = doc.data();
        this.$store.state.survey = Object.assign(data, {
          id: surveyID,
          created: data.created.toDate(),
        });
        this.init();
        this.$store.state.demographics[doc.id] = this.$store.state.survey;
      };
      const surveyDocRef = this.$db.collection('surveys').doc(surveyID);
      this.snapshotListener = surveyDocRef.onSnapshot(update);
    } else {
      this.$store.state.survey = survey;
      this.init();
    }

    // fetch questions
    this.loadStore(10);

    this.availableElements.forEach((e, i) => {
      this.availableElements[i].type = slugify(e.name, { lower: true });
    });
  },
  beforeDestroy() {
    window.onscroll = null;
    if (this.snapshotListener) {
      this.snapshotListener();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/admin.scss";

.left-align {
  text-align: left;
}

.left-column {
  position: fixed;
  text-align: center;
  padding-top: 0px;
  max-width: 280px;
  padding-right: 0;
  img {
    display: block;
    width: 100px;
    margin: 5px auto;
    margin-bottom: 20px;
  }

  .extra-settings {
    margin-left: 8px;
    margin-bottom: 25px;

    label {
      display: block;
    }
  }
}

div.question-bank {
  top: 60px;
  transition: top 0.25s;
  padding: 0px 5px;
  padding-bottom: 50px;
  overflow: hidden;
  width: 100%;
  height: 50vh;


  .control input[type=text] {
    padding-left: 1.6em;
  }

  .inner {
    height: 100%;
    width: 100%;
    overflow-y: scroll;
    padding-right: 50px;
    box-sizing: content-box;
  }

  p.control {
    padding-right: 17px;
    padding-left: 4px;
  }

  li.question {
    text-align: left;
    padding: 5px 10px;
    margin: 10px 5px;
    &:hover {
      cursor: pointer;
      background: lighten($primary, 50%);
    }
  }
}

div.question-editor {
  position: relative;
  margin-left: 280px;
  $header-height: 48px;

  header {
    text-align: left;
    margin-bottom: 12px;
    .settings {
      float: right;
    }

    .survey-title {
      margin-right: 10px;
    }

    span.changes {
      display: inline-block;
      opacity: 0;
      transition: opacity 0.3s;
      &.visible {
        opacity: 1;
      }
    }
    .project-name {
      display: inline-block;
    }
  }

  .elements {
    margin-left: 2px;
    clear: right;

    .column.is-half {
      padding: 0;
      width: 100%;
    }
  }
}

.add-element-container {
  padding: 5px; //0 5px 5px 0;
  .button {
    width: 100%;
  }
}

label.checkbox {
  padding-right: 10px;
}

.loading {
  width: 100%;
  height: 60vh;
  text-align: center;
  span {
    font-size: 3em;
    color: #ccc;
    display: block;
    padding-top: 30vh;
  }
}


</style>
