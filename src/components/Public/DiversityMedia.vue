<template>
<div v-if="hasAny" class="diversity-media">
  <span class="lead-in">view this question as</span>
  <button v-for="type in availableMedia" :key="type"
          class="button is-small"
          @click="openMedia = type">
    <i class="fas" :class="mediaIcons[type]"></i>{{ makeTitle(type) }}
  </button>
  <div class="modal" :class="{ 'is-active': openMedia }">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <img v-if="openMedia === 'photo'" :src="media[openMedia]" alt="">
        <audio v-else-if="openMedia === 'audio'" :src="media[openMedia]"
                controls controlslist="nodownload">
        </audio>
        <video v-else-if="openMedia === 'video'" :src="media[openMedia]"
                controls controlslist="nodownload">
        </video>
        <button class="delete is-large" aria-label="close"
            @click="openMedia = null">
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    media: Object,
  },
  data() {
    return {
      openMedia: null,
    };
  },
  computed: {
    availableMedia() {
      return Object.keys(this.media).filter(key => this.media[key] !== null);
    },
    hasAny() {
      return this.availableMedia.length > 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.diversity-media {

  .modal-content div {
    text-align: center;
  }
  button {
    margin-right: 5px;
    margin-bottom: 5px;

    i {
      margin-right: 5px;
    }

    &.delete {
      margin: 0;
      position: absolute;
      right: 5px;
      top: 5px;
    }
  }
  span.lead-in {
    font-size: 1rem;
    margin-right: 7px;
    color: #666;
  }
}
</style>
