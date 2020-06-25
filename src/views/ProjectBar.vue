<template lang="pug">
v-app-bar.project-toolbar(fixed dark elevation='0' height='56px')
  v-btn-toggle.h100(borderless mandatory tile)
    v-btn.h100(text to="/" :class="isHome ? 'white' : 'black'" )
      v-icon(:color="isHome ? 'black' : 'white'") fas fa-home
    v-btn.h100(text v-for='project, i in projects' :key='i' :to="`/bbox/${project.info.id}`")
      span {{ project.info.name }}
      v-btn.ml-2(icon small)
        v-icon(small @click.prevent='close(i)') fas fa-window-close
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, Mutation } from 'vuex-class'
import { Project } from '@/models/user/project'

@Component
export default class ProjectBar extends Vue {
  @Getter('activeProjects') projects!: Project[]
  @Mutation closeProject!: Function

  get isHome() {
    return this.$route.name === 'main'
  }

  close(index: number) {
    const id = this.projects[index].info.id
    const currentPageId = this.$route.params.id

    if (id === currentPageId) {
      const nextProject = this.projects[index + 1]
      const prevProject = this.projects[index - 1]

      if (nextProject) this.$router.push(`/bbox/${nextProject.info.id}`)
      else if (prevProject) this.$router.push(`/bbox/${prevProject.info.id}`)
      else this.$router.push('/')
    }

    this.closeProject(id)
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
</style>
