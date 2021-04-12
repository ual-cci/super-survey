<template lang="html">
<admin-narrow>
  <admin-header></admin-header>
  <h3 class="title">Transcribe media</h3>
  <i v-if="loading" class="fas fa-spinner fa-pulse"></i>
  <div v-else-if="allow === false">
    You don't have permission to access this page
  </div>
  <div v-else-if="answers.length > 0" class="transcription">
    <nav v-if="!answerID" class="pagination" role="navigation">
      <a class="pagination-previous"
         :disabled="currentPage === 1"
         @click="currentPage--">
        Previous
      </a>
      <a class="pagination-next"
         :disabled="currentPage === numPages"
         @click="currentPage++">
        Next page
      </a>
      <ul class="pagination-list">
        <li v-for="i in numPages" :key="`page-${i}`">
          <a class="pagination-link" :class="{ 'is-current': i === currentPage }"
             @click="currentPage = i">
            {{ i }}
          </a>
        </li>
      </ul>
    </nav>
    <div v-if="!answerID" class="row">
      <div class="select">
        <select v-model="filterQuestionNumber" class="">
          <option :value="null">All questions</option>
          <option v-for="number in questionNumbers"
                  :key="`option-${number}`" :value="number">
            {{ number }}
          </option>
        </select>
      </div>
    </div>
    <div v-if="!answerID" class="buttons row">
      <a v-for="filter in filterOptions" :key="filter"
         class="button" :class="{ 'is-info': filters.includes(filter) }"
         @click="toggleFilter(filter)">
        {{ makeTitle(filter) }}
      </a>
    </div>
    <answer-transcription v-for="answer in page" :key="answer.id"
                          :answer="answer">
    </answer-transcription>
  </div>
  <div v-else class="">
    <h3 class="title">No answers for this survey have media</h3>
    <p>
      <router-link :to="{ name: 'survey-stats', params: { surveyID } }">
        Survey Stats
      </router-link>
    </p>
  </div>
</admin-narrow>
</template>

<script>
import AdminNarrow from '@/components/Display/AdminNarrow.vue';
import AdminHeader from '@/components/Display/AdminHeader.vue';
import AnswerTranscription from '@/components/AnswerTranscription.vue';

export default {
  components: {
    AdminNarrow,
    AdminHeader,
    AnswerTranscription,
  },
  props: {
    surveyID: {
      default: '',
      type: String,
    },
    answerID: {
      default: null,
      type: String,
    },
  },
  data() {
    return {
      loading: true,
      allow: null,
      answers: [],
      perPage: 8,
      currentPage: 1,
      filterOptions: ['transcribed', 'untranscribed', 'noted', 'completed', 'uncompleted'],
      filters: [],
      filterQuestionNumber: null,
    };
  },
  computed: {
    filteredAnswers() {
      return this.answers.filter((answer) => {
        let output = true;
        for (const f of this.filters) {
          if (f === 'transcribed') {
            output = output && answer.transcribed;
          } else if (f === 'untranscribed') {
            output = output && (answer.text === '' || answer.text === undefined);
          } else if (f === 'noted') {
            output = output && answer.transcription && answer.transcription.notes !== '' && answer.transcription.notes !== undefined;
          } else if (f === 'completed') {
            output = output && answer.transcription && answer.transcription.complete;
          } else if (f === 'uncompleted') {
            output = output && answer.transcription && !answer.transcription.complete;
          }
        }

        if (this.filterQuestionNumber) {
          output = output && answer.question.number === this.filterQuestionNumber;
        }

        return output;
      });
    },
    page() {
      const start = this.perPage * (this.currentPage - 1);
      const end = this.perPage * this.currentPage;
      return this.filteredAnswers.slice(start, end);
    },
    numPages() {
      return Math.ceil(this.filteredAnswers.length / this.perPage);
    },
    questionNumbers() {
      const numbers = new Set(this.answers.map(a => a.question.number));
      return Array.from(numbers).sort((a, b) => {
        const an = a.match(/([0-9]+)/)[0];
        const bn = b.match(/([0-9]+)/)[0];
        const aa = a.replace('D', 'Z').replace(an, an.padStart(2, '0'));
        const bb = b.replace('D', 'Z').replace(bn, bn.padStart(2, '0'));
        return aa.localeCompare(bb);
      });
    },
  },
  watch: {
    filters() {
      this.currentPage = 1;
    },
  },
  methods: {
    toggleFilter(filter) {
      if (this.filters.includes(filter)) {
        this.filters.splice(this.filters.indexOf(filter), 1);
      } else {
        this.filters.push(filter);
      }
    },
  },
  created() {
    this.$auth.currentUser.getIdTokenResult().then((tr) => {
      this.allow = 'sensitive' in tr.claims;

      if (this.allow) {
        const docRef = this.$db.collection('answers');
        if (this.answerID) {
          docRef.doc(this.answerID)
            .get()
            .then((doc) => {
              this.answers.push({
                id: this.answerID,
                ...doc.data(),
              });
              this.loading = false;
            });
        } else if (this.surveyID) {
          this.answers = [];
          ['audio', 'video', 'photo'].forEach((type) => {
            docRef.where('survey.id', '==', this.surveyID)
              .where('media.type', '==', type)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  const { id } = doc;
                  const answer = Object.assign(doc.data(), { id });
                  if (answer.media) {
                    this.answers.push(answer);
                  }
                });
                if (type === 'photo') {
                  this.loading = false;
                }
              });
          });
        }
      } else {
        this.loading = false;
      }
    });
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

.transcription {
  .pagination {
    align-items: unset;
  }

  .pagination-previous, .pagination-next {
    min-width: unset;
  }

  .buttons {
    margin-top: 20px;
  }

  .row {
    display: inline-block;
    margin-right: 0.5rem;
  }
}
</style>

<style lang="scss" scoped>
</style>
