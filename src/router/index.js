import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/home/home'
import Label from '@/views/label/label'
import Login from '@/views/label/login/login'
import Register from '@/views/register/register'

import Task from '@/views/label/task/task'
import DataSource from '@/views/label/datasource/datasource'
import Attribute from '@/views/label/attribute/attribute'
import Detail from '@/views/label/detail/detail'
import DetailCanvas from '@/views/label/detail_canvas/detail_canvas'

import TaskLabel from '@/views/label/task_label/task_label'
import History from '@/views/label/history/history'
import Performance from '@/views/label/performance/performance'

import TaskQuality from '@/views/label/task_quality/task_quality'
import Handle from '@/views/label/handle/handle'
import QualityHistory from '@/views/label/quality_history/quality_history'
import QualityDetail from '@/views/label/quality_detail/quality_detail'

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
      name: 'clabel',
      component: Label,
      children: [ {
        path: 'task',
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
        path: 'task_label',
        name: 'task_label',
        component: TaskLabel,
        meta: {
          groupid: 2
        }
      }, {
        path: 'history',
        name: 'history',
        component: History,
        meta: {
          groupid: 2
        }
      }, {
        path: 'performance',
        name: 'performance',
        component: Performance,
        meta: {
          groupid: 2
        }
      }, {
        path: 'detail',
        name: 'detail',
        component: Detail,
        meta: {
          groupid: 2
        }
      }, {
        path: 'detail_canvas',
        name: 'detail_canvas',
        component: DetailCanvas,
        meta: {
          groupid: 2
        }
      }, {
        path: 'task_quality',
        name: 'task_quality',
        component: TaskQuality,
        meta: {
          groupid: 3
        }
      }, {
        path: 'handle',
        name: 'handle',
        component: Handle,
        meta: {
          groupid: 3
        }
      }, {
        path: 'quality_history',
        name: 'quality_history',
        component: QualityHistory,
        meta: {
          groupid: 3
        }
      }, {
        path: 'quality_detail',
        name: 'quality_detail',
        component: QualityDetail,
        meta: {
          groupid: 3
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
  let needLogin = to.matched.some(item => item.meta.groupid)// 有要求先登录,且groupid==1管理员,的话就是true
  let groupid = localStorage.getItem('groupid')
  if (needLogin) { // 如果这个路由需要特定身份
    console.log(to)
    if (groupid == to.meta.groupid) { // 如果是管理员就继续访问，否则去登录
      next()
    } else {
      router.push('/login')
    }
  } else {
    next()
  }
  // 已登录状态；当路由到login时，已有身份就跳转到对应页面
  if (to.path == '/login') {
    if (groupid == 1) {
      router.push({path: '/label/task'})
    } else if (groupid == 2) {
      router.push({path: '/label/task_label'})
    } else if (groupid == 3) {
      router.push({path: '/label/task_quality'})
    }
  }
  // 已登录状态，当路由到label时进行跳转
  if (to.path === '/label') {
    if (groupid == 1) {
      router.push({path: '/label/task'})
    } else if (groupid == 2) {
      router.push({path: '/label/task_label'})
    } else if (groupid == 3) {
      router.push({path: '/label/task_quality'})
    }
  }
})

export default router
