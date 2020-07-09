import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Main from '@/views/main/Main.vue'
import BBox from '@/views/annotator/BBox.vue'
import Segmentator from '@/views/annotator/Segmentator.vue'
import PageNotFound from '@/views/common/PageNotFound.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'main',
    component: Main
  },
  {
    path: '/bbox/:id',
    name: 'bbox',
    component: BBox
  },
  {
    path: '/segmentation/:id',
    name: 'segmentation',
    component: Segmentator
  },
  { path: '*', component: PageNotFound }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
