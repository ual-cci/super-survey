<template>
<div class="login">
  <img src="/img/logo.png" alt="" />
  <div class="box">
    <form class="login" @submit.prevent="login">
      <div class="field">
        <p class="control has-icons-left has-icons-right">
          <input class="input" type="email" placeholder="Email"
                  autocomplete="username"
                  v-model="email" />
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <div class="control has-icons-left">
          <input class="input" :class="{ 'is-danger': incorrect }"
                 type="password" placeholder="Password"
                 autocomplete="current-password"
                 v-model="password" />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
          <p v-if="incorrect" class="help is-danger">
            Incorrect password
          </p>
        </div>
      </div>
      <div class="field">
        <p class="control">
          <button class="button is-info" type="submit">
            Login
          </button>
        </p>
      </div>
    </form>
  </div>
</div>
</template>

<script>

export default {
  props: {
    nextPage: String,
  },
  data() {
    return {
      email: '',
      password: '',
      incorrect: false,
    };
  },
  methods: {
    login() {
      this.$auth.signInWithEmailAndPassword(this.email, this.password).then(() => {
        this.$router.push({ name: this.nextPage || 'projects' });
      }).catch(() => {
        this.incorrect = true;
      });
    },
  },
  created() {
    document.querySelector('html').style.background = '#ddd';
  },
  destroyed() {
    document.querySelector('html').style.background = '#fff';
  },
};

</script>

<style lang="scss">
@import "@/styles/admin.scss";
</style>

<style lang="scss" scoped>

div.login {
  text-align: center;
  max-width: 400px;
  margin: 50px auto;

  .box {
    margin-top: 25px;
  }

  form {
    text-align: left;
  }

}
</style>
