<template lang="pug">
div.d-flex.view.fill-height
  v-navigation-drawer.main-nav(permanent fixed)
    v-list(dense nav)
      v-list-item-group(v-model='selectedMenuIndex')
        v-list-item(v-for='menu in menus' :key='menu.title' link)
          v-list-item-icon
            v-icon {{ menu.icon }}
          v-list-item-content
            v-list-item-title {{ menu.title }}

  components(:is='selectedComponent')
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import RecentlyViewed from '@/views/main/RecentlyViewed.vue'
import Search from '@/views/main/Search.vue'

@Component({ components: { RecentlyViewed, Search } })
export default class MainView extends Vue {
  selectedMenuIndex = 0

  get selectedComponent() {
    return this.menus[this.selectedMenuIndex].component
  }

  menus = [
    {
      icon: 'fas fa-clock',
      title: 'Recent',
      component: 'RecentlyViewed'
    },
    {
      icon: 'fas fa-search',
      title: 'Search',
      component: 'Search'
    }
  ]
}
</script>

<style scoped>
.view {
  position: relative;
  padding-left: 256px;
  padding-top: 56px;
  max-height: calc(100vh - 56px);
}

.main-nav {
  margin-top: 56px;
}
</style>
