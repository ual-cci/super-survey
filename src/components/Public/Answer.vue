<template>
<div class="answer">
  <template v-if="!(this.skipped || this.passed)">
    <div v-if="type === 'free-text'" class="free-text">
      <textarea class="textarea" rows="3"
                placeholder="Type your answer"
                :disabled="media !== null"
                v-model="text"
                @blur="update()">
      </textarea>
      <p>or answer with</p>
      <media-upload v-for="(icon, mediaType) in mediaIcons" :key="mediaType"
                    :type="mediaType" :record="true"
                    :path="`user-media/${user.anonID}`"
                    @uploaded="mediaAdded">
        <button class="button is-rounded is-small"
                slot-scope="{ open, progress, message }"
                :class="{ 'is-primary': progress === 100 }"
                @click="open">
          <span v-if="message">{{ message }}</span>
          <progress v-else-if="progress > 0 && progress < 100"
                    class="progress is-small is-info upload-progress"
                    :value="progress" max="100">{{ progress }}%</progress>
          <template v-else>
            <i class="fas" :class="icon"></i> {{ makeTitle(mediaType) }}
          </template>
        </button>
      </media-upload>
    </div>
    <div v-else-if="type === 'image-upload'" class="image-upload">
      <media-upload v-for="i in [1, 2, 3, 4, 5]" :key="`upload-${i}`"
                    :type="'image-upload'"
                    :path="`user-media/${user.anonID}`"
                    @uploaded="mediaAdded">
        <button class="button is-rounded is-small"
                slot-scope="{ open, progress, message }"
                :class="{ 'is-primary': progress === 100 }"
                @click="open">
          <span v-if="message">{{ message }}</span>
          <progress v-else-if="progress > 0 && progress < 100"
                    class="progress is-small is-info upload-progress"
                    :value="progress" max="100">{{ progress }}%</progress>
          <template v-else>
            <i class="fas" :class="'fa-image'"></i>Upload
          </template>
        </button>
      </media-upload>
    </div>
    <div v-else-if="question.answerType === 'multiple-choice'">
      <div v-if="type === 'dropdown'" class="select">
        <select v-model="text" @change="update()">
          <option :value="null" disabled>Please select</option>
          <option v-for="choice in question.answerChoices"
                  :key="choice" :value="choice">
            {{ choice }}
          </option>
        </select>
      </div>
      <div v-else class="control">
        <label v-for="choice in question.answerChoices" :key="choice"
              :class="type">
          <input :name="`${type}-${question.index}`" :type="type"
                  ref="choices"
                  :value="choice"
                  @change="choiceChange">
          {{ choice }}
        </label>
      </div>
      <input v-if="question.hasOther && displayOther"
             type="text" class="input" placeholder="Please specify"
             @blur="update()"
             v-model="other">
    </div>
    <vue-slider v-else-if="hasSlider"
                ref="slider"
                :data="sliderData"
                :marks="sliderMarks"
                :process="false"
                :dot-size="$store.state.fontSize * 1.5"
                :lazy="true"
                :value="type === 'likert' ? text : value"
                @change="sliderChanged">
      <template v-slot:mark="{ pos, label }">
        <div class="likert-mark"
              :style="{ left: `${pos}%` }">
        </div>
        <span class="likert-text"
              :style="{
                left: `${pos}%`,
              }"
              v-html="likertText(label)">
        </span>
      </template>
    </vue-slider>
  </template>
  <div v-if="question.allowSkip || question.allowPass" class="optional">
    <label v-if="question.allowSkip && !passed" class="checkbox">
      <input type="checkbox" v-model="skipped">
        Prefer not to say
    </label>
    <label v-if="question.allowPass && !skipped" class="checkbox">
      <input type="checkbox" v-model="passed">
        Don't know
    </label>
  </div>
  <transition name="fade">
    <div v-if="validAnswer && timesAnswered > 0" class="smiley">
      <i class="far fa-check-circle"></i>
    </div>
  </transition>
</div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import MediaUpload from '@/components/MediaUpload.vue';
import { emojiMap } from '@/likert';

export default {
  components: {
    VueSlider,
    MediaUpload,
  },
  props: {
    question: Object,
  },
  data() {
    return {
      text: null,
      value: null,
      media: null,
      index: null,
      other: null,
      skipped: null,
      passed: null,
      timesAnswered: 0,
    };
  },
  watch: {
    text() {
      if (this.type === 'free-text') {
        this.softUpdate();
      }
    },
    skipped(v, oldValue) {
      this.extraBoxChanged(v, oldValue);
    },
    passed(v, oldValue) {
      this.extraBoxChanged(v, oldValue);
    },
    displayOther(display) {
      this.other = display ? '' : null;
    },
  },
  computed: {
    type() {
      const type = this.question.answerType;
      if (type === 'multiple-choice') {
        return this.question.choiceType;
      }
      return type;
    },
    validAnswer() {
      if (this.other !== '') {
        const keys = ['text', 'media', 'skipped', 'passed', 'value'];
        const someValue = keys.some(k => this[k]);
        return someValue || this.type === 'slider';
      }
      return false;
    },
    displayOther() {
      if (this.text) {
        const re = /^other$/i;
        if (Array.isArray(this.text)) {
          return this.text.some(t => t.match(re));
        }
        return this.text.match(re);
      }
      return false;
    },
    hasSlider() {
      return this.type.match(/likert|slider/);
    },
    sliderData() {
      if (this.type === 'likert') {
        return this.question.answerChoices;
      }
      return null;
    },
    sliderMarks() {
      if (this.type === 'slider') {
        const choices = this.question.answerChoices;
        const step = Math.round(100 / (choices.length - 1));
        const output = {};
        choices.forEach((c, i) => {
          output[i * step] = c;
        });
        return output;
      }
      return true;
    },
    ...mapState(['user']),
  },
  methods: {
    update(options = {}) {
      if (!options.softUpdate) {
        this.timesAnswered++;
      }
      if (['radio', 'checkbox', 'dropdown', 'likert'].some(t => t === this.type)) {
        this.setIndex();
      }

      this.$emit('update', Object.assign(options, this.grabKeys(this, [
        'question',
        'type',
        '$data',
      ])));
    },
    softUpdate() {
      this.update({ softUpdate: true });
    },
    choiceChange(event) {
      const { value, checked } = event.target;
      if (this.type === 'radio') {
        this.text = value;
      } else if (this.type === 'checkbox') {
        if (checked) {
          this.text.push(value);
        } else {
          const index = this.text.indexOf(value);
          this.text.splice(index, 1);
        }
      }
      this.update();
    },
    mediaAdded(media) {
      if (media.type === 'image-upload') {
        const m = Object.assign({}, media);
        if (this.media) {
          this.media.urls.push(m.url);
        } else {
          m.urls = [m.url];
          delete m.url;
          Vue.set(this, 'media', m);
        }
      } else {
        Vue.set(this, 'media', media);
      }
      this.update();
    },
    restore(data) {
      if (data) {
        Object.assign(this.$data, data);
      }
    },
    likertText(label) {
      if (emojiMap[label] !== undefined) {
        return emojiMap[label];
      }
      if (typeof (label) === 'string') {
        return label.replace(/ /g, '<br>').replace(/_/g, ' ');
      }
      return label;
    },
    sliderChanged(value) {
      if (this.type === 'likert') {
        this.text = value;
      } else if (this.type === 'slider') {
        this.value = value;
      }
      this.update();
    },
    setIndex() {
      if (this.text) {
        const { answerChoices } = this.question;
        const getIndex = t => answerChoices.indexOf(t) + 1;
        if (this.type === 'checkbox') {
          this.index = this.text.map(t => getIndex(t));
        } else {
          this.index = getIndex(this.text);
        }
      }
    },
    extraBoxChanged(v, oldValue) {
      if (v) {
        this.text = this.value = this.index = this.other = null;
      }
      if (oldValue !== null) {
        this.update();
      }
    },
  },
  created() {
    // set middle answer as default
    if (this.type === 'likert') {
      const index = Math.floor(this.question.answerChoices.length / 2);
      this.text = this.question.answerChoices[index];
      this.update({ softUpdate: true, default: true });
    } else if (this.type === 'slider') {
      this.value = 50;
      this.update({ softUpdate: true, default: true });
    } else if (this.type === 'checkbox') {
      this.text = [];
      this.update({ softUpdate: true, default: true });
    }

    if (this.question.allowPass) {
      this.passed = false;
    }
    if (this.question.allowSkip) {
      this.skipped = false;
    }
  },
};
</script>

<style lang="scss">
@import "@/styles/variables.scss";

div.answer {
  position: relative;
  margin-top: 20px;

  .control label {
    display: block;
    margin: 5px 10px;
    width: 90%;
  }

  .free-text, .image-upload {
    button {
      margin-right: 5px;
      margin-bottom: 5px;

      i {
        margin-right: 5px;
      }
    }
  }

  .image-upload {
    textarea {
      margin-top: 10px;
    }
  }

  .optional label, p {
    margin: 7px;
    color: #666;
  }

  .optional {
    margin-top: 0.75em;
    label {
      margin-right: 1.5em;
    }
  }

  progress.upload-progress {
    width: 100px;
  }

  div.smiley {
    position: absolute;
    right: 10px;
    bottom: 2px;
    i {
      font-size: 1.5rem;
      color: $warehouse-blue;
    }
  }

  .control {
    font-size: unset;
  }

  input[type="checkbox"], input[type="radio"] {
    width: 0.9rem;
    height: 0.9rem;
    vertical-align: middle;
  }

  input[type="text"] {
    display: block;
    width: 75%;
    max-width: 320px;
  }

  select {
    display: block;
  }
}

@media only screen and (max-width:768px) {
div.answer {
  div.smiley {
    right: -14px;
    bottom: 0px;
  }
}
}

.vue-slider {
  width: 80% !important;
  margin: 0 auto;
  margin-bottom: 65px;

  .likert-text {
    position: absolute;
    width: 35%;
    color: #555;
    top: 0.8rem;
    text-align: center;
    line-height: 1.3rem;
    font-size: 1rem;
    transform: translateX(-50%);
  }

  .likert-mark {
    position: absolute;
    width: 0.4rem;
    height: 0.6rem;
    top: -0.2rem;
    margin-left: -0.2rem;
    border-radius: 5px;
    background: #777;
  }

  .vue-slider-dot-handle {
    background: $hot-pink;
  }

  .vue-slider-dot-tooltip-inner {
    background: #fff;
    color: #000;
    border: 1px solid #aaa;
  }

  .vue-slider-rail {
    background: #ccc;
    height: 4px;
  }
}

</style>
