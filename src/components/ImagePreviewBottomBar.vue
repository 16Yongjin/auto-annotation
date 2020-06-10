<template lang="pug">
horizontal-scroller.img-container
    v-img.mr-1.ml-1(
      v-for='image, i in images' :key='i'
      :src='image'
      height='100'
      width='100'
      @click='selectImage(image)'
      )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import HorizontalScroller from '@/components/HorizontalScroller.vue'

@Component({ name: 'LabelModal', components: { HorizontalScroller } })
export default class LabelModal extends Vue {
  @Prop() private images!: string[]

  selectImage(image: string) {
    this.$emit('image-select', image)
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
