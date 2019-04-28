import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/home/home'
import Label from '@/views/label/label'
import Login from '@/views/label/login/login'
import Register from '@/views/register/register'

import Task from '@/views/label/task/task'
import DataSource from '@/views/label/datasource/datasource'
import Attribute from '@/views/label/attribute/attribute'

import Task2 from '@/views/label/task2/task2'
import History from '@/views/label/history/history'
import Performance from '@/views/label/performance/performance'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  linkActiveClass: 'c-isActive',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    }, {
      path: '/login', // 默认子路由
      name: 'login',
      component: Login,
      meta: {
        isLogin: false
      }
    }, {
      path: '/label',
      name: 'label',
      component: Label,
      children: [{
        path: '', // 默认子路由
        name: 'task',
        component: Task,
        meta: {
          groupid: 1
        }
      }, {
        path: 'datasource',
        name: 'datasource',
        component: DataSource,
        meta: {
          groupid: 1
        }
      }, {
        path: 'attribute',
        name: 'attribute',
        component: Attribute,
        meta: {
          groupid: 1
        }
      }, {
        path: 'task2', // 默认子路由
        name: 'task2',
        component: Task2,
        meta: {
          groupid: 2
        }
      }, {
        path: 'history', // 默认子路由
        name: 'history',
        component: History,
        meta: {
          groupid: 2
        }
      }, {
        path: 'performance', // 默认子路由
        name: 'performance',
        component: Performance,
        meta: {
          groupid: 2
        }
      } ]
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    }, {
      path: '*',
      name: 'home',
      component: Home
    }
  ]
})
router.beforeEach((to, from, next) => {
  // to: Route: 即将要进入的目标 路由对象
  // from: Route: 当前导航正要离开的路由
  // next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
  let isManage = to.matched.some(item => item.meta.groupid == 1)// 有要求先登录,且groupid==1管理员,的话就是true
  let groupid = localStorage.getItem('groupid')
  if (isManage) { // 是管理员就是已登录
    if (groupid == 1) { // 如果是管理员就继续访问，否则去登录
      next()
    } else {
      router.push('/login')
    }
  } else {
    next()
  }
  // 已登录状态；当路由到login时，跳转至home
  if (to.path === '/login') {
    if (groupid == 1) {
      router.push({path: '/label'})
    }
  }
})

export default router
