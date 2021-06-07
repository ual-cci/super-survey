<template lang="html">
<admin-narrow>
<admin-header></admin-header>
  <div v-if="answers" class="user-answers">
    <div v-for="(answers, surveyTitle) in answers" :key="surveyTitle"
          class="">
      <h1 class="title is-4"> {{ surveyTitle }}</h1>
      <table class="table is-striped is-fullwidth">
        <thead>
          <th>Question</th>
          <th>Answer</th>
          <th class="datetime">Time</th>
        </thead>
        <tbody>
          <tr v-for="answer in sortedAnswers(answers)"
              :key="answer.timestamp.seconds + answer.timestamp.nanoseconds">
            <td>{{ abbreviate(answer.question.value.text, 40) }}</td>
            <td> {{ answer.answer }}</td>
            <td class="datetime">{{ dateTimeString(answer) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</admin-narrow>
</template>

<script>
import AdminNarrow from '@/components/Display/AdminNarrow.vue';
import AdminHeader from '@/components/Display/AdminHeader.vue';

export default {
  components: {
    AdminNarrow,
    AdminHeader,
  },
  props: {
    anonID: String,
  },
  data() {
    return {
      answers: null,
    };
  },
  methods: {
    sortedAnswers(answers) {
      return answers.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
    },
    dateTimeString(answer) {
      const d = answer.timestamp.toDate();
      return `${d.toLocaleTimeString()} ${d.toLocaleDateString()}`;
    },
  },
  created() {
    this.$db.collection('answers')
      .where('anonID', '==', this.anonID)
      .get()
      .then((snapshot) => {
        this.answers = {};
        snapshot.forEach((answerRef) => {
          const a = answerRef.data();
          (this.answers[a.surveyTitle] = this.answers[a.surveyTitle] || []).push(a);
        });
      });
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

.user-answers {
  .datetime {
    width: 120px;
    padding: 0;
    font-size: 0.75rem;
    vertical-align: middle;
  }
}

</style>
