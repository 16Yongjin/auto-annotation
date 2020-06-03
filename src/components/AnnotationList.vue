<template lang="pug">
v-list(dense)
  v-subheader Annotations
  v-list
    v-list-item(
      v-for='(annotation, i) in annotations'
      :key='i'
      @click='onItemSelect(annotation)'
      @mouseover='onItemMouseover(annotation)'
      @mouseleave='onItemMouseleave(annotation)'
      )
      v-list-item-content
        v-list-item-title(v-text='annotation.label')
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Segmentation, BBox } from '@/models/user/annotation'

@Component({ name: 'AnnotationList' })
export default class AnnotationList extends Vue {
  @Prop() private annotations!: Segmentation[] | BBox[]

  onItemSelect(annotation: Segmentation[] | BBox[]) {
    this.$emit('select', annotation)
  }

  onItemMouseover(bbox: BBox) {
    bbox.bbox.selected = true
  }

  onItemMouseleave(bbox: BBox) {
    bbox.bbox.selected = false
  }
}
</script>

<style scoped></style>
