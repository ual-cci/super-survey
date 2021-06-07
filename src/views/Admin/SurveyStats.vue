<template>
<admin-narrow>
<admin-header></admin-header>
  <div v-if="survey" class="stats">
    <h1 class="title is-2">{{ survey.title }}</h1>
    <button v-if="canLoad" class="load button is-medium" @click="load">Load Stats</button>
    <div v-if="questions && answers" class="">
      <table class="table quick-stats">
        <thead>
          <tr>
            <th>Loads</th>
            <th>Starts</th>
            <th>Completions</th>
            <th>Questions Answered</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ surveyStats.loads }}</td>
            <td>{{ surveyStats.starts }}</td>
            <td>{{ surveyStats.completed }}</td>
            <td>{{ surveyStats.questionsAnswered }}</td>
          </tr>
        </tbody>
      </table>
      <div v-for="question in questions" :key="question.id"
           class="question-and-answer box">
        <answer-stats :question="question"
                      :answers="answers[question.id]"
                      :showSensitiveInfo="showSensitiveInfo">
        </answer-stats>
      </div>
    </div>
    <p v-if="showSensitiveInfo">
      <router-link :to="{ name: 'answer-editor', params: { surveyID } }">
        Transcribe answers
      </router-link>
      <hr/>
    </p>
    <exporter :surveyID="surveyID" :title="survey.title"></exporter>
  </div>
</admin-narrow>
</template>

<script>
import Vue from 'vue';
import AdminNarrow from '@/components/Display/AdminNarrow.vue';
import AdminHeader from '@/components/Display/AdminHeader.vue';
import AnswerStats from '@/components/Stats/AnswerStats.vue';
import Exporter from '@/components/Stats/Exporter.vue';

export default {
  name: 'survey-stats',
  components: {
    AdminNarrow,
    AdminHeader,
    AnswerStats,
    Exporter,
  },
  props: {
    surveyID: String,
  },
  data() {
    return {
      canLoad: true,
      survey: null,
      questions: null,
      answers: null,
      surveyStats: {},
      updateHandles: [],
      showSensitiveInfo: false,
    };
  },
  computed: {
  },
  methods: {
    listenForUpdates(docRef, func) {
      this.updateHandles.push(docRef.onSnapshot(func));
    },
    load() {
      this.canLoad = false;

      const answersRef = this.$db.collection('answers')
        .where('survey.id', '==', this.surveyID);

      const statsRef = this.$db.doc(`/surveys/${this.surveyID}/public/stats`);

      const updateAnswers = (docRef) => {
        Vue.set(this.surveyStats, 'questionsAnswered', docRef.size);
        const answers = {};
        const questions = [];
        docRef.forEach((doc) => {
          const answer = doc.data();
          const qid = answer.question.id;
          answer.id = doc.id;
          if (qid in answers) {
            answers[qid].push(answer);
          } else {
            answers[qid] = [answer];
            const { question } = answer;
            question.answerType = answer.type;
            questions.push(question);
          }
        });

        this.answers = answers;
        this.questions = questions.sort((a, b) => {
          const edit = n => (n[0] === 'D' ? `Z${n}` : n);
          return edit(a.number).localeCompare(edit(b.number));
        });
      };

      const updateStats = (docRef) => {
        const stats = Object.assign(this.surveyStats, docRef.data());
        Vue.set(this, 'surveyStats', stats);
      };

      this.listenForUpdates(answersRef, updateAnswers);
      this.listenForUpdates(statsRef, updateStats);
    },
  },
  created() {
    // /// refs
    const surveyRef = this.$db.doc(`/surveys/${this.surveyID}/public/survey`);


    // /// update functions
    const updateSurvey = (docRef) => {
      this.survey = docRef.data();
      const elements = Object.values(this.survey.pages).flat();
      this.survey.questions = elements.filter(e => e.type === 'question');
    };

    // /// queries & updates
    surveyRef.get().then(updateSurvey);


    this.$auth.currentUser.getIdTokenResult().then((tr) => {
      this.showSensitiveInfo = 'sensitive' in tr.claims;
    });
  },
  beforeDestroy() {
    this.updateHandles.forEach((handle) => {
      handle.call(handle);
    });
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

table.quick-stats {
  margin: 30px auto;

  td, th {
    text-align: center;
  }
  h2 {
    margin-top: 40px;
  }
}

.question-and-answer {
  margin-bottom: 30px;
  h3.subtitle {
    margin-bottom: 5px;
  }
  canvas {
    margin-top: 20px;
  }

  span.show-hide-answers {
    border-bottom: 1px solid $red;
    &:hover {
      cursor: pointer;
    }
  }
}

.stats {
  .button i {
    margin-left: 10px;
  }
}

button.load {
  display: block;
  margin: 40px auto;
}

</style>
