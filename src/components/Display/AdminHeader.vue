<template>
<header class="admin">
  <div class="creds">
    <button class="button is-info is-small"
            name="button"
            @click="signOut">
        Logout
    </button>
  </div>
  <router-link :to="{ name: 'projects' }">
    <img src="/img/hns-ath.png" alt="">
  </router-link>
</header>
</template>


<script>
export default {
  methods: {
    signOut() {
      this.$auth.signOut();
      this.$router.push('/admin');
    },
  },
};
</script>

<style lang="scss">
header.admin {
  position: relative;
  text-align: center;
  width: 100%;

  div.creds {
    position: absolute;
    z-index: 10;
    right: 0;
  }
}
</style>
