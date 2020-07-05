<template lang="pug">
v-col(md='4' xs='6' sm='6')
  v-card(@click='open')
    v-card-title
      div {{ project.name }}
      v-spacer
      v-menu(offset-y)
        template(v-slot:activator='{ on, attrs }')
          v-btn(icon v-bind='attrs', v-on='on')
            v-icon mdi-dots-vertical
        v-list
          v-list-item(@click='deleteProject')
            v-list-item-title 삭제

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

  async open() {
    this.$router.push(`/${this.project.type.toLowerCase()}/${this.project.id}`)
  }

  async deleteProject() {
    this.$emit('delete', this.project.id)
  }
}
</script>

<style scoped></style>
