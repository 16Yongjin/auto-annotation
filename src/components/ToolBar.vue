<template lang="pug">
v-navigation-drawer(app mini-variant permanent)
  v-list-item.px-2
    v-list-item-avatar
      v-img(src='https://randomuser.me/api/portraits/men/85.jpg')
    v-list-item-title John Leider
    v-btn(icon)
      v-icon mdi-chevron-left
  v-divider
  v-list(dense)
    v-list-item
      v-list-item-icon
        v-icon fas fa-pen
      v-list-item-content
        v-list-item-title d
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component({ name: 'LabelModal' })
export default class LabelModal extends Vue {}
</script>

<style scoped></style>
