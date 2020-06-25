<template lang="pug">
div.flex-grow-1
  v-toolbar.toolbar.fill-width(elevation='0')
    v-text-field(v-model='query' hide-details prepend-icon='fas fa-search' placeholder='Search' single-line)
  v-container.fill-height.align-start
    v-row.fill-height.justify-center.align-center(v-if='!query')
      div Type something to start searching
    v-row(v-else-if='projects.length' dense)
      project-card(v-for='project in projects' :key='project.id' :project='project' @delete='onProjectDelete')
    v-row.fill-height.justify-center.align-center(v-else)
      div No project found
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { ProjectInfo } from '@/models/user/project'
import ProjectCard from '@/components/main/ProjectCard.vue'
import { db } from '@/electron/db'

@Component({ components: { ProjectCard } })
export default class SearchProject extends Vue {
  query = ''
  projects: ProjectInfo[] = []

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

  onProjectDelete() {
    this.onQueryChanged()
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
