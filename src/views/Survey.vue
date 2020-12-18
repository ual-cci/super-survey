<template>
<public-container>
  <div v-if="$auth.currentUser" class="admin-header green-element">
    Designer mode: anwers won't be saved &amp; questions are live reloaded
  </div>
  <div class="survey-container">
    <header>
      <img v-if="survey.showLogo" src="/img/logo.png">
      <h1 v-if="survey.showTitle" class="subtitle is-3">{{ $store.state.survey.title }}</h1>
    </header>
    <survey-styler></survey-styler>
    <div v-if="survey.pages" class="survey">
      <participation v-if="preamble === 'participation'"
                      :value="survey.participation"
                      @finish="nextPreamble">
      </participation>
      <consent v-else-if="preamble === 'consent'"
                :value="survey.consent"
                @finish="nextPreamble">
      </consent>
      <div v-else-if="surveyPage < survey.endPage" class="">
        <div v-for="element in currentPage" :key="element.id"
              class="element" :class="{
                box: element.type === 'question',
                [`${element.type}_`]: true,
                [element.elementClass]: globalElementClass === 'default-element',
              }">
          <survey-element :element="element"></survey-element>
          <answer v-if="element.type === 'question'"
                  ref="answer"
                  :question="element"
                  @update="answerUpdated">
          </answer>
        </div>
        <footer>
          <button class="button is-info" :disabled="!canContinue"
                  @click="nextPage">Continue</button>
        </footer>
      </div>
      <end-page v-else></end-page>
    </div>
  </div>
</public-container>
</template>

<script>
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import PublicContainer from '@/components/Display/PublicContainer.vue';
import Participation from '@/components/Public/Participation.vue';
import Consent from '@/components/Public/Consent.vue';
import SurveyElement from '@/components/Public/SurveyElement.vue';
import Answer from '@/components/Public/Answer.vue';
import SurveyStyler from '@/components/Public/SurveyStyler.vue';
import EndPage from '@/components/Public/EndPage.vue';

export default {
  name: 'survey',
  components: {
    PublicContainer,
    Participation,
    Consent,
    SurveyElement,
    Answer,
    SurveyStyler,
    EndPage,
  },
  props: {
    surveyID: String,
  },
  data() {
    return {
      preamble: null,
      answers: {},
      canContinue: false,
      consentDeclined: false,
      startedDemographics: false,
      preambleOrder: [null, 'participation', 'consent'],
    };
  },
  computed: {
    currentPage() {
      const elements = this.survey.pages && this.survey.pages[this.surveyPage];
      if (elements) {
        return elements.filter(this.displayElement);
      }
      return [];
    },
    statsDocRef() {
      return this.$db.collection('surveys').doc(this.surveyID)
        .collection('public').doc('stats');
    },
    ...mapState(['survey', 'user']),
    ...mapState({
      globalElementClass: state => state.surveyElementClass,
      surveyPage: state => state.historyPoints.surveyPage,
    }),
    ...mapGetters(['validUser', 'donePreamble', 'isAdmin', 'surveyInfo']),
  },
  watch: {
    surveyPage() {
      Vue.nextTick(() => {
        const answers = this.$refs.answer;
        if (answers) {
          answers.forEach((a) => {
            a.restore(this.answers[a.question.id]);
          });
        }
      });

      window.scroll(0, 0);
    },
    currentPage() {
      this.$nextTick(() => {
        const answers = this.$refs.answer;
        if (answers) {
          this.canContinue = answers.every(a => a.validAnswer);
        } else {
          // no questions
          this.canContinue = true;
        }
      });
    },
  },
  methods: {
    nextPage() {
      // save likerts that might not have been explicitly answered
      Object.values(this.answers).forEach((a) => {
        if (a.softUpdate) {
          a.softUpdate = false;
          this.answerUpdated(a);
        }
      });

      let page = this.surveyPage;
      const branches = this.survey.branches[page];
      let branched = false;
      if (branches) {
        for (let i = 0; i < branches.length; i += 1) {
          const branch = branches[i];
          if (this.satisfiesCondition(branch)) {
            if (branch.destination === 'end') {
              page = this.survey.endPage;
            } else {
              page = this.survey.questionPageMap[branch.destination];
            }
            branched = true;
            break;
          }
        }
      }
      if (!branched) {
        page += 1;
      }

      // skip demographics if we need to
      if (page === this.survey.demographicsStartPage) {
        if (this.user.completedDemographics
            && this.user.completedDemographics.includes(this.survey.project.id)
            && !this.survey.forceDemographics) {
          page = this.survey.endPage;
        }
        this.startedDemographics = true;
      }

      if (page >= this.survey.endPage) {
        // mark survey completed
        if (this.validUser) {
          this.incrementStat('completed');
        }
      }

      this.$store.commit('history', { surveyPage: page });
    },
    answerUpdated(answer) {
      // don't save answer if it's a default and we've already got it
      if (!(answer.default && this.answers[answer.question.id] !== undefined)) {
        Vue.set(this.answers, answer.question.id, answer.$data);
      }

      if (this.validUser && !answer.softUpdate) {
        const data = this.removeNulls(answer.$data);
        const payload = Object.assign({}, this.surveyInfo, data);
        payload.question = this.grabKeys(answer.question, [
          'id', 'number', 'target',
          'allowSkip', 'allowPass',
          'answerChoices', 'text',
        ]);
        payload.type = answer.type;
        payload.timestamp = new Date();

        let collection = 'answers';
        if (payload.project.id === 't3pZlxsyIg7QEfHAh6EN') {
          collection = 'creative-pack-answers';
        }
        this.$db.collection(collection).add(payload);
      }

      const answers = this.$refs.answer;
      if (answers) {
        this.canContinue = answers.every(a => a.validAnswer);
      }
    },
    satisfiesCondition({ source, predicate, test }) {
      const answer = this.answers[source];
      if (answer && answer.text) {
        let answerText = answer.text;
        if (Array.isArray(answerText)) {
          if (answerText.length === 0) {
            return false;
          }
          answerText = answerText.join(' ');
        }
        switch (predicate) {
          case 'is-not-exactly':
            return answerText !== test;
          case 'is-exactly':
            return answerText === test;
          case 'contains':
            return !!answerText.match(test);
          case 'does-not-contain':
            return !answerText.match(test);
          default:
            return false;
        }
      }
      return false;
    },
    nextPreamble(success = true) {
      if (!success) {
        if (this.preamble === 'consent') {
          if (this.validUser) {
            this.statsDocRef.update({
              declinedUsers: this.arrayUnion(this.user.id),
            });
          }
        }
        this.preamble = null;
        this.consentDeclined = true;
        this.$store.commit('history', { surveyPage: this.survey.endPage });
        return;
      }

      const skip = p => p === null || p === '<p></p>';

      const index = this.preambleOrder.indexOf(this.preamble);
      let next = null;

      if (this.isAdmin || !this.donePreamble) {
        for (let i = index + 1; i < this.preambleOrder.length; i++) {
          const preamble = this.preambleOrder[i];
          if (!skip(this.survey[preamble])) {
            next = preamble;
            break;
          }
        }
      }

      if (this.validUser && !next) {
        this.incrementStat('starts');
      }

      if (next === null) {
        this.$store.commit('history', { surveyPage: 1, dontUpdate: !this.consentDeclined });
      }

      this.preamble = next;
      window.scrollTo(0, 0);
    },
    incrementStat(key) {
      // make sure key is in the doc already, or you'll end up with NaNs
      this.$db.runTransaction(transaction => transaction.get(this.statsDocRef).then((doc) => {
        const incremented = doc.data()[key] + 1;
        transaction.update(this.statsDocRef, {
          [key]: incremented,
        });
      }));

      const payload = {
        [key]: this.arrayUnion({
          survey: this.surveyID,
          timestamp: new Date(),
        }),
      };

      if (key === 'completed') {
        payload.completedSurveys = this.arrayUnion(this.surveyID);
        if (this.startedDemographics) {
          payload.completedDemographics = this.arrayUnion(this.survey.project.id);
        }
        this.$db.collection('users').doc(this.user.id).update(payload);
      } else {
        // hack, delay this a bit so we can create the user if needs be
        setTimeout(() => {
          this.$db.collection('users').doc(this.user.id).update(payload);
        }, 2500);
      }
    },
    displayElement(element) {
      if (element.type === 'question') {
        if (element.condition) {
          return this.satisfiesCondition(element.condition);
        }
      }
      return true;
    },
  },
  created() {
    this.$route.params.page = Number(this.$route.params.page || 1);
    const docRef = this.$db.doc(`/surveys/${this.surveyID}/public/survey`);

    docRef.get()
      .then((doc) => {
        if (doc.exists) {
          const payload = doc.data();

          if (this.$auth.currentUser || payload.live) {
            this.$store.state.survey = payload;
            this.$store.state.survey.id = this.surveyID;
            this.nextPreamble();
          } else {
            this.$router.push({ name: 'landing' });
          }
        } else {
          // no doc
        }
      })
      .catch(() => {
        // TODO: can't load survey, posssibly wrong id
      });

    if (this.validUser) {
      this.incrementStat('loads');
    }

    window.history.replaceState(this.$store.state.historyPoints, null);

    window.onpopstate = ({ state }) => {
      const data = { ...state, dontUpdate: true };
      if (this.consentDeclined) {
        this.preamble = 'consent';
      }
      this.$store.commit('history', data);
    };

    if (this.isAdmin) {
      docRef.onSnapshot((doc) => {
        this.$store.state.survey = doc.data();
        this.answers = {};
      });
    }
  },
};
</script>

<style lang="scss">
@import "@/styles/public/main.scss";

div.survey {
  padding: 5px;

  div.survey-element, div.consent, div.participation {
    p:not(:first-child) {
      margin-bottom: 1em;
    }

    p:after { // trick to give empty paragraph a height
      content: "";
      display: inline-block;
      width: 0px;
    }

    p:first-child:after {
      content: unset;
    }

    h1:not(:first-child), h2:not(:first-child), h3:not(:first-child) {
      margin-top: 1em;
    }
  }

  .element {
    border-radius: 10px;

    &.question_ {
      background: none;
    }

    &.heading_ {
    }

    &.description_ {
    }
  }

  footer {
    text-align: right;
    padding: 10px;
  }

  i.far, i.fas {
    font-size : 1.2rem;
  }

  button, div.box {
    border: 1px solid #000;
  }

  img, video {
    display: block;
    margin: 0 auto;
  }
}

.survey-container {
  position: relative;
  header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-top: 35px;

    img {
      width: 150px;
      margin-right: 20px;
    }
    h1 {
    }
  }
}

@media only screen and (max-width:768px) {
  div.survey {
    .element {
      // padding: 20px 25px;
      box-shadow: none;
    }
  }
}

.admin-header {
  color: $arcade-green;
  text-align: center;
  font-size: 0.8rem;
  padding: 5px;
  border: 1px solid $arcade-green;
  border-radius: 5px;
  margin-bottom: 5px;
}


</style>
