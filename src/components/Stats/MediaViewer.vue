<template lang="html">
<div v-if="media" class="modal" :class="{ 'is-active': media !== null }">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <img v-if="media.type === 'photo'" :src="media.url" alt="">
      <audio v-else-if="media.type === 'audio'" :src="media.url"
              controls controlslist="nodownload">
      </audio>
      <video v-else-if="media.type === 'video'" :src="media.url"
              controls controlslist="nodownload">
      </video>
      <button class="delete is-large" aria-label="close"
          @click="$emit('close')">
      </button>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    media: Object,
  },
};
</script>

<style lang="scss" scoped>
.delete {
  margin: 0;
  position: absolute;
  right: 5px;
  top: 5px;
}
</style>
