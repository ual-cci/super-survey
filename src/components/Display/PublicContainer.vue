<template>
<div class="public-container">
  <slot></slot>
</div>
</template>

<style lang="scss">
div.public-container {
  position: relative;;
  margin: 0px auto;
  padding-top: 5px;
  padding-left: 5px;
  padding-right: 5px;
  max-width: 840px;
  font-size: 1.2rem;

  video, img {
    max-width: 100%;
  }
  video {
    width: 100%;
  }
}
</style>
