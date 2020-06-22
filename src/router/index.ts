import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Main from '@/views/Main.vue'
import BBox from '@/views/BBox.vue'
import Segmentation from '@/views/Segmentation.vue'
import PageNotFound from '@/views/PageNotFound.vue'

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
    path: '/segmentation',
    name: 'segmentation',
    component: Segmentation
  },
  { path: '*', component: PageNotFound }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
