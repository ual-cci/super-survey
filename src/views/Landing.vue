<template>
<div class="landing">
  <img src="/img/logo-large.png" alt="">
</div>
</template>

<script type="text/javascript">
export default {
  created() {
    this.$store.state.surveyElementClass = 'green-background';
  },
  beforeDestroy() {
    this.$store.state.surveyElementClass = 'default-element';
  },
};
</script>

<style lang="scss">
@import "@/styles/variables.scss";
.landing {
  margin: 0;
  padding: 0;
  // background: $arcade-green;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 240px;
  }
}
</style>
