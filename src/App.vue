<template>
<div id="app"  :class="globalElementClass">
  <div class="container">
    <router-view/>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      globalElementClass: state => state.surveyElementClass,
    }),
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
}

#app {
  .container {
    position: relative;
    margin: 0px auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    max-width: 1122px;
    width: unset !important;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
