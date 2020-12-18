<template>
<div class="consent">
  <div v-html="value"></div>
  <footer>
    <button class="button"
            @click="$emit('finish', false)">
      Decline
    </button>
    <button class="button is-info"
            @click="$emit('finish')">
      Accept
    </button>
  </footer>
</div>
</template>

<script>
export default {
  props: {
    value: String,
  },
};
</script>

<style lang="scss" scoped>
div.consent {
  footer {
    button {
      margin: 0px 5px;
    }
    // text-align: right;
    // padding: 10px;
  }
}
</style>
