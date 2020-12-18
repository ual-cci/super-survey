<template>
<div class="survey-element" :class="`${element.type}_`" ref="element">
  <div v-if="element.type === 'heading'">
    <h1 class="title is-3">{{ element.value }}</h1>
  </div>
  <div v-else-if="element.type === 'description'">
    <div v-html="element.value"></div>
  </div>
  <div v-else-if="element.type === 'question'">
    <div v-html="element.html"></div>
    <diversity-media :media="element.diversityMedia"></diversity-media>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import DiversityMedia from './DiversityMedia.vue';

export default {
  components: {
    DiversityMedia,
  },
  props: {
    element: Object,
  },
  computed: {
    ...mapGetters(['surveyInfo']),
  },
  mounted() {
    const element = this.grabKeys(this.element, ['id', 'type']);
    if (element.type === 'question') {
      this.grabKeys(this.element, ['number'], element);
    }

    const videos = this.$refs.element.querySelectorAll('video');
    videos.forEach((v) => {
      v.onplay = () => {
        const srcRe = v.src.match(/heartnsoul-asks.appspot.com\/o\/(.*.mp4)/);
        const videoRe = v.src.match(/video%2F(.*.mp4)/);
        if (srcRe && srcRe.length >= 2) {
          const payload = Object.assign(this.surveyInfo, {
            element,
            videoID: srcRe[1] || null,
            filename: videoRe[1] || null,
            url: v.src,
          });
          this.$db.collection('video-plays').add(payload);
        }
      };
    });
  },
};
</script>

<style lang="scss">
</style>

<style lang="scss" scoped>
.description_ {
  margin-bottom: 1.5rem;
}
</style>
