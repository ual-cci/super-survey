<template>
<div class="participation">
  <div v-html="value"></div>
  <footer>
    <button class="button"
            @click="$emit('finish')">
      OK
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
div.participation {
  footer {
    // text-align: right;
    // padding: 10px;
  }
}
</style>
