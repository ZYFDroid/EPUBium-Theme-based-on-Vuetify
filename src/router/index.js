import Vue from 'vue'
import VueRouter from 'vue-router'
import CoverView from '../views/CoverView.vue'
import ReadView from '../views/ReadView.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'CoverView',
    component: CoverView,
  },
  {
    path: '/read/:uuid',
    name: 'ReadView',
    component: ReadView,
    props: true,
  },
]

const router = new VueRouter({
  routes
})

export default router
