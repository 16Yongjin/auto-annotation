<template lang="pug">
v-app
  project-bar
  v-content(style='margin-top: 56px;')
    keep-alive(:include="['BBox', 'Segmentator']")
      router-view
</template>

<script lang="ts">
import ProjectBar from '@/views/common/ProjectBar.vue'

export default {
  name: 'App',
  components: {
    ProjectBar
  }
}
</script>
