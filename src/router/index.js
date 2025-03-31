import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/edit',
    component: () => import(/* webpackChunkName: "edit" */ '../views/Edit.vue')
  },
  {
    path: '/screen',
    component: () => import(/* webpackChunkName: "screen" */ '../views/Screen.vue')
  },
  {
    path: '/window',
    component: () => import(/* webpackChunkName: "window" */ '../views/Window.vue')
  },
  {
    path: '/ad',
    component: () => import(/* webpackChunkName: "ad" */ '../views/Ad.vue')
  },
  {
    // 默认重定向到编辑页面
    path: '/', 
    redirect: '/edit'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'development' ? '' : '/display',
  routes
})

export default router 