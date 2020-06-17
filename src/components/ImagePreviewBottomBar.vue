<template lang="pug">
horizontal-scroller.img-container(ref='scroller')
    v-img.mr-1.ml-1(
      v-for='dataset, i in datasets' :key='i'
      :src='`${serverUrl}${dataset.path}`'
      height='100'
      width='100'
      :ref='`image-${i}`'
      :class='{ selected: i === datasetIndex }'
      @click='selectDataset(i)'
      )
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Dataset } from '@/models/user/annotation'
import HorizontalScroller from '@/components/HorizontalScroller.vue'

@Component({ name: 'LabelModal', components: { HorizontalScroller } })
export default class LabelModal extends Vue {
  @Prop() private datasets!: Dataset[]
  @Prop() private datasetIndex!: number

  private serverUrl = 'http://localhost:8000/file?filename='

  selectDataset(index: number) {
    this.$emit('dataset-select', index)
  }

  @Watch('datasetIndex')
  onDatasetIndexChanged(v: number) {
    const imageRef = this.$refs[`image-${v}`] as Vue[]
    if (!imageRef || !imageRef[0]) return
    const imageDiv = imageRef[0].$el
    imageDiv.scrollIntoView()
  }
}
</script>

<style scoped>
.img-container {
  display: flex;
  align-items: center;
  height: 128px;
  overflow-x: auto;
  -ms-overflow-style: none;
}

.img-container::-webkit-scrollbar {
  display: none;
}

.selected {
  border: 2px solid red;
}
</style>
