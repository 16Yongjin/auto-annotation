<template lang="pug">
v-col(md='4' xs='6' sm='6')
  v-card(@click='open')
    v-card-title
      div {{ project.name }}
      v-spacer
      v-menu(offset-y)
        template(v-slot:activator='{ on, attrs }')
          v-btn(icon v-bind='attrs', v-on='on')
            v-icon fas fa-ellipsis-v
        v-list
          v-list-item(@click='deleteProject')
            v-list-item-title 삭제

    v-card-text {{ project.type }}
    v-card-text {{ project.path }}
    v-card-text {{ project.createdAt }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { ProjectInfo } from '@/models/user/project'
import { db } from '@/electron/db'

@Component
export default class ProjectCard extends Vue {
  @Prop() project!: ProjectInfo
  @Action openProject!: Function

  async open() {
    this.$router.push(`/bbox/${this.project.id}`)
  }

  async deleteProject() {
    const { id } = this.project

    await db
      .get('projects')
      .remove({ info: { id } })
      .write()

    this.$emit('delete')
  }
}
</script>

<style scoped></style>
