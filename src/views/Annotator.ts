import Paper from 'paper'
import { Component, Vue } from 'vue-property-decorator'
import { Mutation, Action, Getter } from 'vuex-class'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { debounce } from 'lodash'
import { Annotation, Dataset } from '@/models/user/annotation'
import { Project } from '@/models/user/project'
import { db, saveDataset } from '@/electron/db'
import { RemoveAction, MultipleRemoveAction } from '@/models/user/actions'
import { resetZoom, createMoveTool, createRaster } from '@/utils'
import LabelModal from '@/components/annotator/LabelModal.vue'
import Toolbar from '@/components/annotator/segmentation/Toolbar.vue'
import ImagePreviewBottomBar from '@/components/annotator/ImagePreviewBottomBar.vue'
import AnnotationViewer from '@/components/annotator/AnnotationViewer.vue'

enum Tool {
  Draw,
  Edit,
  Move
}

@Component({
  name: 'Annotator',
  components: {
    LabelModal,
    ImagePreviewBottomBar,
    Toolbar,
    AnnotationViewer
  }
})
export default class Annotator extends Vue {
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

  get showLabelModal() {
    return this.selectedAnnotation && this.selectedAnnotation.item.isInserted()
  }

  get focusLabelModal() {
    return this.selectedTool !== Tool.Edit
  }

  async loadDatasets() {
    const projectId = this.$route.params.id

    this.project = (await this.getProjectById(projectId)) as Project

    this.selectDataset(this.datasetIndex)
  }

  showDataset() {
    if (!this.selectedDataset || !this.selectedDataset.raster) return

    this.resetZoom()

    const raster = this.selectedDataset.raster
    Paper.project.activeLayer.addChild(raster)

    this.selectedDataset.annotations.forEach(bbox => {
      if (!bbox.item.onMouseDown) this.attachAnnotationInteraction(bbox)
    })
    const annotations = this.selectedDataset.annotations.map(a => a.item)
    Paper.project.activeLayer.addChildren(annotations)
  }

  attachAnnotationInteraction(annotation: Annotation): void {
    console.log(annotation)
  }

  async selectDataset(index: number) {
    await this.hideCurrentDataset()
    this.resetUserActions()

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

  async hideCurrentDataset() {
    if (!this.selectedDataset) return

    Paper.project.activeLayer.removeChildren()

    this.selectedDataset.annotations = this.selectedDataset.annotations.filter(
      ({ item }) => !item.data.destroy
    )

    this.onAnnotationSelect(null)

    await this.saveDataset()
  }

  setup() {
    ipc.on('dummy', () => null) // to fix ipc library bug
    window.addEventListener('keydown', e => this.keyHandler(e))
    this.loadDatasets()
  }

  keyHandler({ ctrlKey, shiftKey, key }: KeyboardEvent) {
    if (this.$route.name !== 'segmentation') return

    if (key === 'Delete') this.removeSelectedAnnotation()
    else if (key === 'Escape') this.resetSelectedAnnotation()
    else if (ctrlKey && key.toLowerCase() === 'z') {
      shiftKey ? this.redo() : this.undo()
    }

    if (this.selectedAnnotation) return

    if (key === 'ArrowLeft') this.prevDataset()
    else if (key === 'ArrowRight') this.nextDataset()
    else if (key === 'm') this.useMoveTool()
    else if (key === 'c') this.clearAnnotation()
    else if (ctrlKey && key === 's') this.saveDataset()
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

  useMoveTool() {
    this.removeTool()
    this.tool = createMoveTool()
    this.selectedTool = Tool.Move
  }

  resetZoom() {
    if (!this.selectedDataset?.raster) return

    const { size } = this.selectedDataset.raster
    resetZoom(size)
  }

  clearAnnotation() {
    if (!this.selectedDataset) return

    const items = this.selectedDataset.annotations.map(a => a.item)

    items.forEach(item => {
      item.remove()
      item.data.destroy = true
    })
    this.addUserAction(new MultipleRemoveAction(items))

    this.onAnnotationSelect(null)
  }

  removeTool() {
    if (this.tool) this.tool.remove()

    this.tool = null
  }

  saveDatasetIndex() {
    db.write()
  }

  saveDataset() {
    if (!this.selectedDataset || this.noUserAction) return

    const id = this.$route.params.id

    return saveDataset(id, this.selectedDataset)
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
    this.onAnnotationSelect(null)
  }

  resetSelectedAnnotation() {
    Paper.project.activeLayer.selected = false

    if (!this.selectedAnnotation) return

    this.selectedAnnotation.item.fillColor = new Paper.Color(
      'rgba(255,255,255,0.01)'
    )
    this.selectedAnnotation = null
  }

  async onAnnotationSelect(annotation: Annotation | null) {
    if (this.selectedAnnotation === annotation) return

    this.resetSelectedAnnotation()

    if (!annotation) return

    await this.$nextTick()

    annotation.item.selected = true
    annotation.item.fillColor = new Paper.Color('rgba(0,255,0,0.2)')
    this.selectedAnnotation = annotation
  }
}