<template>
<modal-popup ref='popup'>
  <h2>{{title}}</h2>
  <p>{{message}}</p>
  <div class='btns'>
    <button @click="okay">Okay</button>&nbsp;
    <button @click="cancel">Cancel</button>
  </div>
</modal-popup>
</template>

<script>
import ModalPopup from './ModalPopup.vue';

export default {
  name: 'confirm-popup',
  components: {
    ModalPopup,
  },
  data() {
    return {
      title: '',
      message: '',

      resolvePromise: null,
      rejectPromise: null,
    };
  },
  methods: {
    show(options = {}) {
      this.title = options.title;
      this.message = options.message;

      this.$refs.popup.open();

      return new Promise((resolve, reject) => {
        this.resolvePromise = resolve;
        this.rejectPromise = reject;
      });
    },
    okay() {
      this.$refs.popup.close();
      this.resolvePromise(true);
    },
    cancel() {
      this.$refs.popup.close();
      this.resolvePromise(false);
    },
  },
};
</script>

<style  lang="scss" scoped>
</style>
