<template lang="pug">
div.d-flex.flex-column.flex-grow-1
  v-toolbar.main-toolbar.fill-width(elevation='0')
    .title Recently Viewed
    v-spacer
    v-btn(text)
      v-icon fas fa-file-import
    add-project-dialog(
      :active='dialog'
      @on='dialog = true'
      @close='dialog = false')

  v-container(fluid)
    v-row(dense)
      project-card(v-for='project in projects' :key='project.id' :project='project')
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'
import ProjectCard from '@/components/ProjectCard.vue'
import AddProjectDialog from '@/components/AddProjectDialog.vue'
import { ProjectInfo } from '@/models/user/project'

@Component({ components: { ProjectCard, AddProjectDialog } })
export default class RecentlyViewed extends Vue {
  projects: ProjectInfo[] = []

  dummyProject: ProjectInfo = {
    id: '123',
    name: 'text',
    type: 'BBox',
    path: 'C:\\Users\\yongj\\Desktop\\imgs',
    createdAt: '2020-06-21 19:25'
  }

  dialog = false

  async mounted() {
    const { data } = await axios.get('http://localhost:8000/projects')

    this.projects = data
  }
}
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
