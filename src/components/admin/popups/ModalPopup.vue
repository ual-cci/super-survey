<template>
<div class='popup-modal' v-if='isVisible'>
  <div class='window'>
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  name: 'modal-popup',
  data() {
    return { isVisible: false };
  },
  methods: {
    open() {
      this.isVisible = true;
    },
    close() {
      this.isVisible = false;
    },
  },
};
</script>

<style  lang="scss" scoped>

.popup-modal {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  padding: 1em;
  align-items: center;
  z-index: 1000;

  .window {
    background-color: #fff;
    box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.5);
    border-radius: 3px;
    max-width: 480px;
    margin: 0 auto;
    padding: 1em;
  }
}
</style>
