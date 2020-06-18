<template lang="pug">
v-app
  project-bar
  v-content
    router-view
</template>

<script lang="ts">
import ProjectBar from '@/views/ProjectBar.vue'

export default {
  name: 'App',
  components: {
    ProjectBar
  }
}
</script>
