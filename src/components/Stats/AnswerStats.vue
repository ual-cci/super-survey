<template lang="html">
<div class="stat">
  <h3 class="subtitle is-4">
    <b>{{ question.number }} </b>
    {{ abbreviate(question.text) }}
  </h3>
  <h4 v-if="hasGraph" class="button tag show-graph-button"
      @click="showingGraph = !showingGraph">
    {{ showingGraph ? 'hide' : 'show' }} Graph
  </h4>
  <div v-if="answers">
    <div v-if="hasGraph && showingGraph">
      <stats-bar-chart :chart-data="barChartData"
                        :height="200">
      </stats-bar-chart>
    </div>
    <span class="show-hide-answers"
          @click="showingList = !showingList">
      {{ answers.length }}
      {{ `answer${answers.length > 1 ? 's' : ''}`}}
      {{ mediaAnswerCounts }}
    </span>
    <div v-if="showingList" class="answer-list">
      <table class="table is-striped is-fullwidth">
        <thead>
          <th>Answer</th>
          <th>Times answered</th>
          <th>User</th>
        </thead>
        <tbody>
          <tr v-for="answer in answers" :key="answer.id">
            <td>
              <span>
                {{ displayAnswerText(answer.type === 'slider' ? answer.value : answer.text) }}
              </span>
              <i v-if="answer.media"
                  class="fas"
                  :class="mediaIcons[answer.media.type]"
                  @click="currentMedia = showSensitiveInfo ? answer.media : null">
              </i>
            </td>
            <td>{{ answer.timesAnswered }}</td>
            <td class="user">
              <router-link :to="{ name: 'user-answers', params: { anonID: answer.user.anonID } }">
                {{ answer.user.anonID }}
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <em v-else>
    No answers yet
  </em>
  <media-viewer :media="currentMedia" @close="currentMedia = null"></media-viewer>
</div>
</template>

<script>
import StatsBarChart from './BarChart.vue';
import MediaViewer from './MediaViewer.vue';

export default {
  components: {
    StatsBarChart,
    MediaViewer,
  },
  props: {
    question: Object,
    answers: Array,
    showSensitiveInfo: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showingList: false,
      showingGraph: false,
      currentMedia: null,
    };
  },
  computed: {
    hasGraph() {
      return this.question.answerType !== 'free-text';
    },
    mediaAnswerCounts() {
      const counts = this.answers.filter(e => e.media)
        .map(e => e.media.type)
        .reduce((e, d) => {
          e[d] = ++e[d] || 1;
          return e;
        }, {});

      if (counts) {
        const s = Object.entries(counts).map(e => `${e[1]} ${this.makeTitle(e[0])}`);
        if (s.length > 0) {
          return `(${s.join(', ')})`;
        }
      }
      return '';
    },
    barChartData() {
      let columns = null;
      if (this.question.answerType === 'slider') {
        columns = Array(100).fill(0).map((_, i) => i + 1);
      } else {
        columns = this.question.answerChoices;
      }

      const columnMap = {};
      columns.forEach((c, i) => {
        columnMap[c] = i;
      });

      const counts = columns.map(c => ({ label: c, value: 0 }));

      const incrementColumn = (value) => {
        const index = columnMap[value];
        if (index !== undefined) {
          counts[index].value++;
        }
      };

      this.answers.forEach((answer) => {
        if (Array.isArray(answer.text)) {
          answer.text.forEach(incrementColumn);
        } else {
          incrementColumn(answer.type === 'slider' ? answer.value : answer.text);
        }
      });

      return {
        labels: counts.map(e => e.label),
        datasets: [{
          data: counts.map(e => e.value),
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderWidth: 1,
        }],
      };
    },
  },
  methods: {
    displayAnswerText(text) {
      if (Array.isArray(text)) {
        return text.join('<br>');
      }
      return text;
    },
  },
};
</script>

<style lang="scss" scoped>
.stat {
  position: relative;
  .show-graph-button {
    position: absolute;
    right: 2px;
    top: 2px;
  }
}
.answer-list {
  tbody {
    tr {
      td:first-child {
        width: 60%;
      }
      td.user {
        font-size: 0.75rem;
        width: 180px;
        vertical-align: middle;
      }
    }
  }
}
</style>
