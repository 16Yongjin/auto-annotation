<template lang="pug">
div.d-flex.flex-column.flex-grow-1
  v-toolbar.toolbar.fill-width(elevation='0')
    .title Recently Viewed
    v-spacer
    v-btn(icon color='black')
      v-icon mdi-import
    add-project-dialog(
      :active='dialog'
      @on='dialog = true'
      @close='dialog = false')

  v-container(fluid)
    v-row(dense)
      project-card(v-for='project in projects' :key='project.id' :project='project' @delete='onProjectDelete')
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ProjectCard from '@/components/main/ProjectCard.vue'
import AddProjectDialog from '@/components/main/AddProjectDialog.vue'
import { ProjectInfo } from '@/models/user/project'
import { db } from '@/electron/db'
import { Action } from 'vuex-class'

@Component({ components: { ProjectCard, AddProjectDialog } })
export default class RecentlyViewed extends Vue {
  @Action deleteProject!: Function

  projects: ProjectInfo[] = []

  dummyProject: ProjectInfo = {
    id: '123',
    name: 'text',
    type: 'BBox',
    path: 'C:\\Users\\yongj\\Desktop\\imgs',
    createdAt: '2020-06-21 19:25',
    lastSelectedIndex: 0
  }

  dialog = false

  loadProject() {
    this.projects = db
      .get('projects')
      .map('info')
      .value()
  }

  mounted() {
    this.loadProject()
  }

  async onProjectDelete(id: string) {
    await this.deleteProject(id)
    this.loadProject()
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
