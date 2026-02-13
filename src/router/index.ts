import { createRouter, createWebHistory } from 'vue-router'
import Viewer from '../views/Viewer.vue'
import Editor from '../views/Editor.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Viewer
    },
    {
      path: '/editor',
      component: Editor
    }
  ]
})

export default router
