<script>
import paper from 'paper'
import tool from '@/mixins/toolBar/tool'
import axios from 'axios'

export default {
  name: 'DEXTRTool',
  mixins: [tool],
  props: {
    scale: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      icon: 'fa-crosshairs',
      name: 'DEXTR',
      cursor: 'crosshair',
      settings: {
        padding: 50,
        threshold: 80
      },
      points: []
    }
  },
  methods: {
    createPoint(point) {
      const paperPoint = new paper.Path.Circle(point, 5)
      paperPoint.fillColor = this.$parent.currentAnnotation.color
      paperPoint.data.point = point
      this.points.push(paperPoint)
    },
    onMouseDown(event) {
      this.createPoint(event.point)
    }
  },
  computed: {
    isDisabled() {
      return this.$parent.current.annotation === -1
    }
  },
  watch: {
    points(newPoints) {
      if (newPoints.length === 4) {
        const points = this.points
        this.points = []

        const currentAnnotation = this.$parent.currentAnnotation
        const pointsList = []
        const width = this.$parent.image.raster.width / 2
        const height = this.$parent.image.raster.height / 2

        points.forEach(point => {
          const pt = point.position

          pointsList.push([Math.round(width + pt.x), Math.round(height + pt.y)])
        })

        axios
          .post(`/api/model/dextr/${this.$parent.image.id}`, {
            points: pointsList,
            ...this.settings
          })
          .then(response => {
            const segments = response.data.segmentaiton
            const center = new paper.Point(width, height)

            const compoundPath = new paper.CompoundPath()
            for (let i = 0; i < segments.length; i++) {
              const polygon = segments[i]
              const path = new paper.Path()

              for (let j = 0; j < polygon.length; j += 2) {
                const point = new paper.Point(polygon[j], polygon[j + 1])
                path.add(point.subtract(center))
              }
              path.closePath()
              compoundPath.addChild(path)
            }

            currentAnnotation.unite(compoundPath)
          })
          .finally(() => points.forEach(point => point.remove()))
      }
    }
  }
}
</script>
