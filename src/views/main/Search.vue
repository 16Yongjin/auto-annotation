<template lang="pug">
div.flex-grow-1
  v-toolbar.toolbar.fill-width(elevation='0')
    v-text-field(v-model='query' hide-details prepend-icon='mdi-magnify' placeholder='Search' single-line)
  v-container.pa-0.fill-height.align-start
    v-row.fill-height.justify-center.align-center(v-if='!query')
      div Type something to start searching
    v-row.pa-3(v-else-if='projects.length' dense :style='backgroundColor')
      project-card(v-for='project in projects' :key='project.id' :project='project' @delete='onProjectDelete')
    v-row.fill-height.justify-center.align-center(v-else)
      div No project found
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { ProjectInfo } from '@/models/user/project'
import ProjectCard from '@/components/main/ProjectCard.vue'
import { db } from '@/electron/db'

@Component({ components: { ProjectCard } })
export default class SearchProject extends Vue {
  query = ''
  projects: ProjectInfo[] = []
  @Action deleteProject!: Function

  findProjects(query: string) {
    return db
      .get('projects')
      .filter(p => p.info.name.includes(query))
      .map('info')
      .value()
  }

  @Watch('query')
  onQueryChanged() {
    this.projects = this.findProjects(this.query)
  }

  async onProjectDelete(id: string) {
    await this.deleteProject(id)
    this.onQueryChanged()
  }

  get backgroundColor() {
    return {
      backgroundColor: this.$vuetify.theme.dark ? '#121212' : 'white'
    }
  }
}
</script>

<style scoped>
.toolbar {
  position: fixed;
  top: 56px;
  width: calc(100% - 256px);
  border-bottom: 1px solid #eee;
  z-index: 1;
}
</style>
