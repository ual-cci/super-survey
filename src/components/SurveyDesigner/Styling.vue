<template>
  <div>
    <p>
      <i class="fas fa-palette fa-2x"></i>
      Apply the following colour to questions underneath
    </p>
    <div class="buttons">
      <a v-for="option in options" :key="option"
         class="button is-outlined"
         :class="{
          [`${option}`]: true,
          active: value === option,
         }"
         @click="value = option">
         {{ makeTitle(stripElement(option)) }}
       </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'styling',
  props: {
    initial: String,
    index: Number,
  },
  mounted() {
  },
  data() {
    return {
      value: 'default-element',
      options: [
        'default-element',
        'green-element',
        'blue-element',
        'red-element',
        'yellow-element',
        'pink-element',
      ],
    };
  },
  watch: {
    value() {
      this.$emit('update');
    },
    initial(value) {
      this.value = value;
    },
  },
  methods: {
    getValue() {
      return {
        type: this.$options.name,
        value: this.value,
        index: this.index,
      };
    },
  },
};
</script>

<style lang="scss">
@import "@/styles/variables.scss";
</style>

<style lang="scss" scoped>
.buttons a {
  margin-top: 10px;
  width: 90px;
}
</style>
