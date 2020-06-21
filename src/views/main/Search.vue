<template lang="pug">
div.d-flex.flex-column.flex-grow-1.justify-center.align-center
  v-toolbar.main-toolbar.fill-width(elevation='0')
    v-text-field(hide-details prepend-icon='fas fa-search' placeholder='Search' single-line)
  div Type something to start searching
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class SearchProject extends Vue {}
</script>

<style scoped>
.main-toolbar {
  position: fixed;
  top: 56px;
  width: calc(100% - 256px);
  border-bottom: 1px solid #eee;
  z-index: 1;
}
</style>
