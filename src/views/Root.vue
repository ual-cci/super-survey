<template>
  <main id='root'>
    <h1>Super Survey!</h1>
    <p>
      <a @click="$router.push({name: 'admin-login'})">Admin log in</a>
    </p>

    <section id='surveys'>
      <h2>List of surveys</h2>
      <div v-if="!loaded">
        Data is loading
      </div>
      <div v-else>
        <p>System has {{surveyCount}} surveys</p>
        <ul id='survey-list'>
          <li v-for="survey in surveys" :key="survey.id">
            <a @click="$router.push({name: 'survey', surveyID: survey.id})">{{survey.title}}</a>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  data() {
    return {
      loaded: false,
      surveys: [],
      surveyCount: 0
    };
  },

  created() {
    this.$db.collection('surveys')
      .orderBy('title')
      .get()
      .then((snapshot) => {
        let surveyData = snapshot.docs.map( doc => {
          return {
            id: doc.id,
            title: doc.data().title
          };
        });
        
        this.loaded = true;
        this.surveys = surveyData,
        this.surveyCount = surveyData.length;
    });
  }
};
</script>

<style lang="scss">
@import "@/styles/public/main.scss";
</style>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

main#root {
  h1, h2 {
    font-weight: bold;
    margin-bottom: 0.25em;
  }

  h1 {
    font-size: 2em;  
  }
  h2 {
    font-size: 1.5em;
  }

  section#surveys {
    margin-top: 1em;

    ul#survey-list {
      padding-left: 1em;
    }
  }
}

</style>