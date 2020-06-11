<template lang="pug">
div.h100.rel.view
  v-navigation-drawer(absolute mini-variant permanent)
    .toolbar-icon-container
      v-btn.toolbar-icon(text @click='showSegmentation')
        v-icon fas fa-mask
      v-btn.toolbar-icon(text @click='useSegmentationDrawTool')
        v-icon fas fa-pen-nib
      v-btn.toolbar-icon(text @click='useSegmentationEditTool')
        v-icon fas fa-edit
      v-btn.toolbar-icon(text @click='hideAnnotation')
        v-icon fas fa-eye-slash

      v-divider
      v-btn.toolbar-icon(text @click='removeTool')
        v-icon fas fa-trash-alt
      v-btn.toolbar-icon(text @click='resetZoom')
        v-icon fas fa-expand
      v-btn.toolbar-icon(text @click='exportAnnotation')
        v-icon fas fa-file-export
        div export

  v-container.canvas-container.pa-0(fluid)
    v-row.ma-0.h100
      v-col.canvas-view.h100(cols='9')
        canvas#canvas(@wheel='onWheel' resize='true')
      v-col.pa-0.h100(cols='3')
        annotation-list.annotaion-list.h100(:annotations='annotationList' @select="onAnnotationSelect")

  label-modal(:annotation='selectedAnnotation' @ok="onLabelEdit")

  image-preview-bottom-bar(:images='images' @image-select='imageSelect')
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Vue } from 'vue-property-decorator'
import { Coco } from '@/models/datasets'
import { UserAction } from '@/models/user/actions'
import { zoomOnWheel, resetZoom } from '@/utils'
import { createSegmentations, createRaster } from '@/utils/show'
import { createSegmentationDrawTool } from '@/utils/draw'
import { createSegmentationEditTool } from '@/utils/edit'
import AnnotationList from '@/components/AnnotationList.vue'
import LabelModal from '@/components/LabelModal.vue'
import ImagePreviewBottomBar from '@/components/ImagePreviewBottomBar.vue'
import coco from '@/assets/coco1.json'
import { Annotation } from '@/models/user/annotation'
import path from 'path'

@Component({
  name: 'Home',
  components: { AnnotationList, LabelModal, ImagePreviewBottomBar }
})
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null
  image: paper.Raster | null = null
  tool: paper.Tool | null = null
  annotations: Annotation[] = []
  selectedAnnotation: Annotation | null = null

  userActions: UserAction[] = []
  redoActions: UserAction[] = []
  onWheel = zoomOnWheel

  images: string[] = []

  get annotationList() {
    return this.annotations.filter(b => b.item.isInserted())
  }

  showSegmentation() {
    const segmentations = createSegmentations(this.coco.annotations)
    this.annotations.push(...segmentations)
  }

  hideAnnotation() {
    this.annotations.forEach(i => i.item.remove())
    this.annotations = []

    this.selectedAnnotation = null

    this.removeTool()
  }

  useSegmentationDrawTool() {
    this.removeTool()
    this.tool = createSegmentationDrawTool((userAction: UserAction) => {
      this.addUserAction(userAction)

      const segmentation = userAction.item as paper.CompoundPath
      const userSegmentation = { item: segmentation, label: 'untitled' }
      this.annotations.push(userSegmentation)
      this.selectedAnnotation = userSegmentation
    })
  }

  useSegmentationEditTool() {
    this.removeTool()
    this.tool = createSegmentationEditTool((userAction: UserAction) => {
      this.addUserAction(userAction)
    })
  }

  removeTool() {
    if (this.tool) this.tool.remove()

    this.tool = null
  }

  resetZoom() {
    if (!this.image) return

    const { width, height } = this.image
    resetZoom(new Paper.Point(width / 2, height / 2))
  }

  async imageSelect(image: string) {
    if (this.image) this.image.remove()

    this.image = await createRaster(image)
    this.hideAnnotation()
  }

  exportAnnotation() {
    console.log('export')
  }

  async mounted() {
    this.canvas = document.querySelector('canvas#canvas')

    if (!this.canvas) return

    Paper.setup(this.canvas)

    Paper.settings.handleSize = 8

    window.addEventListener('keydown', e => this.keyHandler(e))

    const serverUrl = 'http://localhost:8000/file?filename='
    const folderPath = 'C:\\Users\\yongj\\Desktop\\imgs'
    this.images = [
      '000000023899.jpg',
      '000000033638.jpg',
      '000000034873.jpg',
      '000000037777.jpg',
      '000000029393.jpg',
      '000000023899.jpg',
      '000000033638.jpg',
      '000000034873.jpg',
      '000000037777.jpg',
      '000000029393.jpg',
      '000000023899.jpg',
      '000000033638.jpg',
      '000000034873.jpg',
      '000000037777.jpg',
      '000000029393.jpg'
    ].map(name => encodeURI(`${serverUrl}${folderPath}${path.sep}${name}`))

    this.image = await createRaster(this.images[0])
  }

  keyHandler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.shiftKey ? this.redo() : this.undo()
    }
  }

  undo() {
    const userAction = this.userActions.pop()

    if (!userAction) return

    userAction.undo()
    this.redoActions.push(userAction)
  }

  redo() {
    const userAction = this.redoActions.pop()

    if (!userAction) return

    userAction.redo()
    this.userActions.push(userAction)
  }

  addUserAction(userAction: UserAction) {
    this.userActions.push(userAction)
    this.redoActions = []
  }

  onLabelEdit() {
    this.selectedAnnotation = null
  }

  onAnnotationSelect(annotation: Annotation) {
    this.selectedAnnotation = null
    this.$nextTick(() => {
      this.selectedAnnotation = annotation
    })
  }
}
</script>

<style>
#canvas {
  width: 100%;
  height: 100%;
}

.h100 {
  height: 100%;
}

.rel {
  position: relative;
}

.view {
  padding: 0 0 0 56px;
}

.canvas-container {
  height: calc(100vh - 130px);
}

.canvas-view {
  background: grey;
  padding: 0;
}

.annotaion-list {
  width: 500px;
  height: 100%;
  overflow-y: auto;
}

.toolbar-icon-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.toolbar-icon {
  min-height: 52px;
  min-width: 56px !important;
  padding: 0 !important;
  margin-bottom: 0.5rem;
}

.toolbar-icon span {
  display: inline;
}

body::-webkit-scrollbar {
  display: none;
}
</style>
