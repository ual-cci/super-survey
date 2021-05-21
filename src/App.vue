<template>
<div id="app"  :class="globalElementClass">
  <router-view/>
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
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
