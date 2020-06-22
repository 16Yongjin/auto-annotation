<template lang="pug">
v-app-bar.project-toolbar(fixed dark elevation='0' height='56px')
  v-btn-toggle.h100(borderless mandatory tile)
    v-btn.h100(text @click='test' to="/" :class="isHome ? 'white' : 'black'" )
      v-icon(:color="isHome ? 'black' : 'white'") fas fa-home
    v-btn.h100(text v-for='project, i in projects' :key='i' :to="`/bbox/${project.info.id}`")
      span {{ project.info.name }} {{ project.info.id }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { Project } from '@/models/user/project'

@Component
export default class ProjectBar extends Vue {
  @Getter('activeProjects') projects!: Project[]

  get isHome() {
    return this.$route.name === 'main'
  }

  test() {
    console.log(this.projects)
  }
}
</script>

<style>
.project-toolbar .v-toolbar__content {
  padding: 0 !important;
}

.project-toolbar.v-toolbar {
  width: 100%;
  flex: none;
}

.h100 {
  height: 100% !important;
}
</style>
