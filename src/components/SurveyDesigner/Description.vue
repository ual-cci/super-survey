<template>
<div @mouseover="mouseOver = true" @mouseleave="mouseOver = false">
  <text-editor ref="editor" :forceAlive="false"
              :initial="initial"
              :parent-alive="mouseOver"
              @empty="$emit('empty')"
              @update="$emit('update')">
  </text-editor>
</div>
</template>

<script>
import TextEditor from '@/components/TextEditor.vue';

export default {
  name: 'description',
  components: { TextEditor },
  props: {
    initial: String,
    index: Number,
  },
  data() {
    return {
      mouseOver: false,
    };
  },
  methods: {
    getValue() {
      return {
        type: this.$options.name,
        value: this.$refs.editor.getHTML(),
        index: this.index,
      };
    },
  },
};

</script>
