<template lang="html">
<div class="signups">
  <button class="button is-link" @click="download('signups')">
    Download email signup CSV
    <i v-if="fetching === 'signups'" class="fa fa-spinner fa-pulse"></i>
  </button>
  <button class="button is-link" @click="download('creative-pack-signups')">
    Download creative packs signup CSV
    <i v-if="fetching === 'creative-pack-signups'" class="fa fa-spinner fa-pulse"></i>
  </button>
</div>
</template>

<script>
import download from 'downloadjs';

export default {
  data() {
    return {
      production: true,
      fetching: null,
    };
  },
  methods: {
    download(path) {
      this.fetching = path;
      this.$auth.currentUser.getIdToken(true)
        .then((token) => {
          let baseURL = 'https://europe-west1-heartnsoul-asks.cloudfunctions.net/app';
          if (!this.production) {
            baseURL = 'http://localhost:5000/heartnsoul-asks/us-central1/app';
          }
          const url = `${baseURL}/${path}`;

          fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then(response => response.blob())
            .then((blob) => {
              const filename = `${path}.csv`;
              download(blob, filename, 'text/csv');
              this.fetching = false;
            });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/admin.scss";
.signups {
  display: block;
  margin: 0 auto;
  width: 300px;
  text-align: center;
  margin-top: 20%;

  button {
    display: block;
    margin: 40px auto; //20px;
  }
}
</style>
