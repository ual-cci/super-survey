<template>
<public-container>
  <img src="/img/logo.png">
  <div v-if="stage !== 'home'" class="home" @click="home">
    <i class="fas fa-home"></i>
  </div>
  <div class="enter">
    <div v-if="stage === 'home'" class="been">
      <p>
        Hello and welcome to Super Survey!
      </p>
      <div class="buttons">
        <span class="button  is-medium is-link"
              @click="$router.push({ name: 'enter', params: {
                stage: 'signup', surveyID: surveyID,
              }})">No</span>
        <span class="button is-medium is-info"
              @click="$router.push({ name: 'enter', params: {
                stage: 'login', surveyID: surveyID,
              }})">Yes</span>
      </div>
    </div>
    <div v-else-if="stage === 'login' || stage === 'signup'" class="been">
      <template v-if="stage === 'login'">
        <h2 v-if="loginError">
          Sorry! We don’t know that email or phone number. Can you please try again?
          Please enter the email address or phone number that you used before:
        </h2>
        <h2 v-else>
          Please enter the email address or phone number that you used before:
        </h2>
      </template>

      <template v-else-if="stage === 'signup'">
        <h2>
          To begin with, we will need your email address or phone number.
          This will be your ID, so that we can tell you apart from other
          people and track your answers over time if you answer more of our
          questions. We won’t use your email address for anything else
          without your consent.
        </h2>
      </template>
      <div class="control has-icons-left has-icons-right">
        <input class="input" type="email"
               placeholder="Email address"
               :disabled="valid.phone"
               @keydown.enter="okAction"
               v-model="email">
        <span class="icon is-left">
          <i class="fas fa-envelope"></i>
        </span>
        <span v-if="stage === 'signup' && valid.email" class="icon is-right tick">
          <i class="fas fa-check"></i>
        </span>
      </div>
      <div class="control has-icons-left has-icons-right">
        <input class="input" type="tel"
               placeholder="Phone number"
               :disabled="valid.email"
               @keydown.enter="okAction"
               v-model="phone">
        <span class="icon is-left">
          <i class="fas fa-phone"></i>
        </span>
        <span v-if="stage === 'signup' && valid.phone" class="icon is-right tick">
          <i class="fas fa-check"></i>
        </span>
      </div>
      <span class="button subtitle is-4 is-link"
            :disabled="stage === 'signup' && !eitherValid"
            @click="okAction">OK</span>
      <div v-if="stage === 'signup'" class="why">
        <p v-if="showWhy">
          We need your email or phone number so that we can:
          <ul>
            <li>Tell you apart from other people</li>
            <li>Track your answers over time</li>
          </ul>
        </p>
        <a v-else @click="showWhy = true">Why do we need this?</a>
      </div>
    </div>
  </div>
</public-container>
</template>

<script>
import PublicContainer from '@/components/Display/PublicContainer.vue';
import { randomThing } from '@/thing-generator';

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
    okAction() {
      return this.stage === 'signup' ? this.signUp : this.login;
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
    signUp() {
      if (this.eitherValid) {
        const payload = {
          signedUp: new Date(),
          anonID: randomThing(),
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
    login() {
      if (this.email !== '') {
        this.requestLogin(this.email)
          .then(this.success)
          .catch(this.fail);
      } else if (this.phone !== '') {
        this.requestLogin(this.phone)
          .then(this.success)
          .catch(this.fail);
      } else {
        this.fail();
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
