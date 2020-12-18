<template>
    <div class="survey-element box">
      <div class="inner" :class="[`${type}_`, elementClass]">
          <div v-if="editable" class="meta">
            <i v-if="index !== 0 && auto === undefined"
                @click="$emit('remove')"
                class="fas fa-trash-alt">
            </i>
          </div>
        <slot></slot>
      </div>
      <div v-if="index !== 0" class="handle"></div>
  </div>
</template>

<script>
export default {
  props: {
    type: String,
    index: Number,
    elementClass: String,
    auto: Boolean,
    editable: Boolean,
  },
};
</script>

<style lang="scss">
$handle-width: 20px;

.survey-element {
  position: relative;
  background: #dee !important;
  padding: 0px !important; //4px 15px;
  padding-left: $handle-width !important;
  margin: 16px 0 !important;

  .inner {
    position: relative;
    border-radius: 5px;
    background: #fff;
    padding: 10px;
    min-height: 35px;
  }

  div.a, h3, h4 {
    display: inline;
  }

  .meta {
    position: absolute;
    bottom: 2px;
    right: 7px;
    z-index: 2;
    font-size: 15px;

    i:hover {
      cursor: pointer;
    }
  }

  .editor-content div {
    outline-width: 0px;
    border: 0px;
    height: 100%;
  }

  .editor-content {
    font-size: 1.25rem;
  }

  .page_ {
    background: #cfd !important;
    text-align: center;
  }

  .styling_ {
    background: #fff !important;
  }
}

.survey-element {
}

.handle {
  position: absolute;
  top: 0px;
  left: 0px;
  width: $handle-width;
  height: 100%;

  .question-number {
    margin: 8px 4px;
  }
}

.handle:hover {
  cursor: grab;
}
</style>
