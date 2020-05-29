<template lang="pug">
v-app
  v-app-bar(app, dense color='white')
    .d-flex.align-center
      | Auto Annotator
    v-spacer
  v-content
    router-view
</template>

<script lang="ts">
export default {
  name: 'App'
}
</script>
