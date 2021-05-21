<template>
<header class="nav admin navbar">
  <div class='navbar-item'>
    <div id='logo' class='navbar-brand'>
      Super Survey
    </div>
  </div>

  <div class='navbar-end'>
    <div class='navbar-item'>
      <div id='user-name'>
        {{ user.displayName }}
      </div>
    </div>

    <div class="navbar-item">
      <button class="button is-info is-small"
              name="button"
              @click="signOut">
          Logout
      </button>
    </div>
  </div>
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
  computed: {
    user() {
      return this.$auth.currentUser;
    },
  },
};

</script>

<style lang="scss">
header.admin {
  background-color: #ddd;
  position: relative;
  text-align: center;
  width: 100%;

  #logo {
    font-weight: bold;
    font-size: 2em;

  }

  div.creds {
    position: absolute;
    z-index: 10;
    right: 0;
  }
}
</style>
