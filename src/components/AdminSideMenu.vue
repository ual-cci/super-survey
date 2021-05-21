<template>
<aside class="column menu is-2  section is-fullheight">
  <p class="menu-label">
    Projects
  </p>
  <div v-if="projects" class="project-list">
    <ul class="menu-list">
      <li v-for="project in projects" :key="project.id"
          :project="project"
          :user="user">
          <router-link :to="{
                          name: 'project-details',
                          params: { projectID: project.id }
                        }">
            {{project.name}}
          </router-link>
      </li>
    </ul>
  </div>
</aside>
</template>

<script>

export default {
  props: {
    projects: Array,
  },
  created() {
  },
};
</script>

<style lang="scss">
@import "@/styles/admin.scss";

aside.menu {
  background-color: #eee;
}

</style>
