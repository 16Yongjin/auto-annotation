<template lang="pug">
v-toolbar.toolbar
  v-btn-toggle(borderless mandatory tile)
    v-btn(text @click='test')
      v-icon fas fa-home
    v-btn(text v-for='project, i in projects' :key='i')
      span {{ project.name }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { Project } from '@/models/user/project'

@Component
export default class ProjectBar extends Vue {
  @Getter('activeProjects') projects!: Project[]

  test() {
    console.log('hi')
  }
}
</script>

<style>
.toolbar .v-toolbar__content {
  padding: 0 !important;
}
</style>
