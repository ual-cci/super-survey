<template lang="html">
<div class="condition">
  <span class="c">If answer to question</span>
  <div class="select is-small c">
    <select v-model="source" @change="$emit('update')">
      <option v-for="id in sourceOptions" :key="id" :value="id">
        {{ questions[id].number }}
      </option>
    </select>
  </div>
  <div v-if="breakInMiddle" class="line-break"></div>
  <div class="select is-small c">
    <select v-model="predicate" @change="$emit('update')">
      <option v-for="option in predicates" :key="option.value"
              :value="option.value">
        {{ option.text }}
      </option>
    </select>
  </div>
  <div v-if="testOptions.length > 0 && testWantsSelect" class="select is-small c">
    <select v-model="test" @change="$emit('update')">
      <option v-for="option in testOptions" :key="option"
              :value="option">
        {{ option }}
      </option>
    </select>
  </div>
  <input v-else class="input is-small c" type="text"
          v-model="test" @change="$emit('update')"/>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'condition',
  props: {
    breakInMiddle: {
      type: Boolean,
      default: false,
    },
    precedingQuestion: Object,
  },
  data() {
    return {
      dataKeys: ['source', 'predicate', 'test'],
      source: null,
      predicate: null,
      test: null,
      predicates: [
        { text: 'is exactly', value: 'is-exactly' },
        { text: 'is not exactly', value: 'is-not-exactly' },
        { text: 'contains', value: 'contains' },
        { text: 'does not contain', value: 'does-not-contain' },
      ],
    };
  },
  computed: {
    ...mapState(['questions']),
    ...mapGetters(['questionIDs']),
    sourceOptions() {
      const { precedingQuestion, questionIDs } = this;
      if (precedingQuestion) {
        const index = questionIDs.indexOf(precedingQuestion.id);
        const sourceOptions = [...questionIDs];
        sourceOptions.splice(index + 1);
        return sourceOptions;
      }
      return [];
    },
    testOptions() {
      const question = this.questions[this.source];
      if (question
          && question.id === this.source
          && ['multiple-choice', 'likert'].some(e => e === question.value.answerType)) {
        return question.value.answerChoices.map(a => a.value);
      }
      return [];
    },
    testWantsSelect() {
      return this.predicate && this.predicate.search(/contain/) === -1;
    },
  },
  watch: {
    testOptions(v) {
      if (v.length > 0 && this.test === '') {
        // eslint-disable-next-line prefer-destructuring
        this.test = this.testOptions[0];
      }
    },
    sourceOptions() {
      if (this.sourceOptions.indexOf(this.source) === -1) {
        this.source = this.sourceOptions[this.sourceOptions.length - 1];
      }
    },
    precedingQuestion() {
      if (this.precedingQuestion && !this.source) {
        this.source = this.precedingQuestion.id;
      }
    },
  },
  methods: {
    getData() {
      const data = {};
      this.dataKeys.forEach((k) => { data[k] = this[k]; });
      return data;
    },
    setData(data) {
      this.dataKeys.forEach((k) => { this[k] = data[k]; });
    },
    getValue() {
      return this.getData();
    },
  },
  created() {
    if (this.precedingQuestion) {
      this.source = this.precedingQuestion.id;
    }
  },
  mounted() {
    if (!this.predicate) {
      this.predicate = this.predicates[0].value;
    }
  },
};
</script>

<style lang="scss" scoped>
.condition {
  display: inline;
  input {
    width: 200px;
  }
  & .c {
    margin: 0px 2px;
  }

  & i {
    width: 16px;
  }
  .line-break {
    height: 5px;
  }
}
</style>
