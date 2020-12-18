<template lang="html">
<div>
  <hr>
  <h3 class="title is-5">
    {{ answer.question.number }}
    <router-link :to="{
                      name: 'answer-editor',
                      params: {
                        surveyID: answer.survey.id,
                        answerID: answer.id
                      } }"
                 target="_blank">
      {{ answer.id }}
    </router-link>
  </h3>
  <h4 class="subtitle is-6">{{ timestamp.toLocaleDateString()  }}</h4>
  <img v-if="answer.media.type === 'photo'"
       :src="answer.media.url" alt="">
  <audio v-else-if="answer.media.type === 'audio'"
         :src="answer.media.url" controls controlslist="nodownload">
  </audio>
  <video v-else-if="answer.media.type === 'video'"
         :src="answer.media.url" controls controlslist="nodownload">
  </video>
  <div class="columns">
    <div class="column is-two-thirds">
      <h3>Answer</h3>
      <span v-if="transcribed" class="status">
        (Transcribed by {{ answer.transcription.author || '?' }})
      </span>
      <span v-if="!transcribed && text" class="status">(User answer)</span>
      <textarea class="textarea" rows="4" cols="80" v-model="text"></textarea>
    </div>
    <div class="column">
      <h3>Notes</h3>
      <textarea class="textarea" rows="4" cols="80" v-model="notes"></textarea>
    </div>
  </div>
  <div class="buttons is-right">
    <p v-if="completed">
      Marked as complete by {{ answer.transcription.author }}
    </p>
    <p class="control">
      <a class="button is-warning is-right"
         @click="markEmpty">
        No meaningful answer
      </a>
      <a class="button is-secondary is-right"
         @click="markComplete">
        Mark as complete
      </a>
      <a class="button is-info is-right"
         @click="update({ text, transcribed: text !== '' })">
        Update
      </a>
    </p>
  </div>
</div>
</template>

<script>
export default {
  props: {
    answer: Object,
  },
  data() {
    return {
      text: '',
      notes: '',
      complete: false,
    };
  },
  computed: {
    transcribed() {
      return this.answer.transcription;
    },
    completed() {
      return this.complete || (this.answer.transcription && this.answer.transcription.complete);
    },
    timestamp() {
      return new Date(this.answer.timestamp.seconds * 1000);
    },
  },
  watch: {
    answer(a) {
      this.text = a.text;
      this.notes = a.notes;
    },
  },
  methods: {
    update({ transcribed, complete }) {
      const d = {
        text: this.text || '',
        transcription: {
          notes: this.notes || '',
          author: this.$auth.currentUser.displayName,
        },
      };

      if (transcribed !== undefined) {
        d.transcribed = transcribed;
      }

      if (complete !== undefined) {
        d.transcription.complete = complete;
      }

      this.$db.collection('answers').doc(this.answer.id)
        .update(d);

      this.answer.text = d.text;
      this.answer.transcription = d.transcription;
    },
    markEmpty() {
      this.update({
        transcribed: this.text === '',
      });
    },
    markComplete() {
      this.complete = this.completed || new Date();
      this.update({
        complete: this.complete,
      });
      this.answer.transcription.author = this.$auth.currentUser.displayName;
    },
  },
  created() {
  },
  mounted() {
    this.text = this.answer.text || '';
    this.notes = (this.answer.transcription && this.answer.transcription.notes) || '';
  },
};
</script>

<style lang="scss" scoped>
.control {
  /* margin-top: 5px; */
}
img, audio, video {
  display: block;
  margin: 0 auto;
  margin-bottom: 20px;
  max-width: 600px;
}

.columns {
  h3 {
    display: inline-block;
  }
  span.status {
    margin-left: 20px;
    color: #777;
  }
}
</style>
