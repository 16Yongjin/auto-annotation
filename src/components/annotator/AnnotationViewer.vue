<template lang="pug">
v-container.canvas-container.pa-0(fluid)
    v-row.ma-0.h100
      v-col.canvas-view.h100(cols='9' :style='{ background: canvasBackground }')
        canvas.expand(:id='canvasId' @wheel='onWheel' resize='true' :style='{ cursor }')
      v-col.pa-0.h100(cols='3')
        annotation-list.annotaion-list.h100(:annotations='annotationList' @select='onAnnotaionSelect')
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Paper from 'paper'
import { Dataset, Annotation } from '@/models/user/annotation'
import { zoomOnWheel } from '@/utils'
import AnnotationList from '@/components/annotator/AnnotationList.vue'

@Component({ name: 'AnnotationViewer', components: { AnnotationList } })
export default class AnnotationViewer extends Vue {
  @Prop() private type!: string
  @Prop() private dataset!: Dataset | null
  @Prop() private tool!: number
  onWheel = zoomOnWheel

  get annotationList() {
    return this.dataset
      ? this.dataset.annotations.filter(b => b.item.isInserted())
      : []
  }

  get cursor() {
    const cursors = ['crosshair', 'all-scroll', 'grab']

    return cursors[this.tool] || 'default'
  }

  get canvasId() {
    return `canvas-${this.type}`
  }

  get canvasBackground() {
    return this.$vuetify.theme.dark ? '#333333' : '#c8c8c8'
  }

  activated() {
    this.setupCanvas()
  }

  mounted() {
    this.setupCanvas()
  }

  setupCanvas() {
    const existingCanvas = Paper.projects.find(
      p => p.view.element.id === this.canvasId
    )

    if (existingCanvas) return existingCanvas.activate()

    const canvas: HTMLCanvasElement | null = document.querySelector(
      `#${this.canvasId}`
    )

    if (!canvas) return

    Paper.setup(canvas)
    Paper.settings.handleSize = 8
  }

  onAnnotaionSelect(annotation: Annotation) {
    this.$emit('select', annotation)
  }
}
</script>

<style scoped>
.canvas-container {
  height: calc(100vh - 130px - 56px);
}

.canvas-view {
  padding: 0;
}

.annotaion-list {
  width: 500px;
  height: 100%;
  overflow-y: auto;
}
</style>
