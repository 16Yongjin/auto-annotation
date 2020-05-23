<script>
import toastrs from '@/mixins/toastrs'
import button from '@/mixins/toolBar/button'
import axios from 'axios'

export default {
  name: 'AnnotateButton',
  mixins: [button, toastrs],
  props: {
    annotateUrl: {
      required: true,
      type: [String, Number]
    }
  },
  data() {
    return {
      icon: 'fa-cloud-download',
      cursor: 'copy',
      iconColor: 'white',
      disabled: true,
      loading: false
    }
  },
  methods: {
    execute() {
      if (!this.validUrl) return

      const canvas = this.$parent.image.raster.canvas

      const data = new FormData()
      canvas.toBlob(blob => {
        data.append('image', blob)
        this.loading = true

        axios
          .post(this.annotateUrl, data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(response => {
            const coco = response.data.coco || {}

            const images = coco.images || []
            const categories = coco.categories || []
            const annotations = coco.annotations || []

            if (
              images.length === 0 ||
              categories.length === 0 ||
              annotations.length === 0
            ) {
              // Error
              return
            }
            // Index categoires
            const indexedCategories = {}
            categories.forEach(category => {
              indexedCategories[category.id] = category
            })

            annotations.forEach(annotation => {
              const keypoints = annotation.keypoints || []
              const segmentation = annotation.segmentation || []
              const category = indexedCategories[annotation.categoryId]

              this.$parent.addAnnotation(category.name, segmentation, keypoints)
            })
          })
          .catch(() => {
            this.axiosReqestError('Annotator', 'Could not read data from URL')
          })
          .finally(() => (this.loading = false))
      })
    }
  },
  computed: {
    name() {
      if (!this.validUrl) return 'Annotate url is invalid'
      return 'Annotate Image'
    },
    validUrl() {
      if (typeof this.annotateUrl === 'number') return false
      return this.annotateUrl.length > 2
    }
  },
  watch: {
    loading() {
      this.icon = this.loading ? 'fa-spinner fa-spin' : 'fa-cloud-download'
    },
    validUrl() {
      this.disabled = !this.validUrl
    },
    disabled() {
      this.iconColor = this.disabled ? this.color.disabled : this.color.enabled
    }
  },
  created() {
    this.iconColor = this.color.disabled
    this.disabled = !this.validUrl
  }
}
</script>
