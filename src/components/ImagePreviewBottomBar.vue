<template lang="pug">
horizontal-scroller.img-container
    v-img.mr-1.ml-1(
      v-for='dataset, i in datasets' :key='i'
      :src='`${serverUrl}${dataset.path}`'
      height='100'
      width='100'
      @click='selectDataset(i)'
      )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Dataset } from '@/models/user/annotation'
import HorizontalScroller from '@/components/HorizontalScroller.vue'

@Component({ name: 'LabelModal', components: { HorizontalScroller } })
export default class LabelModal extends Vue {
  @Prop() private datasets!: Dataset[]

  private serverUrl = 'http://localhost:8000/file?filename='

  selectDataset(index: number) {
    this.$emit('dataset-select', index)
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
</style>
