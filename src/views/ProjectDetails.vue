<template>
<div class='is-fullheight'>
  <section class="main-content columns is-fullheight">

    <admin-header></admin-header>

    <h1>Project Details</h1>
    <h2>{{$store.state.project.name}}</h2>
  </section>
</div>
</template>

<script>
// import Vue from 'vue';
import { mapState } from 'vuex';
import AdminHeader from '@/components/Display/AdminHeader.vue';

export default {
  name: 'project-details',
  components: {
    AdminHeader,
  },
  props: {
    projectID: String,
  },
  computed: {
    ...mapState(['project']),
  },
  created() {
    this.$db.collection('projects').doc(this.projectID)
      .get()
      .then((doc) => {
        const project = doc.data();
        console.log("loaded project: ", project);

        this.$store.state.project = project;
        this.$store.state.project.id = this.projectID;
      });
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

</style>
