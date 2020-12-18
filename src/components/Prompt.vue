<template lang="html">
<div class="modal" :class="{ 'is-active': show }">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <h2 v-if="intro" class="subtitle is-5">{{ intro }}</h2>
      <h2 class="subtitle is-4">{{ text }}</h2>
      <div class="field is-grouped">
        <p class="control is-expanded">
          <input class="input" type="text"
                 v-model="input"
                 @keydown.enter="$emit('set', input)">
        </p>
        <p class="control buttons">
          <a v-if="showCancel" class="button" @click="$emit('cancel')">
            Cancel
          </a>
          <a class="button is-info" @click="$emit('set', input)">
            {{ setText }}
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    intro: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
    setText: {
      type: String,
      default: 'Set',
    },
    showCancel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      input: '',
    };
  },
};
</script>

<style lang="scss" scoped>
</style>
