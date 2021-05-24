<template>
<public-container>
  <img src="/img/logo.png">
  <div class="enter">
    <h1>Super Survey</h1>

    <p>
      Hello and welcome to Super Survey!
    </p>

    <p>
      Please identify yourself with either your email address or phone number.
    </p>

    <div class="control has-icons-left has-icons-right">
      <input class="input" type="email"
              placeholder="Email address"
              :disabled="valid.phone"
              @keydown.enter="identifyUser"
              v-model="email">
      <span class="icon is-left">
        <i class="fas fa-envelope"></i>
      </span>
      <span v-if="valid.email" class="icon is-right tick">
        <i class="fas fa-check"></i>
      </span>
    </div>

    <div class="control has-icons-left has-icons-right">
      <input class="input" type="tel"
              placeholder="Phone number"
              :disabled="valid.email"
              @keydown.enter="identifyUser"
              v-model="phone">
      <span class="icon is-left">
        <i class="fas fa-phone"></i>
      </span>
      <span v-if="valid.phone" class="icon is-right tick">
        <i class="fas fa-check"></i>
      </span>
    </div>

    <span class="button subtitle is-4 is-link"
          :disabled="!eitherValid"
          @click="identifyUser">OK</span>

    <h2>
      Why do we need to do this?
    </h2>
    <p>
      We need your email or phone number so that we can:
    </p>
    <ul>
      <li>Tell you apart from other people</li>
      <li>Track your answers over time</li>
    </ul>
  </div>
</public-container>
</template>

<script>
import PublicContainer from '@/components/Display/PublicContainer.vue';

export default {
  components: {
    PublicContainer,
  },
  props: {
    stage: {
      type: String,
      default: 'home',
    },
    surveyID: String,
  },
  data() {
    return {
      showWhy: false,
      email: '',
      phone: '',
      valid: {
        email: false,
        phone: false,
      },
      loginError: false,
    };
  },
  computed: {
    eitherValid() {
      return this.valid.email || this.valid.phone;
    },
    id() {
      return (this.valid.email ? this.email : this.phone).trim();
    },
  },
  watch: {
    email(v) {
      this.valid.email = this.validEmail(v);
    },
    phone(v) {
      this.valid.phone = this.validPhone(v);
    },
  },
  methods: {
    home() {
      this.showWhy = false;
      this.$router.push('/enter');
    },
    success(docRef) {
      const payload = Object.assign({ id: this.id }, docRef.data());
      this.$store.commit('setUser', payload);
      this.$router.push({ name: 'survey', params: { surveyID: this.surveyID } });
    },
    fail() {
      this.loginError = true;
    },
    identifyUser() {
      if (this.eitherValid) {
        const payload = {
          signedUp: new Date(),
        };
        if (this.valid.email) {
          payload.idType = 'email';
        } else if (this.valid.phone) {
          payload.idType = 'phone';
        }

        this.requestLogin(this.id)
          .then(this.success)
          .catch(() => {
            this.$db.collection('users').doc(this.id)
              .set(payload, { merge: true });
            // don't wait for the set, we can continue
            this.success({ data: () => payload });
          });
      }
    },
    requestLogin(id) {
      return new Promise((resolve, reject) => {
        this.$db.collection('users').doc(id)
          .get()
          .then((docRef) => {
            if (docRef.exists) {
              resolve(docRef);
            } else {
              reject();
            }
          });
      });
    },
  },
};
</script>

<style lang="scss">
@import "@/styles/public/main.scss";
</style>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
div.enter {

  h2 {
    margin-bottom: 25px;
  }

  .control {
    max-width: 500px;
  }

  input {
    margin-bottom: 10px;
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column wrap;
    align-content: stretch;
    height: 100px;
  }

  .button {
    margin-top: 20px;
  }

  .icon.tick {
    color: $arcade-green;
  }

  .why {
    font-size: 12pt;
    text-align: left;
    ul {
      list-style: disc;
      margin-left: 20px;
    }
  }
}

.home {
    &:hover {
      cursor: pointer;
    }
  }

// .slide-enter {
//   transform: translateX(-100%);
// }
// .slide-enter-active, .slide-leave-active {
//   transition: transform 1000ms;
// }
// .slide-enter-to, .slide-leave {
//   transfrom: translateX(0%);
// }
// .slide-leave-to {
//   transform: translateX(100%);
// }
</style>
