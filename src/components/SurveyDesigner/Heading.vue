<template>
  <input class="input" v-if="editing" type="text"
         v-model="value" ref="input"
         v-on:keydown.enter="edit(false)"
         @blur="edit(false)" placeholder="Heading">
  <h1 class="title is-4" v-else @click="edit(true)">{{ value }}</h1>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'heading',
  props: {
    initial: String,
    index: Number,
  },
  data() {
    return {
      value: '',
      editing: true,
      changed: false,
    };
  },
  watch: {
    value() {
      this.changed = true;
    },
    initial(value) {
      this.value = value;
    },
  },
  methods: {
    edit(v) {
      this.editing = v;
      if (v) {
        Vue.nextTick().then(() => {
          this.$refs.input.focus();
        });
      } else if (!this.value) {
        this.$emit('empty');
      } else if (this.changed) {
        this.$emit('update');
        this.changed = false;
      }
    },
    getValue() {
      return {
        type: this.$options.name,
        value: this.value,
        index: this.index,
      };
    },
  },
  created() {
    this.editing = !this.initial;
    if (this.editing) {
      Vue.nextTick(() => {
        this.$refs.input.focus();
      });
    }
  },
  mounted() {
    this.value = this.initial || '';
  },
};
</script>

<style lang="scss" scoped>
div.heading {
  width: 100%;
  height: 100%;
}
.title {
  margin: 5px 0px;
}
</style>
