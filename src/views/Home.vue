<template lang="pug">
div.h100.rel
  v-app-bar(app dense color='white')

    v-btn(text @click='openFile')
      v-icon fas fa-file

    v-btn(text @click='showBBox')
      v-icon fas fa-mask
    v-btn(text @click='useBBoxDrawTool')
      v-icon fas fa-vector-square
    v-btn(text @click='useBBoxEditTool')
      v-icon fas fa-edit
    v-btn(text @click='hideAnnotation')
      v-icon fas fa-eye-slash
    v-btn(text @click='test')
      v-icon fas fa-person

    v-spacer

    v-btn(text @click='showSegmentation')
      v-icon fas fa-mask
    v-btn(text @click='useSegmentationDrawTool')
      v-icon fas fa-pen-nib
    v-btn(text @click='useSegmentationEditTool')
      v-icon fas fa-edit
    v-btn(text @click='hideAnnotation')
      v-icon fas fa-eye-slash

    v-spacer

    v-btn(text @click='removeTool')
      v-icon fas fa-trash-alt
    v-btn(text @click='resetZoom')
      v-icon fas fa-search-plus

  v-container.pa-0(fluid)
    v-row
      v-col.canvas-view(cols='9')
        canvas#canvas(@wheel='onWheel' resize='true')
      v-col.pa-0(cols='3')
        annotation-list(:annotations='annotationList' @select="onAnnotationSelect")
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
import coco from '@/assets/coco1.json'
import { Annotation } from '@/models/user/annotation'
import { ipcRenderer, remote } from 'electron'
import { readdir, readFile } from 'mz/fs'

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
  userSegmentation: paper.CompoundPath[] = []
  userActions: UserAction[] = []
  redoActions: UserAction[] = []
  onWheel = zoomOnWheel
  selectedAnnotation: Annotation | null = null

  images: string[] = []

  get annotationList() {
    return this.annotations.filter(b => b.item.isInserted())
  }

  async openFile() {
    const { filePaths, canceled } = await remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    const [dirPath] = filePaths

    if (!dirPath || canceled) return

    const fileNames = await readdir(dirPath)

    console.log('dirPath', dirPath.replace(/\\/g, '/'))

    console.log('fileNames', fileNames)

    const imagePaths = fileNames
      .filter(name => name.match(/\.jpe?g/))
      .map(name => `${dirPath}/${name}`.replace(/\\/g, '/'))
      .slice(0, 5)

    console.log('imagePaths', imagePaths)

    const toBase64 = (f: Buffer) =>
      `data:image/png;base64,${f.toString('base64')}`

    console.log('load image start')

    console.time('load image')

    console.log(imagePaths[0])

    console.log(await readFile(imagePaths[0].slice(0, 10)))

    const images = await Promise.all(
      imagePaths.slice(0, 1).map(path => readFile(path).then(toBase64))
    )

    console.timeEnd('load image')

    console.log('load image end')

    this.images = images
  }

  test() {
    console.log('test')

    ipcRenderer.send('test', 'hello')
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

    ipcRenderer.on('test', (event, v) => {
      console.log('from test', v)
    })

    ipcRenderer.on('detect', (event, predictions) => {
      console.log('predictions', predictions)

      const bboxes = createBBoxes(predictions)
      this.annotations.push(...bboxes)
    })

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

.canvas-view {
  background: grey;
  height: calc(100vh - 48px);
  padding: 0;
}
</style>
