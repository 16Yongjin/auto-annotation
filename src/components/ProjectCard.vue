<template lang="pug">
v-col(md='4' xs='6' sm='6')
  v-card(@click='open')
    v-card-title {{ project.name }}
    v-card-text {{ project.type }}
    v-card-text {{ project.path }}
    v-card-text {{ project.createdAt }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import axios from 'axios'
import { Mutation } from 'vuex-class'
import { ProjectInfo, Project } from '@/models/user/project'

@Component
export default class ProjectCard extends Vue {
  @Prop() project!: ProjectInfo
  @Mutation openProject!: Function

  async open() {
    const { data } = await axios.get<Project>(
      `http://localhost:8000/projects/${this.project.id}`
    )

    this.openProject(data)

    this.$router.push(`/bbox/${data.info.id}`)
  }
}
</script>

<style scoped></style>
