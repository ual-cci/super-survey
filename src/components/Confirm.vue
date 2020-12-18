<template lang="html">
<div class="modal confirm" :class="{ 'is-active': !!message }">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <p class="subtitle is-4">Are you sure you want to {{ message }}?</p>
      <p class="buttons is-right">
        <a class="button" @click="$emit('cancel')">No</a>
        <a class="button is-danger"
                @click="$emit('accept')">
          Yes
        </a>
      </p>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'confirm',
  props: {
    message: {
      type: String,
      default: null,
    },
  },
};
</script>

<style lang="scss" scoped>
.confirm .buttons {
  margin-top: 10px;
}
</style>
