<template>
  <div class="editor" :class="{ narrow: !alive }"
        @mouseleave="mouseOver = false"
        @mouseover="mouseOver = true">
    <editor-menu-bar :editor="editor">
      <div class="menubar"
           :class="{ focused: alive }"
           slot-scope="{ commands, isActive, getMarkAttrs }">
        <input type="file" ref="fileinput" style="display: none"/>

        <slot></slot>

        <div class="tools">
          <button v-for="level in [1, 2, 3]" :key="level"
            class="button is-small"
            :class="{ 'is-active': isActive.heading({ level }) }"
            @click="commands.heading({ level })">
            <b>H{{ level }}</b>
          </button>


          <button
            class="button is-small"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold">
            <i class="fas fa-bold"></i>
          </button>

          <button
            class="button is-small"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic">
            <i class="fas fa-italic"></i>
          </button>

          <button
            class="button is-small"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline">
            <i class="fas fa-underline"></i>
          </button>

          <button
            class="button is-small"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.italic">
            <i class="fas fa-quote-right"></i>
          </button>

          <button
            class="button is-small"
            :class="{ 'is-active': isActive.link() }"
            @click="showLinkMenu(getMarkAttrs('link'))">
            <i class="fas fa-link"></i>
          </button>

          <div v-if="linkMenuIsActive" class="modal link-editor"
               :class="{ 'is-active': linkMenuIsActive }">
            <div class="modal-background"></div>
            <div class="modal-content">
              <div class="box">
                <p>Enter link URL:</p>
                <input class="input"
                   type="text"
                   v-model="linkUrl"
                   placeholder="https://" ref="linkInput"
                   @keydown.esc="hideLinkMenu"
                   @keydown.enter.prevent="setLinkUrl(commands.link, linkUrl)"/>
                <p class="control buttons is-right">
                  <a class="button is-danger" @click="setLinkUrl(commands.link, null)">Remove</a>
                  <a class="button is-warning" @click="linkMenuIsActive = false">Cancel</a>
                  <a class="button is-info" @click="setLinkUrl(commands.link, linkUrl)">Set</a>
                </p>
              </div>
            </div>
          </div>

          <media-upload v-for="(icon, type) in mediaIcons" :key="type"
                        :type="type"
                        :path="'question-media'"
                        @uploaded="mediaUploaded">
            <template slot-scope="{ open, progress, cancel }">
              <button class="button is-small" @click="open">
                <i class="fas" :class="icon"></i>
              </button>
              <div class="modal" :class="{ 'is-active': progress > 0 && progress < 100 }">
                <div class="modal-background"></div>
                <div class="modal-content">
                  <div class="box">
                    <h1 class="title">Uploading...</h1>
                    <progress class="progress is-info" :value="progress" max="100"></progress>
                  </div>
                </div>
                <button class="modal-close is-large" @click="cancel" aria-label="close"></button>
              </div>

            </template>
          </media-upload>
        </div>
        <hr>
      </div>
    </editor-menu-bar>

    <editor-content class="editor-content" :editor="editor" />
  </div>
</template>

<script>
import {
  Editor, EditorContent, EditorMenuBar,
} from 'tiptap';
import {
  Bold, Italic, Underline, Blockquote, Heading,
} from 'tiptap-extensions';
import MediaUpload from '@/components/MediaUpload.vue';
import { Image, Audio, Video } from './EditorNodes';
import Link from './EditorNodes/Link';

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    MediaUpload,
  },
  props: {
    initial: String,
    parentAlive: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Bold(),
          new Italic(),
          new Underline(),
          new Blockquote(),
          new Link(),
          new Heading({ levels: [1, 2, 3] }),
          new Image(),
          new Audio(),
          new Video(),
        ],
        autoFocus: !this.initial,
        content: '',
      }),
      linkUrl: null,
      linkMenuIsActive: false,
      cachedHTML: '',
      forceFocus: false,
    };
  },
  computed: {
    alive() {
      return this.editable && (this.forceFocus || (this.editor && this.editor.view.focused));
    },
  },
  watch: {
    alive(v) {
      this.editor.setOptions({ editable: v });
      if (!v && this.isEmpty()) {
        this.$emit('empty');
      } else if (v) {
        this.forceFocus = true;
      }
      if (!v && !this.isEmpty() && this.cachedHTML !== this.getHTML()) {
        this.$emit('update');
        this.cachedHTML = this.getHTML();
      }
      this.$emit('alive', v);
    },
    initial() {
      if (this.initial) {
        this.editor.setContent(this.initial);
        this.cachedHTML = this.initial;
      }
    },
  },
  methods: {
    getText() {
      return this.editor.view.dom.textContent;
    },
    isEmpty() {
      return this.getText().trim() === '';
    },
    getHTML() {
      return this.editor.getHTML();
    },
    setHTML(html) {
      this.editor.setContent(html);
      this.editor.blur();
      this.forceFocus = false;
    },
    windowClickHandler() {
      this.forceFocus = this.parentAlive;
    },
    mediaUploaded({ type, url }) {
      if (type === 'photo') {
        type = 'image';
      }
      this.editor.commands[type]({ type, src: url });
    },
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.linkMenuIsActive = true;
      this.$nextTick(() => {
        this.$refs.linkInput.focus();
      });
    },
    hideLinkMenu() {
      this.linkUrl = null;
      this.linkMenuIsActive = false;
    },
    setLinkUrl(command, url) {
      command({ href: url });
      this.hideLinkMenu();
    },
  },
  created() {
    if (this.initial) {
      this.editor.setContent(this.initial);
      this.cachedHTML = this.initial;
    }
    this.editor.setOptions({ editable: this.editable });
  },
  mounted() {
    this.editor.options.onFocus = () => {
      this.mouseOver = true;
    };

    const { fileinput } = this.$refs;
    fileinput.addEventListener('input', this.uploadMediaHandler);

    window.addEventListener('click', this.windowClickHandler);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.alive) {
          this.forceFocus = false;
          this.editor.blur();
        }
      }
    });
  },
  beforeDestroy() {
    this.editor.destroy();
    window.removeEventListener('click', this.windowClickHandler);
  },
};
</script>

<style lang="scss">
@import "@/styles/variables.scss";

.editor {
  display: inline-block;
  width: 100%;
  word-break: break-all;

  &.narrow {
    // width: 96%;
  }

  .editor-content {
    word-break: break-word;

    img.diversity, audio.diversity, video.diversity {
      border: 1px solid #f5b;
    }

    h1 {
      font-weight: normal;
    }
  }
}

.editor .menubar {
  display: none;
  opacity: 0;
  // height: 0px;

  button {
    margin-right: 3px;
    margin-bottom: 8px;
  }

  span.extra-sep {
    margin: 0px 10px;
  }

  hr {
    margin: 0;
    margin-bottom: 3px;
  }

  .tools {
    clear: both;
  }
}

.editor .menubar.focused {
  display: block;
  opacity: 1;
  // height: 35px;
}

.link-editor {
  .buttons {
    margin-top: 10px;
  }
}

</style>
