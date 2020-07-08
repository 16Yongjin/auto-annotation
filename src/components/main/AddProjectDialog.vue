<template lang="pug">
v-dialog(:value='active' max-width='600px' @outside="$emit('close')")
  template(v-slot:activator='{ on, attrs }')
    v-btn(icon color='black' v-bind='attrs' v-on='on' @click="$emit('on')")
      v-icon mdi-plus
  v-card
    v-card-title
      span.headline 새 프로젝트
    v-card-text
      v-form(v-model='valid')
        v-container
          v-row
            v-col(cols='12')
              v-text-field(
                required
                label='프로젝트 이름'
                v-model='projectInfo.name'
                :rules='[Boolean]')
            v-col(cols='12')
              v-text-field(
                readonly
                required
                label='이미지 폴더'
                v-model='projectInfo.path'
                @click='selectFolder'
                :rules='[Boolean]'
                append-icon='mdi-dots-horizontal')
            v-col(cols='12')
              v-select(
                required
                :items="['BBox', 'Segmentation']"
                v-model='projectInfo.type'
                label='프로젝트 타입'
                :rules='[Boolean]')
    v-card-actions
      v-spacer
      v-btn(text @click="$emit('close')") 닫기
      v-btn(
        text
        color='blue darken-1'
        :loading='loading'
        :disabled='!valid'
        @click="create") 생성
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { showFolderDialog } from '@/utils/file'
import { ProjectInfo } from '@/models/user/project'
import { DBProjectType } from '@/models/db'

@Component
export default class AddProjectDialog extends Vue {
  @Prop() active!: boolean

  valid = false
  loading = false

  projectInfo: ProjectInfo = {
    id: '',
    name: 'two',
    type: 'BBox',
    path: 'C:\\Users\\yongj\\Desktop\\imgs2',
    createdAt: '',
    lastSelectedIndex: 0
  }

  @Action createProject!: Function

  async selectFolder() {
    this.projectInfo.path = await showFolderDialog()
  }

  async create() {
    this.loading = true

    const project: DBProjectType = await this.createProject(this.projectInfo)

    this.$router.push(`/${project.info.type.toLowerCase()}/${project.info.id}`)

    this.loading = false
  }
}
</script>

<style scoped></style>
