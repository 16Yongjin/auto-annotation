<template lang="pug">
v-navigation-drawer(absolute mini-variant permanent)
    .toolbar-icon-container
      v-btn.toolbar-icon(text @click='onDetectObject' :loading='detectorLoading')
        v-icon mdi-eye
        div vision

      v-btn-toggle.tool-toggle.flex-column(borderless :value='selectedTool')
        v-btn.toolbar-icon(text @click='useDrawTool')
          v-icon mdi-vector-square
          div draw
        v-btn.toolbar-icon(text @click='useEditTool')
          v-icon mdi-square-edit-outline
          div edit
        v-btn.toolbar-icon(text @click='useMoveTool')
          v-icon mdi-hand-left
          div move
      v-btn.toolbar-icon(text @click='clearAnnotation')
        v-icon mdi-trash-can
        div Clear

      v-divider
      v-btn.toolbar-icon(text @click='resetZoom')
        v-icon mdi-arrow-expand-all
        div zoom
      v-btn.toolbar-icon(text @click='exportAnnotation')
        v-icon mdi-file-download
        div export
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import HorizontalScroller from '@/components/utils/HorizontalScroller.vue'

@Component({ components: { HorizontalScroller } })
export default class BBoxToolbar extends Vue {
  @Prop() private onDetectObject!: Function
  @Prop() private useDrawTool!: Function
  @Prop() private useEditTool!: Function
  @Prop() private useMoveTool!: Function
  @Prop() private clearAnnotation!: Function
  @Prop() private resetZoom!: Function
  @Prop() private exportAnnotation!: Function
  @Prop() private selectedTool!: number
  @Prop() private detectorLoading!: boolean
}
</script>

<style scoped>
.tool-toggle {
  background: unset !important;
}
</style>
