<template lang="pug">
div.h100.rel.view
  bbox-toolbar(
    :onDetectObject='onDetectObject'
    :useDrawTool='useBBoxDrawTool'
    :useEditTool='useBBoxEditTool'
    :useMoveTool='useMoveTool'
    :clearAnnotation='clearAnnotation'
    :resetZoom='resetZoom'
    :exportAnnotation='exportAnnotation'
    :selectedTool='selectedTool'
    :detectorLoading='detectorLoading'
  )

  bbox-viewer(:dataset='selectedDataset' :tool='selectedTool' @select='onAnnotationSelect')

  label-modal(v-if='showLabelModal' :annotation='selectedAnnotation' @clear='removeSelectedAnnotation' @ok='onLabelEdit')

  image-preview-bottom-bar(:datasets='datasets' @dataset-select='selectDataset' :dataset-index='datasetIndex')
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Mutation, Action, Getter } from 'vuex-class'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { debounce } from 'lodash'
import { DetectedObject } from '@tensorflow-models/coco-ssd'
import { Annotation, Dataset } from '@/models/user/annotation'
import { Project } from '@/models/user/project'
import { db, saveDataset } from '@/electron/db'
import {
  UserAction,
  RemoveAction,
  MultipleDrawAction,
  MultipleRemoveAction
} from '@/models/user/actions'
import {
  resetZoom,
  toDataUrl,
  createMoveTool,
  createBBoxFromDetector,
  createRaster,
  createBBoxDrawTool,
  createBBoxEditTool,
  processExportAnnotation
} from '@/utils'
import AnnotationList from '@/components/annotator/AnnotationList.vue'
import LabelModal from '@/components/annotator/LabelModal.vue'
import BboxToolbar from '@/components/annotator/BBoxToolbar.vue'
import ImagePreviewBottomBar from '@/components/annotator/ImagePreviewBottomBar.vue'
import BboxViewer from '@/components/annotator/BBoxViewer.vue'

enum Tool {
  Draw,
  Edit,
  Move
}

@Component({
  name: 'BBox',
  components: {
    AnnotationList,
    LabelModal,
    ImagePreviewBottomBar,
    BboxToolbar,
    BboxViewer
  }
})
export default class BBox extends Vue {
  project: Project | null = null
  tool: paper.Tool | null = null
  selectedAnnotation: Annotation | null = null
  selectedTool = Tool.Draw
  detectorLoading = false

  serverUrl = 'http://localhost:8000/file?filename='

  @Action getProjectById!: Function
  @Action closeProject!: Function
  @Mutation undo!: Function
  @Mutation redo!: Function
  @Mutation addUserAction!: Function
  @Mutation resetUserActions!: Function
  @Getter noUserAction!: boolean

  mounted() {
    this.setup()
    this.useBBoxDrawTool()
  }

  deactivated() {
    this.saveDataset()
  }

  get datasets() {
    return this.project ? this.project.datasets : []
  }

  get datasetIndex() {
    return this.project ? this.project.info.lastSelectedIndex : -1
  }

  set datasetIndex(index: number) {
    this.project && (this.project.info.lastSelectedIndex = index)
  }

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

  closeThisProject() {
    this.closeProject(this.$route.params.id)
  }

  async onDetectObject() {
    if (this.detectorLoading || !this.selectedDataset?.raster) return

    this.detectorLoading = true

    const image = this.selectedDataset.raster.image
    const dataUrl = toDataUrl(image)
    const predictions = await ipc.callMain<string, DetectedObject[]>(
      'detect',
      dataUrl
    )
    const bboxes = createBBoxFromDetector(predictions)
    bboxes.forEach(bbox => this.attachBBoxInteraction(bbox))
    const items = bboxes.map(b => b.item)
    this.addUserAction(new MultipleDrawAction(items))
    this.addAnnotations(bboxes)

    this.detectorLoading = false
  }

  useBBoxDrawTool() {
    this.removeTool()
    this.tool = createBBoxDrawTool((userAction: UserAction) => {
      this.addUserAction(userAction)

      const item = userAction.item as paper.Path.Rectangle
      const bbox = { item, label: 'untitled' }
      this.attachBBoxInteraction(bbox)
      this.addAnnotations([bbox])
      this.selectedAnnotation = bbox
    })
    this.selectedTool = Tool.Draw
  }

  useBBoxEditTool() {
    this.removeTool()
    this.tool = createBBoxEditTool(this.addUserAction.bind(this))
    this.selectedTool = Tool.Edit
  }

  useMoveTool() {
    this.removeTool()
    this.tool = createMoveTool()
    this.selectedTool = Tool.Move
  }

  clearAnnotation() {
    if (!this.selectedDataset) return

    const items = this.selectedDataset.annotations.map(a => a.item)

    items.forEach(item => {
      item.remove()
      item.data.destroy = true
    })
    this.addUserAction(new MultipleRemoveAction(items))

    this.selectedAnnotation = null
  }

  removeTool() {
    if (this.tool) this.tool.remove()

    this.tool = null
  }

  resetZoom() {
    if (!this.selectedDataset?.raster) return

    const { size } = this.selectedDataset.raster
    resetZoom(size)
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

    this.resetZoom()
    const raster = this.selectedDataset.raster
    Paper.project.activeLayer.addChild(raster)

    this.selectedDataset.annotations.forEach(bbox => {
      if (!bbox.item.onMouseDown) this.attachBBoxInteraction(bbox)
    })
    const annotations = this.selectedDataset.annotations.map(a => a.item)
    Paper.project.activeLayer.addChildren(annotations)
  }

  async selectDataset(index: number) {
    this.resetUserActions()
    await this.hideCurrentDataset()

    this.datasetIndex = index

    if (!this.selectedDataset) return

    this.saveDatasetIndex()

    if (!this.selectedDataset.raster) {
      const imageUrl = `${this.serverUrl}${this.selectedDataset.path}`
      const raster = await createRaster(imageUrl)
      this.selectedDataset.raster = raster
    }

    this.showDataset()
  }

  selectDatasetDebounced = debounce(this.selectDataset.bind(this), 25)

  @Watch('$route.params.id')
  onProjectChanged() {
    if (this.$route.name === 'bbox') this.loadDatasets()
  }

  setup() {
    window.addEventListener('keydown', this.keyHandler.bind(this))
    ipc.on('dummy', () => null) // to fix ipc library bug

    this.loadDatasets()
  }

  keyHandler({ ctrlKey, shiftKey, key }: KeyboardEvent) {
    if (this.$route.name !== 'bbox') return

    if (key === 'Delete') this.removeSelectedAnnotation()

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

  async loadDatasets() {
    const projectId = this.$route.params.id

    this.project = (await this.getProjectById(projectId)) as Project

    this.selectDataset(this.datasetIndex)
  }

  saveDatasetIndex() {
    db.write()
  }

  saveDataset() {
    if (!this.selectedDataset || this.noUserAction) return

    const id = this.$route.params.id

    return saveDataset(id, this.selectedDataset)
  }

  exportAnnotation() {
    const exportData = processExportAnnotation(this.datasets)
    console.log(exportData)
  }

  attachBBoxInteraction(bbox: Annotation) {
    bbox.item.onMouseDown = this.onBBoxMouseDown(bbox)
    bbox.item.onMouseEnter = this.onBBoxMouseEnter(bbox)
    bbox.item.onMouseLeave = this.onBBoxMouseLeave(bbox)
  }

  onBBoxMouseEnter(bbox: Annotation) {
    return () => {
      if (this.selectedTool !== Tool.Edit) return
      bbox.item.selected = true
      if (bbox.item.fillColor) bbox.item.fillColor.alpha = 0.2
    }
  }

  onBBoxMouseLeave(bbox: Annotation) {
    return () => {
      bbox.item.selected = false
      if (bbox.item.fillColor) bbox.item.fillColor.alpha = 0.01
    }
  }

  onBBoxMouseDown(bbox: Annotation) {
    return () => {
      if (this.selectedTool !== Tool.Edit) return
      this.selectedAnnotation = bbox
      bbox.item.selected = true
    }
  }

  prevDataset() {
    const datasetIndex = Math.max(this.datasetIndex - 1, 0)
    this.selectDatasetDebounced(datasetIndex)
  }

  nextDataset() {
    const nextIndex = this.datasetIndex + 1
    const lastIndex = this.datasets.length - 1
    const datasetIndex = Math.min(nextIndex, lastIndex)
    this.selectDatasetDebounced(datasetIndex)
  }

  addAnnotations(annotations: Annotation[]) {
    if (!this.selectedDataset) return

    this.selectedDataset.annotations.push(...annotations)
  }

  removeSelectedAnnotation() {
    if (!this.selectedAnnotation) return

    this.selectedAnnotation.item.remove()
    this.selectedAnnotation.item.data.destroy = true
    this.addUserAction(new RemoveAction(this.selectedAnnotation.item))
    this.selectedAnnotation = null
  }

  async onAnnotationSelect(annotation: Annotation) {
    this.selectedAnnotation = null
    await this.$nextTick()
    this.selectedAnnotation = annotation
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
</style>
