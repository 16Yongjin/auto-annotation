<template lang="pug">
v-col(md='4' xs='6' sm='6')
  v-card
    v-card-title {{ project.name }}
    v-card-text {{ project.type }}
    v-card-text {{ project.path }}
    v-card-text {{ project.createdAt }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ProjectInfo } from '@/models/user/project'

@Component
export default class ProjectCard extends Vue {
  @Prop() project!: ProjectInfo
}
</script>

<style scoped></style>
