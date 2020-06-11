<template lang="pug">
div.h100.rel.view
  v-navigation-drawer(absolute mini-variant permanent)
    .toolbar-icon-container
      v-btn.toolbar-icon(text @click='openFile')
        v-icon fas fa-file
      v-btn.toolbar-icon(text @click='showBBox')
        v-icon fas fa-mask
        div detect
      v-btn.toolbar-icon(text @click='useBBoxDrawTool')
        v-icon fas fa-vector-square
        div draw
      v-btn.toolbar-icon(text @click='useBBoxEditTool')
        v-icon fas fa-edit
        div edit
      v-btn.toolbar-icon(text @click='hideAnnotation')
        v-icon fas fa-eye-slash
        div hide

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
        canvas#canvas.expand(@wheel='onWheel' resize='true')
      v-col.pa-0.h100(cols='3')
        annotation-list.annotaion-list.h100(:annotations='annotationList' @select="onAnnotationSelect")

  label-modal(v-if='showLabelModal' :annotation='selectedAnnotation' @ok="onLabelEdit")

  image-preview-bottom-bar(:datasets='datasets' @dataset-select='selectDataset')
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Vue } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import { UserAction } from '@/models/user/actions'
import { zoomOnWheel, resetZoom, toDataUrl } from '@/utils'
import { createBBoxes, createRaster } from '@/utils/show'
import { createBBoxDrawTool } from '@/utils/draw'
import { createBBoxEditTool } from '@/utils/edit'
import AnnotationList from '@/components/AnnotationList.vue'
import LabelModal from '@/components/LabelModal.vue'
import ImagePreviewBottomBar from '@/components/ImagePreviewBottomBar.vue'
import { Annotation, Dataset } from '@/models/user/annotation'
import { remote } from 'electron'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { readdir } from 'mz/fs'
import path from 'path'
import { BBoxExport } from '../models/export'

@Component({
  name: 'Home',
  components: { AnnotationList, LabelModal, ImagePreviewBottomBar }
})
export default class Home extends Vue {
  datasets: Dataset[] = []
  selectedDataset: Dataset | null = null
  selectedAnnotation: Annotation | null = null

  tool: paper.Tool | null = null
  onWheel = zoomOnWheel
  serverUrl = 'http://localhost:8000/file?filename='

  @Mutation undo!: Function
  @Mutation redo!: Function
  @Mutation addUserAction!: Function

  get annotationList() {
    return this.selectedDataset
      ? this.selectedDataset.annotations.filter(b => b.item.isInserted())
      : []
  }

  get showLabelModal() {
    return this.selectedAnnotation && this.selectedAnnotation.item.isInserted()
  }

  async openFile() {
    const { filePaths, canceled } = await remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    const [dirPath] = filePaths

    if (!dirPath || canceled) return

    const fileNames = await readdir(dirPath)

    const images = fileNames
      .filter(name => name.match(/\.jpe?g/))
      .map(name => encodeURIComponent(`${dirPath}${path.sep}${name}`))
      .slice(0, 5)

    this.datasets = images.map(path => ({
      path,
      annotations: [],
      labeled: false
    }))

    this.selectDataset(0)
  }

  async showBBox() {
    if (!this.selectedDataset?.raster) return

    const image = this.selectedDataset.raster.image
    const dataUrl = toDataUrl(image)

    ipc.send('detect', dataUrl)
  }

  hideAnnotation() {
    if (!this.selectedDataset) return

    this.selectedDataset.annotations.forEach(i => i.item.remove())
    this.selectedDataset.annotations = []

    this.selectedAnnotation = null

    this.removeTool()
  }

  useBBoxDrawTool() {
    this.removeTool()
    this.tool = createBBoxDrawTool((userAction: UserAction) => {
      this.addUserAction(userAction)

      const bbox = userAction.item as paper.Path.Rectangle
      const userBBox = { item: bbox, label: 'untitled' }
      this.addAnnotations([userBBox])
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
    if (this.tool) this.tool.remove()

    this.tool = null
  }

  resetZoom() {
    if (!this.selectedDataset?.raster) return

    const { width, height } = this.selectedDataset.raster
    resetZoom(new Paper.Point(width / 2, height / 2))
  }

  hideCurrentDataset() {
    if (!this.selectedDataset) return

    if (this.selectedDataset.raster) this.selectedDataset.raster.remove()

    this.selectedDataset.annotations.forEach(a => a.item.remove())
  }

  showDataset() {
    if (!this.selectedDataset?.raster) return

    const raster = this.selectedDataset.raster
    Paper.project.activeLayer.addChild(raster)

    const annotations = this.selectedDataset.annotations.map(a => a.item)
    Paper.project.activeLayer.addChildren(annotations)
    this.resetZoom()
  }

  async selectDataset(index: number) {
    this.hideCurrentDataset()

    this.selectedDataset = this.datasets[index]

    if (this.selectedDataset.raster) {
      this.showDataset()
    } else {
      const imageUrl = `${this.serverUrl}${this.selectedDataset.path}`
      const raster = await createRaster(imageUrl)
      this.selectedDataset.raster = raster
    }
  }

  exportAnnotation() {
    const exportData: BBoxExport[] = this.datasets.map(dataset => {
      return {
        image: {
          width: dataset.raster?.width,
          height: dataset.raster?.height,
          path: dataset.path
        },
        annotations: [],
        labeled: !!dataset.annotations.length
      }
    })

    console.log(exportData)
  }

  addAnnotations(annotations: Annotation[]) {
    if (!this.selectedDataset) return

    this.selectedDataset.annotations.push(...annotations)
  }

  async mounted() {
    const canvas: HTMLCanvasElement | null = document.querySelector(
      'canvas#canvas'
    )

    if (!canvas) return

    Paper.setup(canvas)

    Paper.settings.handleSize = 8

    window.addEventListener('keydown', e => this.keyHandler(e))

    const folderPath = 'C:\\Users\\yongj\\Desktop\\imgs'
    const images = [
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
    ].map(name => encodeURI(`${folderPath}${path.sep}${name}`))

    this.datasets = images.map(path => ({
      path,
      annotations: [],
      labeled: false
    }))

    this.selectDataset(0)

    ipc.on('detect', (event, predictions) => {
      const bboxes = createBBoxes(predictions)
      this.addAnnotations(bboxes)
    })

    this.useBBoxDrawTool()
  }

  keyHandler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.shiftKey ? this.redo() : this.undo()
    }
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
.expand {
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
