<template lang="pug">
div.h100.rel.view
  v-navigation-drawer(absolute mini-variant permanent)
    .toolbar-icon-container
      v-btn.toolbar-icon(text @click='openFile')
        v-icon fas fa-file
      v-btn.toolbar-icon(text @click='showBBox')
        v-icon fas fa-mask
        div detect
      v-btn-toggle.flex-column(borderless v-model='selectedTool')
        v-btn.toolbar-icon(text @click='useBBoxDrawTool')
          v-icon fas fa-vector-square
          div draw
        v-btn.toolbar-icon(text @click='useBBoxEditTool')
          v-icon fas fa-edit
          div edit
        v-btn.toolbar-icon(text @click='useMoveTool')
          v-icon fas fa-hand-paper
          div move
      v-btn.toolbar-icon(text @click='hideAnnotation')
        v-icon fas fa-eye-slash
        div hide

      v-divider
      v-btn.toolbar-icon(text @click='resetZoom')
        v-icon fas fa-expand
      v-btn.toolbar-icon(text @click='exportAnnotation')
        v-icon fas fa-file-export
        div export

  v-container.canvas-container.pa-0(fluid)
    v-row.ma-0.h100
      v-col.canvas-view.h100(cols='9')
        canvas#canvas.expand(@wheel='onWheel' resize='true' :style='{ cursor }')
      v-col.pa-0.h100(cols='3')
        annotation-list.annotaion-list.h100(:annotations='annotationList' @select='onAnnotationSelect')

  label-modal(v-if='showLabelModal' :annotation='selectedAnnotation' @clear='onRemoveAnnotation' @ok='onLabelEdit')

  image-preview-bottom-bar(:datasets='datasets' @dataset-select='selectDataset' :dataset-index='datasetIndex')
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Vue } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import { Annotation, Dataset } from '@/models/user/annotation'
import { UserAction, RemoveAction } from '@/models/user/actions'
import { zoomOnWheel, resetZoom, toDataUrl, createMoveTool } from '@/utils'
import { createBBoxes, createRaster } from '@/utils/show'
import { createBBoxDrawTool } from '@/utils/draw'
import { createBBoxEditTool } from '@/utils/edit'
import { loadDatasets } from '@/utils/file'
import { processExportAnnotation } from '@/utils/export'
import AnnotationList from '@/components/AnnotationList.vue'
import LabelModal from '@/components/LabelModal.vue'
import ImagePreviewBottomBar from '@/components/ImagePreviewBottomBar.vue'
import { ipcRenderer as ipc } from 'electron-better-ipc'

import path from 'path'

@Component({
  name: 'Home',
  components: { AnnotationList, LabelModal, ImagePreviewBottomBar }
})
export default class Home extends Vue {
  datasets: Dataset[] = []
  datasetIndex = -1
  selectedAnnotation: Annotation | null = null
  tool: paper.Tool | null = null
  selectedTool = 0
  onWheel = zoomOnWheel
  serverUrl = 'http://localhost:8000/file?filename='

  @Mutation undo!: Function
  @Mutation redo!: Function
  @Mutation addUserAction!: Function
  @Mutation resetUserActions!: Function
  @Mutation openProject!: Function

  get selectedDataset(): Dataset | undefined {
    return this.datasets[this.datasetIndex]
  }

  get annotationList() {
    return this.selectedDataset
      ? this.selectedDataset.annotations.filter(b => b.item.isInserted())
      : []
  }

  get showLabelModal() {
    return this.selectedAnnotation && this.selectedAnnotation.item.isInserted()
  }

  get drawToolSelected() {
    return this.selectedTool === 0
  }

  get cursor() {
    switch (this.selectedTool) {
      case 0:
        return 'crosshair'
      case 1:
        return 'all-scroll'
      case 2:
        return 'grab'
      default:
        return 'default'
    }
  }

  onAnnotationSelect(annotation: Annotation) {
    this.selectedAnnotation = null
    this.$nextTick(() => (this.selectedAnnotation = annotation))
  }

  async openFile() {
    this.datasets = await loadDatasets()

    Paper.project.activeLayer.removeChildren()
    this.datasetIndex = -1
    this.selectDataset(0)
  }

  async showBBox() {
    if (!this.selectedDataset?.raster) return

    const image = this.selectedDataset.raster.image
    const dataUrl = toDataUrl(image)

    ipc.send('detect', dataUrl)
  }

  useBBoxDrawTool() {
    this.removeTool()
    this.tool = createBBoxDrawTool((userAction: UserAction) => {
      this.addUserAction(userAction)

      const bbox = userAction.item as paper.Path.Rectangle
      const userBBox = { item: bbox, label: 'untitled' }
      bbox.onMouseDown = this.onBBoxMouseDown(userBBox)
      bbox.onMouseEnter = this.onBBoxMouseEnter(userBBox)
      bbox.onMouseLeave = this.onBBoxMouseLeave(userBBox)

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

  useMoveTool() {
    this.removeTool()
    this.tool = createMoveTool()
  }

  hideAnnotation() {
    if (!this.selectedDataset) return

    this.selectedDataset.annotations.forEach(i => i.item.remove())
    this.selectedDataset.annotations = []
    this.selectedAnnotation = null
    this.removeTool()
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

    this.selectedDataset.annotations = this.selectedDataset.annotations.filter(
      ({ item }) => !item.data.destroy
    )
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
    if (this.datasetIndex === index) return

    this.hideCurrentDataset()
    this.resetUserActions()

    this.datasetIndex = index

    if (!this.selectedDataset) return

    if (this.selectedDataset.raster) {
      this.showDataset()
    } else {
      const imageUrl = `${this.serverUrl}${this.selectedDataset.path}`
      const raster = await createRaster(imageUrl)
      this.selectedDataset.raster = raster
    }
  }

  async mounted() {
    const canvas: HTMLCanvasElement | null = document.querySelector('canvas')

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
      bboxes.forEach(bbox => {
        bbox.item.onMouseDown = this.onBBoxMouseDown(bbox)
        bbox.item.onMouseEnter = this.onBBoxMouseEnter(bbox)
        bbox.item.onMouseLeave = this.onBBoxMouseLeave(bbox)
      })
      this.addAnnotations(bboxes)
    })

    this.useBBoxDrawTool()

    this.openProject({
      name: 'test',
      datasets: this.datasets
    })
  }

  exportAnnotation() {
    const exportData = processExportAnnotation(this.datasets)

    console.log(exportData)
  }

  onBBoxMouseEnter(bbox: Annotation) {
    return () => {
      if (this.selectedTool !== 1) return
      if (bbox.item.fillColor) bbox.item.fillColor.alpha = 0.2
    }
  }

  onBBoxMouseLeave(bbox: Annotation) {
    return () => {
      if (bbox.item.fillColor) bbox.item.fillColor.alpha = 0.01
    }
  }

  onBBoxMouseDown(bbox: Annotation) {
    return () => {
      if (this.selectedTool !== 1) return
      this.selectedAnnotation = bbox
      bbox.item.selected = true
    }
  }

  keyHandler({ ctrlKey, shiftKey, key }: KeyboardEvent) {
    if (ctrlKey && key.toLowerCase() === 'z') {
      shiftKey ? this.redo() : this.undo()
    } else if (key === 'ArrowLeft') {
      const datasetIndex = Math.max(this.datasetIndex - 1, 0)
      this.selectDataset(datasetIndex)
    } else if (key === 'ArrowRight') {
      const nextIndex = this.datasetIndex + 1
      const lastIndex = this.datasets.length - 1
      const datasetIndex = Math.min(nextIndex, lastIndex)
      this.selectDataset(datasetIndex)
    } else if (key === 'Delete') {
      this.removeSelectedAnnotation()
    }
  }

  addAnnotations(annotations: Annotation[]) {
    if (!this.selectedDataset) return

    this.selectedDataset.annotations.push(...annotations)
  }

  removeSelectedAnnotation() {
    if (!this.selectedAnnotation) return

    this.selectedAnnotation.item.remove()
    this.selectedAnnotation.item.data.destroy = true
    const userAction = new RemoveAction(this.selectedAnnotation.item)
    this.addUserAction(userAction)
    this.selectedAnnotation = null
  }

  onRemoveAnnotation() {
    if (!this.selectedAnnotation) return

    this.selectedAnnotation.item.remove()

    const userAction = new RemoveAction(this.selectedAnnotation.item)

    this.addUserAction(userAction)
  }

  onLabelEdit() {
    this.selectedAnnotation = null
  }
}
</script>

<style scoped>
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
  height: calc(100vh - 130px - 56px);
}

.canvas-view {
  background: #c8c8c8;
  padding: 0;
}

.annotaion-list {
  width: 500px;
  height: 100%;
  overflow-y: auto;
}
</style>
