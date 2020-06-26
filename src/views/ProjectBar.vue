<template lang="pug">
v-app-bar.project-toolbar(fixed dark elevation='0' height='56px')
  v-btn-toggle.h100(borderless mandatory tile)
    v-btn.h100(text to="/" :class="isHome ? 'white' : 'black'" )
      v-icon(:color="isHome ? 'black' : 'white'") fas fa-home
    v-btn.h100(text v-for='project, i in projects' :key='i' :to="`/bbox/${project.info.id}`")
      span {{ project.info.name }}
      v-btn.ml-2(icon small)
        v-icon(small @click.prevent='closeProject(project.info.id)') fas fa-window-close
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { Project } from '@/models/user/project'

@Component
export default class ProjectBar extends Vue {
  @Getter('activeProjects') projects!: Project[]
  @Action closeProject!: Function

  get isHome() {
    return this.$route.name === 'main'
  }

  get currentId() {
    return this.$route.params.id
  }

  keyHandler({ ctrlKey, key }: KeyboardEvent) {
    if (ctrlKey && key.match(/^\d+$/)) {
      const project = this.projects[parseInt(key) - 1]
      if (!project || this.currentId === project.info.id) return
      this.$router.push(`/bbox/${project.info.id}`)
    }

    if (this.isHome) return

    if (ctrlKey && key === 'h') this.$router.push('/')
    if (ctrlKey && key === 'w') this.closeProject(this.currentId)
  }

  mounted() {
    window.addEventListener('keydown', this.keyHandler.bind(this))
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
