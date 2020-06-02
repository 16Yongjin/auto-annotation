<template lang="pug">
v-list(dense)
  v-subheader Annotations
  v-list-item-group(color='primary')
    v-list-item(v-for='(annotation, i) in annotations', :key='i')
      v-list-item-content
        v-list-item-title(v-text='annotation.name')
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Segmentation, BBox } from '@/models/user/annotation'

@Component({ name: 'AnnotationList' })
export default class AnnotationList extends Vue {
  @Prop() private annotations!: Segmentation[] | BBox[]
}
</script>

<style scoped></style>
