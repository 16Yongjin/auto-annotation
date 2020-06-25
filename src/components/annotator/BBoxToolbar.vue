<template lang="pug">
v-navigation-drawer(absolute mini-variant permanent)
    .toolbar-icon-container
      v-btn.toolbar-icon(text @click='onDetectObject' :loading='detectorLoading')
        v-icon fas fa-mask
        div detect

      v-btn-toggle.flex-column(borderless :value='selectedTool')
        v-btn.toolbar-icon(text @click='useBBoxDrawTool')
          v-icon fas fa-vector-square
          div box
        v-btn.toolbar-icon(text @click='useBBoxEditTool')
          v-icon fas fa-edit
          div edit
        v-btn.toolbar-icon(text @click='useMoveTool')
          v-icon fas fa-hand-paper
          div move
      v-btn.toolbar-icon(text @click='clearAnnotation')
        v-icon fas fa-trash
        div Clear

      v-divider
      v-btn.toolbar-icon(text @click='resetZoom')
        v-icon fas fa-expand
      v-btn.toolbar-icon(text @click='exportAnnotation')
        v-icon fas fa-file-export
        div export
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import HorizontalScroller from '@/components/utils/HorizontalScroller.vue'

@Component({ components: { HorizontalScroller } })
export default class BBoxToolbar extends Vue {
  @Prop() private onDetectObject!: Function
  @Prop() private useBBoxDrawTool!: Function
  @Prop() private useBBoxEditTool!: Function
  @Prop() private useMoveTool!: Function
  @Prop() private clearAnnotation!: Function
  @Prop() private resetZoom!: Function
  @Prop() private exportAnnotation!: Function
  @Prop() private selectedTool!: number
  @Prop() private detectorLoading!: boolean
}
</script>

<style scoped></style>
