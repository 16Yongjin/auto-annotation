import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import About from '@/views/About.vue'
import Annotator from '@/views/Annotator.vue'
import AdminPanel from '@/views/AdminPanel.vue'
import Datasets from '@/views/Datasets.vue'
import Categories from '@/views/Categories.vue'
import Undo from '@/views/Undo.vue'
import Dataset from '@/views/Dataset.vue'
import Auth from '@/views/Auth.vue'
import User from '@/views/User.vue'
import Tasks from '@/views/Tasks.vue'
import PageNotFound from '@/views/PageNotFound.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    alias: '/',
    path: '/datasets',
    name: 'datasets',
    component: Datasets
  },
  {
    path: '/categories',
    name: 'categories',
    component: Categories
  },
  {
    path: '/undo',
    name: 'undo',
    component: Undo
  },
  {
    path: '/annotate/:identifier',
    name: 'annotate',
    component: Annotator,
    props: true
  },
  {
    path: '/dataset/:identifier',
    name: 'dataset',
    component: Dataset,
    props: true
  },
  {
    path: '/auth',
    name: 'authentication',
    component: Auth,
    props: true
  },
  {
    path: '/user',
    name: 'user',
    component: User
  },
  {
    path: '/admin/panel',
    name: 'admin',
    component: AdminPanel
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: Tasks
  },
  { path: '*', component: PageNotFound }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
