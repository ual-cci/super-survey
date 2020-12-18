<template>
<div class="branch">
  <div class="row">
    <i class="fas fa-code-branch"></i>
    <condition ref="condition" :break-in-middle="true"
               :preceding-question="initial.precedingQuestion"
               @update="$emit('update')"
               >
    </condition>
  </div>
  <div class="">
    <span class="c">then go to</span>
    <div class="select is-small c">
      <select v-model="destination" @change="$emit('update')">
        <option v-for="id in destinationOptions" :key="id" :value="id">
          question {{ questions[id].number }}
        </option>
        <option value="end">the end of the survey</option>
      </select>
    </div>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import Condition from './Condition.vue';

export default {
  name: 'branch',
  components: {
    Condition,
  },
  props: {
    index: Number,
    initial: Object,
  },
  data() {
    return {
      destination: 'end',
    };
  },
  computed: {
    ...mapState(['questions']),
    ...mapGetters(['questionIDs']),
    destinationOptions() {
      const { precedingQuestion } = this.initial;
      if (precedingQuestion) {
        const index = this.questionIDs.indexOf(precedingQuestion.id);
        const destinationOptions = [...this.questionIDs];
        return destinationOptions.splice(index + 1);
      }
      return [];
    },
  },
  watch: {
    initial() {
      if (this.initial.source) {
        this.setData(this.initial);
      }
    },
  },
  methods: {
    getData() {
      const { destination } = this;
      const { condition } = this.$refs;
      return { destination, ...condition.getValue() };
    },
    setData(data) {
      const { condition } = this.$refs;
      condition.setData(data);
      this.destination = data.destination;
    },
    getValue() {
      return {
        type: this.$options.name,
        index: this.index,
        value: this.getData(),
      };
    },
  },
  mounted() {
    if (this.initial.source !== undefined) {
      this.setData(this.initial);
    }
    if (this.initial.precedingQuestion) {
      this.$refs.condition.source = this.initial.precedingQuestion.id;
    }
  },
};
</script>

<style lang="scss" scoped>
.branch {
  div.row {
    margin-bottom: 5px;
  }


  & .c {
    margin: 0px 2px;
  }

  & i {
    width: 16px;
  }
}
</style>
