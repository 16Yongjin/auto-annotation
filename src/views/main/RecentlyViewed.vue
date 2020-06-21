<template lang="pug">
div.d-flex.flex-column.flex-grow-1
  v-toolbar.main-toolbar.fill-width(elevation='0')
    .title Recently Viewed
    v-spacer
    v-btn(text)
      v-icon fas fa-file-import
    add-project-dialog(:active='dialog' @on='dialog = true' @close='dialog = false' @outside='dialog = false')

  v-container(fluid)
    v-row(dense)
      project-card(v-for='i in 20' :key='i' :project='dummyProject')
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ProjectCard from '@/components/ProjectCard.vue'
import AddProjectDialog from '@/components/AddProjectDialog.vue'
import { ProjectInfo } from '@/models/user/project'

@Component({ components: { ProjectCard, AddProjectDialog } })
export default class RecentlyViewed extends Vue {
  dummyProject: ProjectInfo = {
    name: 'text',
    type: 'BBox',
    path: 'C:\\Users\\yongj\\Desktop\\imgs',
    createdAt: '2020-06-21 19:25'
  }

  dialog = false
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
