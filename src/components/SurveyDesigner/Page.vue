<template>
  <div class="page">
    <span class="subtitle">Start of <b>Page {{ number }}</b></span>
  </div>
</template>

<script>
export default {
  name: 'page',
  props: {
    number: Number,
    index: Number,
  },
  methods: {
    getValue() {
      return {
        type: this.$options.name,
        number: this.number,
        index: this.index,
      };
    },
  },
};
</script>

<style lang="scss">
</style>
