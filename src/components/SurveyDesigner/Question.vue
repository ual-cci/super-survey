<template>
  <div class="question" @mouseover="mouseOver = true" @mouseleave="mouseOver = false">
    <div v-show="hasCondition && canHaveCondition"
         class="condition-container">
      <condition ref="condition"
                 :preceding-question="precedingQuestion(this.id)"
                 @update="$emit('update')">
      </condition>
      <hr>
    </div>
    <div class="question-parts">
      <text-editor ref="editor" class="editor"
                    :initial="initial ? initial.html : ''"
                    @empty="$emit('empty')"
                    @alive="editorAlive"
                    @update="$emit('update')"
                    :parent-alive="mouseOver"
                    :editable="editable">

        <div class="question-extras">
          <div class="dropdown" :class="{ 'is-active': diversityOpen }">
            <div class="dropdown-trigger">
              <div class="button rainbow"
                      @click="openCloseDiversity"
                      aria-haspopup="true" aria-controls="dropdown-menu">
                <i class="fas fa-rainbow"></i>
              </div>
            </div>
            <div class="dropdown-menu diversity" role="menu">
              <div class="dropdown-content">
                <media-upload v-for="(url, type) in diversityMedia" :key="url"
                              :type="type"
                              :path="'diversity-media'"
                              @uploaded="diversityAdded">
                  <a slot-scope="{ open, progress }"
                      class="dropdown-item" :class="{ 'is-active': !!url }"
                      @click="open">
                    <progress v-if="progress > 0 && progress < 100"
                              class="progress is-info"
                              :value="progress" max="100">
                    </progress>
                    <i v-else class="fas" :class="mediaIcons[type]"></i>
                  </a>
                </media-upload>
              </div>
            </div>
          </div>

          <div class="select is-small" title="Answer type">
            <select v-model="answerType">
              <option disabled>Answer type</option>
              <option v-for="option in answerTypes"
                      :key="option.value" :value="option.value">
                {{ option.text }}
              </option>
            </select>
          </div>

          <div v-if="answerType === 'multiple-choice'"
               class="select is-small" title="Choice type">
            <select v-model="choiceType" @change="$emit('update')">
              <option disabled>Choice type</option>
              <option v-for="option in choiceTypes"
                      :key="option.value" :value="option.value">
                {{ option.text }}
              </option>
            </select>
          </div>

          <button class="button is-small tool-icon"
                  :class="{ 'is-link': allowSkip }"
                  :title="`Prefer not to say (${(allowSkip ? 'en' : 'dis')}abled)`"
                  @click="allowSkip = !allowSkip; $emit('update')">
            <i class="far fa-meh"></i>
          </button>
          <button class="button is-small tool-icon"
                  :class="{ 'is-link': allowPass }"
                  :title="`Don't know (${(allowPass ? 'en' : 'dis')}abled)`"
                  @click="allowPass = !allowPass; $emit('update')">
            <i class="far fa-question-circle"></i>
          </button>

          <button v-if="canHaveCondition" class="button is-small tool-icon"
                  @click="hasCondition = !hasCondition; $emit('update')">
            {{ hasCondition ? 'Remove' : 'Add' }} condition
          </button>

          <button class="button is-small is-primary"
                  @click="save">
            Store
          </button>
        </div>
      </text-editor>
      <div v-if="editorHidden" class="page-number">
        <span>{{ number }}</span>
      </div>
    </div>

    <hr v-if="answerChoices.length > 0">
    <div v-if="!editorHidden && answerType === 'likert'"
          class="field is-grouped likert-defaults">
      <span>Quick likert defaults: </span>
      <a v-for="ld in quickLikertDefaults" :key="ld"
          class="button is-small is-outlined is-info"
          @click="insertLikertOptions(ld)">
        {{ ld }}
      </a>
    </div>
    <ul class="choices">
      <li v-for="(choice, index) in answerChoices" :key="index">
        <i v-if="editorHidden" class="far fa-circle"></i>
        <i v-else-if="index > 0" class="fas fa-minus-circle"
           @click="removeChoice(index)"></i>
        <i v-else class="fas fa-plus-circle" @click="addChoice('')"></i>
        <span v-if="editorHidden" v-html="renderChoice(choice.value)"></span>
        <input v-else class="input is-small" ref="answerChoice" type="text"
               v-model="choice.value" @keydown="choiceKeyDown(index, $event)"/>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import TextEditor from '@/components/TextEditor.vue';
import MediaUpload from '@/components/MediaUpload.vue';
import { options as likertOptions, emojiMap } from '@/likert';
import Condition from './Condition.vue';

export default {
  name: 'question',
  components: {
    TextEditor,
    MediaUpload,
    Condition,
  },
  props: {
    number: String,
    index: Number,
    id: String,
    initial: Object,
    numQuestions: Number,
    editable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      dataKeys: [
        'answerChoices',
        'answerType',
        'choiceType',
        'allowSkip',
        'allowPass',
        'diversityMedia',
        'hasCondition',
      ],
      editorHidden: true,
      mouseOver: false,
      answerTypes: [
        { text: 'Free text', value: 'free-text' },
        { text: 'Multiple choice', value: 'multiple-choice' },
        { text: 'Likert', value: 'likert' },
        { text: 'Slider', value: 'slider' },
        { text: 'Image upload', value: 'image-upload' },
      ],
      choiceTypes: [
        { text: 'Radio', value: 'radio' },
        { text: 'Checkbox', value: 'checkbox' },
        { text: 'Dropdown', value: 'dropdown' },
      ],
      answerType: null,
      choiceType: null,
      answerChoices: [],
      allowSkip: false,
      allowPass: false,
      diversityMedia: {
        audio: null,
        photo: null,
        video: null,
      },
      diversityOpen: false,
      quickLikertDefaults: Object.keys(likertOptions),
      hasCondition: false,

    };
  },
  computed: {
    ...mapState(['survey', 'questions']),
    ...mapGetters(['precedingQuestion']),
    canHaveCondition() {
      return this.precedingQuestion(this.id) !== null;
    },
  },
  watch: {
    initial(value) {
      if (value) {
        this.setData(value);
      }
    },
    answerType(t, oldValue) {
      if (['multiple-choice', 'likert', 'slider'].some(e => e === t)) {
        if (this.answerChoices.length === 0) {
          this.addChoice();
        }
      } else {
        this.answerChoices = [];
      }
      if (t === 'multiple-choice' && !this.choiceType) {
        this.choiceType = this.choiceTypes[0].value;
      }
      if (oldValue !== null) {
        this.$emit('update');
      }
    },
  },
  methods: {
    editorAlive(alive) {
      this.editorHidden = !alive;
      if (this.editorHidden) {
        if (this.answerChoices.length > 0) {
          // not tracking changes for these, just update
          this.$emit('update');
        }
      }
    },
    addChoice(_value) {
      let value = _value;
      if (value === undefined) value = '';

      const choices = this.$refs.answerChoice;
      if (choices === undefined || choices.length === 0
          || choices.slice(-1)[0].value !== '') {
        this.answerChoices.push({ value });
        this.focusLastChoice();
      }

      this.$emit('update');
    },
    removeChoice(index) {
      if (index > 0) {
        this.answerChoices.splice(index, 1);
      }
    },
    focusLastChoice() {
      Vue.nextTick().then(() => {
        const last = this.$refs.answerChoice.slice(-1)[0];
        if (last) last.focus();
      });
    },
    choiceKeyDown(index, e) {
      if (e.key === 'Enter') {
        this.addChoice();
      } else if (e.key === 'Backspace'
                 && this.answerChoices[index].value === '') {
        this.removeChoice(index);
        this.focusLastChoice();
        e.preventDefault();
      }
    },
    insertLikertOptions(l) {
      this.answerChoices = likertOptions[l].map(e => ({ value: e }));
    },
    renderChoice(v) {
      return emojiMap[v] || v;
    },
    openCloseDiversity() {
      this.diversityOpen = !this.diversityOpen;
      if (this.diversityOpen) {
        setTimeout(() => {
          window.addEventListener('click', this.openCloseDiversity);
        }, 100);
      } else {
        window.removeEventListener('click', this.openCloseDiversity);
      }
    },
    diversityAdded({ url, type }) {
      Vue.set(this.diversityMedia, type, url);
      this.$emit('update');
    },
    save() {
      const question = Object.assign({ id: this.id }, this.getData());
      this.$store.commit('addQuestion', question);
      this.$db.collection('question-bank').doc(this.id)
        .set(question);
    },
    getData() {
      const data = {};
      this.dataKeys.forEach((k) => { data[k] = this[k]; });
      data.html = this.$refs.editor.getHTML();
      data.text = this.$refs.editor.getText();
      if (this.hasCondition) {
        data.condition = this.$refs.condition.getData();
      }
      return data;
    },
    setData(data) {
      this.dataKeys.forEach((k) => {
        let v = data[k];
        if (v === undefined) {
          v = false;
        }
        if (k === 'answerChoices') {
          this.answerChoices = data[k].map((e) => {
            if (e.value !== undefined) {
              return e;
            }
            return { value: e };
          });
        } else {
          this[k] = v;
        }
      });
      if (this.hasCondition) {
        this.$refs.condition.setData(data.condition);
      }
      // backwards compatibility
      if (data.answerType === 'multiple-choice' && !data.choiceType) {
        this.choiceType = 'radio';
      }
    },
    getValue() {
      return {
        type: this.$options.name,
        id: this.id,
        number: this.number,
        index: this.index,
        value: this.getData(),
      };
    },
  },
  created() {
    this.answerType = this.answerTypes[0].value;
  },
  mounted() {
    if (this.initial) {
      this.setData(this.initial);
    }
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

div.question {
  .answer-type {
    margin-top: 10px;
    position: relative;

    .extra-sep {
      margin-left: 100px;
    }
  }

  .question-parts {
    display: flex;
    .page-number {
      margin-top: -5px;
      font-weight: bold;
      span {
        background: #fff;
      }
    }
    .editor {
    }
  }

  hr {
    margin: 6px 0px;
  }

  .tool-icon i {
    font-size: 13pt;
  }
}

.likert-defaults a {
  margin-left: 5px;
}

ul.choices li:first-child {
  margin-top: 10px;
}

li {
  input.input {
    width: 40%;
    max-width: 300px;
  }

  i {
    vertical-align: middle;
    margin-right: 5px;
  }


  i.fas:hover {
    cursor: pointer;
  }

  i.disabled {
    color: #bbb;
  }

  i.disabled:hover {
    cursor: auto;
  }
}

.is-audio {
  background: #0aa;
  border-color: transparent;
  color: #fff;
}

.question-extras {
  display: block;
  float: right;
  // margin-top: 3px;
  & > div, button {
    margin-right: 4px;
  }
}


div.rainbow {
  padding: 10px;
  height: 27px;
  overflow: hidden;
}

.dropdown-menu.diversity {
  .dropdown-content {
    width: 45px;
  }
  .dropdown-item {
    padding: 6px 16px;
    &.is-active {
      background-color: $primary;
    }
  }
}

.choices {
  .fa-circle {
    margin-bottom: 3px;
  }
}

</style>
