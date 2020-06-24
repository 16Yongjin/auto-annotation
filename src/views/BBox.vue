<template lang="pug">
div.h100.rel.view
  bbox-toolbar(
    :onDetectObject='onDetectObject'
    :useBBoxDrawTool='useBBoxDrawTool'
    :useBBoxEditTool='useBBoxEditTool'
    :useMoveTool='useMoveTool'
    :clearAnnotation='clearAnnotation'
    :resetZoom='resetZoom'
    :exportAnnotation='exportAnnotation'
    :selectedTool='selectedTool'
  )

  v-container.canvas-container.pa-0(fluid)
    v-row.ma-0.h100
      v-col.canvas-view.h100(cols='9')
        canvas#canvas.expand(@wheel='onWheel' resize='true' :style='{ cursor }')
      v-col.pa-0.h100(cols='3')
        annotation-list.annotaion-list.h100(:annotations='annotationList' @select='onAnnotationSelect')

  label-modal(v-if='showLabelModal' :annotation='selectedAnnotation' @clear='removeSelectedAnnotation' @ok='onLabelEdit')

  image-preview-bottom-bar(:datasets='datasets' @dataset-select='selectDataset' :dataset-index='datasetIndex')
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Mutation, Action } from 'vuex-class'
import { Annotation, Dataset } from '@/models/user/annotation'
import { UserAction, RemoveAction } from '@/models/user/actions'
import { zoomOnWheel, resetZoom, toDataUrl, createMoveTool } from '@/utils'
import { createBBoxFromDetector, createRaster } from '@/utils/show'
import { createBBoxDrawTool } from '@/utils/draw'
import { createBBoxEditTool } from '@/utils/edit'
import { processExportAnnotation, serializeDataset } from '@/utils/export'
import AnnotationList from '@/components/AnnotationList.vue'
import LabelModal from '@/components/LabelModal.vue'
import BboxToolbar from '@/components/BBoxToolbar.vue'
import ImagePreviewBottomBar from '@/components/ImagePreviewBottomBar.vue'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { DetectedObject } from '@tensorflow-models/coco-ssd'
import { Project } from '@/models/user/project'
import { db } from '@/electron/db'

@Component({
  name: 'BBox',
  components: { AnnotationList, LabelModal, ImagePreviewBottomBar, BboxToolbar }
})
export default class BBox extends Vue {
  @Action getProjectById!: Function

  project: Project | null = null

  get datasets() {
    return this.project ? this.project.datasets : []
  }

  get datasetIndex() {
    return this.project ? this.project.info.lastSelectedIndex : -1
  }

  set datasetIndex(index: number) {
    this.project && (this.project.info.lastSelectedIndex = index)
  }

  tool: paper.Tool | null = null
  selectedTool = 0

  selectedAnnotation: Annotation | null = null
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

  get cursor() {
    const cursors = ['crosshair', 'all-scroll', 'grab']

    return cursors[this.selectedTool] || 'default'
  }

  async onDetectObject() {
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
    this.selectedTool = 0
  }

  useBBoxEditTool() {
    this.removeTool()
    this.tool = createBBoxEditTool((userAction: UserAction) => {
      this.addUserAction(userAction)
    })
    this.selectedTool = 1
  }

  useMoveTool() {
    this.removeTool()
    this.tool = createMoveTool()
    this.selectedTool = 2
  }

  clearAnnotation() {
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

  async onAnnotationSelect(annotation: Annotation) {
    this.selectedAnnotation = null
    await this.$nextTick()
    this.selectedAnnotation = annotation
  }

  async hideCurrentDataset() {
    if (!this.selectedDataset) return

    Paper.project.activeLayer.removeChildren()

    this.selectedDataset.annotations = this.selectedDataset.annotations.filter(
      ({ item }) => !item.data.destroy
    )

    this.selectedAnnotation = null

    await this.saveDataset()
  }

  showDataset() {
    if (!this.selectedDataset || !this.selectedDataset.raster) return

    const raster = this.selectedDataset.raster
    Paper.project.activeLayer.addChild(raster)

    this.selectedDataset.annotations.forEach(bbox => {
      if (!bbox.item.onMouseDown) {
        bbox.item.onMouseDown = this.onBBoxMouseDown(bbox)
        bbox.item.onMouseEnter = this.onBBoxMouseEnter(bbox)
        bbox.item.onMouseLeave = this.onBBoxMouseLeave(bbox)
      }
    })
    const annotations = this.selectedDataset.annotations.map(a => a.item)

    Paper.project.activeLayer.addChildren(annotations)

    this.resetZoom()
  }

  async selectDataset(index: number) {
    await this.hideCurrentDataset()
    this.resetUserActions()

    this.datasetIndex = index

    if (!this.selectedDataset) return

    if (this.selectedDataset.raster) {
      this.showDataset()
    } else {
      const imageUrl = `${this.serverUrl}${this.selectedDataset.path}`
      const raster = await createRaster(imageUrl)
      this.selectedDataset.raster = raster
      this.showDataset()
    }
  }

  @Watch('$route.params.id')
  onProjectChanged() {
    if (this.$route.name === 'bbox') this.loadDatasets()
  }

  setup() {
    const canvas: HTMLCanvasElement | null = document.querySelector('canvas')

    if (!canvas) return

    Paper.setup(canvas)

    Paper.settings.handleSize = 8

    window.addEventListener('keydown', this.keyHandler.bind(this))

    ipc.on('detect', this.onDetect.bind(this))

    this.loadDatasets()
  }

  async loadDatasets() {
    const projectId = this.$route.params.id

    this.project = (await this.getProjectById(projectId)) as Project

    this.selectDataset(this.datasetIndex)
  }

  async saveDataset() {
    if (!this.selectedDataset) return

    console.time('save')

    const projectId = this.$route.params.id
    const path = this.selectedDataset.path
    const lastSelectedIndex = this.datasetIndex

    console.log('lastSelectedIndex', lastSelectedIndex)

    await db
      .get('projects')
      .find({ info: { id: projectId } })
      .set('info.lastSelectedIndex', lastSelectedIndex)
      .get('datasets')
      .find({ path })
      .assign(serializeDataset(this.selectedDataset))
      .write()

    console.timeEnd('save')
  }

  onDetect(event: Electron.IpcRendererEvent, predictions: DetectedObject[]) {
    const bboxes = createBBoxFromDetector(predictions)
    bboxes.forEach(bbox => {
      bbox.item.onMouseDown = this.onBBoxMouseDown(bbox)
      bbox.item.onMouseEnter = this.onBBoxMouseEnter(bbox)
      bbox.item.onMouseLeave = this.onBBoxMouseLeave(bbox)
    })
    this.addAnnotations(bboxes)
  }

  created() {
    console.log('created')
  }

  async mounted() {
    console.log('mounted')
    this.setup()
    this.useBBoxDrawTool()
  }

  activated() {
    console.log('activated')
  }

  deactivated() {
    console.log('deactivated')
    this.saveDataset()
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
    if (this.$route.name !== 'bbox') return

    if (key === 'Delete') {
      this.removeSelectedAnnotation()
    }

    if (this.selectedAnnotation) return

    if (ctrlKey && key.toLowerCase() === 'z') {
      shiftKey ? this.redo() : this.undo()
    } else if (key === 'ArrowLeft') this.prevDataset()
    else if (key === 'ArrowRight') this.nextDataset()
    else if (key === 'd') this.onDetectObject()
    else if (key === 'b') this.useBBoxDrawTool()
    else if (key === 'e') this.useBBoxEditTool()
    else if (key === 'm') this.useMoveTool()
    else if (key === 'c') this.clearAnnotation()
    else if (ctrlKey && key === 's') this.saveDataset()
  }

  prevDataset() {
    const datasetIndex = Math.max(this.datasetIndex - 1, 0)
    this.selectDataset(datasetIndex)
  }

  nextDataset() {
    const nextIndex = this.datasetIndex + 1
    const lastIndex = this.datasets.length - 1
    const datasetIndex = Math.min(nextIndex, lastIndex)
    this.selectDataset(datasetIndex)
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

  onLabelEdit() {
    this.selectedAnnotation = null
  }
}
</script>

<style scoped>
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
