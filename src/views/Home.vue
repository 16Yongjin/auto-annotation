<template lang="pug">
div.h100.rel
  v-navigation-drawer(app mini-variant permanent)
    .toolbar-icon-container
      v-btn.toolbar-icon(text @click='openFile')
        v-icon fas fa-file
      v-btn.toolbar-icon(text @click='showBBox')
        v-icon fas fa-mask
      v-btn.toolbar-icon(text @click='useBBoxDrawTool')
        v-icon fas fa-vector-square
      v-btn.toolbar-icon(text @click='useBBoxEditTool')
        v-icon fas fa-edit
      v-btn.toolbar-icon(text @click='hideAnnotation')
        v-icon fas fa-eye-slash

      v-divider
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
        v-icon fas fa-search-plus

  v-container.canvas-container.pa-0(fluid)
    v-row.ma-0.h100
      v-col.canvas-view.h100(cols='9')
        canvas#canvas(@wheel='onWheel' resize='true')
      v-col.pa-0.h100(cols='3')
        annotation-list.annotaion-list.h100(:annotations='annotationList' @select="onAnnotationSelect")

  label-modal(:annotation='selectedAnnotation' @ok="onLabelEdit")

  image-preview-bottom-bar(:images='images')
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Vue } from 'vue-property-decorator'
import { Coco } from '@/models/datasets'
import { UserAction } from '@/models/user/actions'
import { zoomOnWheel, resetZoom, toDataUrl } from '@/utils'
import { createBBoxes, createSegmentations, createImage } from '@/utils/show'
import { createBBoxDrawTool, createSegmentationDrawTool } from '@/utils/draw'
import { createSegmentationEditTool, createBBoxEditTool } from '@/utils/edit'
import AnnotationList from '@/components/AnnotationList.vue'
import LabelModal from '@/components/LabelModal.vue'
import ImagePreviewBottomBar from '@/components/ImagePreviewBottomBar.vue'
import ToolBar from '@/components/ToolBar.vue'
import coco from '@/assets/coco1.json'
import { Annotation } from '@/models/user/annotation'
import { ipcRenderer, remote } from 'electron'
import { readdir } from 'mz/fs'

@Component({
  name: 'Home',
  components: { AnnotationList, LabelModal, ImagePreviewBottomBar, ToolBar }
})
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null
  image: paper.Raster | null = null
  tool: paper.Tool | null = null
  annotations: Annotation[] = []
  userSegmentation: paper.CompoundPath[] = []
  userActions: UserAction[] = []
  redoActions: UserAction[] = []
  onWheel = zoomOnWheel
  selectedAnnotation: Annotation | null = null

  images: string[] = []

  toBase64 = (f: Buffer) => `data:image/png;base64,${f.toString('base64')}`

  get annotationList() {
    return this.annotations.filter(b => b.item.isInserted())
  }

  async openFile() {
    const { filePaths, canceled } = await remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    const [dirPath] = filePaths

    if (!dirPath || canceled) return

    ipcRenderer.send('folder', dirPath)

    const fileNames = await readdir(dirPath)

    const imagePaths = fileNames
      .filter(name => name.match(/\.jpe?g/))
      .slice(0, 5)

    this.images = imagePaths
  }

  async showBBox() {
    if (!this.image) return

    const image = this.image.image
    const dataURL = toDataUrl(image)
    ipcRenderer.send('detect', dataURL)
  }

  showSegmentation() {
    const segmentations = createSegmentations(this.coco.annotations)
    this.annotations.push(...segmentations)
  }

  hideAnnotation() {
    this.annotations.forEach(i => i.item.remove())
    this.annotations = []

    this.userSegmentation.forEach(i => i.remove())
    this.userSegmentation = []

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

  useBBoxDrawTool() {
    this.removeTool()
    this.tool = createBBoxDrawTool((userAction: UserAction) => {
      this.addUserAction(userAction)

      const bbox = userAction.item as paper.Path.Rectangle
      const userBBox = { item: bbox, label: 'untitled' }
      this.annotations.push(userBBox)
      this.selectedAnnotation = userBBox
    })
  }

  useBBoxEditTool() {
    this.removeTool()
    this.tool = createBBoxEditTool((userAction: UserAction) => {
      this.addUserAction(userAction)
    })
  }

  removeTool() {
    if (this.tool) {
      this.tool.remove()
    }
    this.tool = null
  }

  resetZoom() {
    const { width, height } = this.coco.image
    resetZoom(new Paper.Point(width / 2, height / 2))
  }

  async mounted() {
    this.canvas = document.querySelector('canvas#canvas')

    if (!this.canvas) return

    Paper.setup(this.canvas)

    Paper.settings.handleSize = 8

    // createImage(this.coco.image)

    this.image = await createImage({
      license: 1,
      // eslint-disable-next-line @typescript-eslint/camelcase
      file_name: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      coco_url: require('@/assets/image.jpg'),
      height: 1,
      width: 1,
      // eslint-disable-next-line @typescript-eslint/camelcase
      date_captured: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      flickr_url: '',
      id: 1
    })

    window.addEventListener('keydown', e => this.keyHandler(e))

    ipcRenderer.on('detect', (event, predictions) => {
      console.log('predictions', predictions)

      const bboxes = createBBoxes(predictions)
      this.annotations.push(...bboxes)
    })

    ipcRenderer.send('folder', 'C:\\Users\\yongj\\Desktop\\imgs')
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
    ]

    this.useBBoxDrawTool()
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

body::-webkit-scrollbar {
  display: none;
}
</style>
