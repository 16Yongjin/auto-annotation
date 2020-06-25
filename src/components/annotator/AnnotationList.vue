<template lang="pug">
v-list.list(dense)
  v-subheader.font-weight-bold Annotations
  v-divider
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
import { Annotation } from '@/models/user/annotation'

@Component({ name: 'AnnotationList' })
export default class AnnotationList extends Vue {
  @Prop() private annotations!: Annotation[]

  onItemSelect(annotation: Annotation[]) {
    this.$emit('select', annotation)
  }

  onItemMouseover(annotaion: Annotation) {
    annotaion.item.onMouseEnter && annotaion.item.onMouseEnter()
  }

  onItemMouseleave(annotaion: Annotation) {
    annotaion.item.onMouseLeave && annotaion.item.onMouseLeave()
  }
}
</script>

<style scoped></style>
