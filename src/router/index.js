import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  linkActiveClass: 'c-isActive',
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/label/login/login')
    }, {
      path: '/login', // 默认子路由
      name: 'login',
      component: () => import('@/views/label/login/login'),
      meta: {
        isLogin: false
      }
    }, {
      path: '/label',
      name: 'clabel',
      component: () => import('@/views/label/label'),
      children: [{
        path: 'task',
        name: 'task',
        component: () => import('@/views/label/task/task'),
        meta: {
          groupid: 1
        }
      }, {
        path: 'datasource',
        name: 'datasource',
        component: () => import('@/views/label/datasource/datasource'),
        meta: {
          groupid: 1
        }
      }, {
        path: 'attribute',
        name: 'attribute',
        component: () => import('@/views/label/attribute/attribute'),
        meta: {
          groupid: 1
        }
      }, {
        path: 'task_label',
        name: 'task_label',
        component: () => import('@/views/label/task_label/task_label'),
        meta: {
          groupid: 2
        }
      }, {
        path: 'rework',
        name: 'rework',
        component: () => import('@/views/label/rework/rework'),
        meta: {
          groupid: 2
        }
      }, {
        path: 'rework_details',
        name: 'rework_details',
        component: () => import('@/views/label/rework_details/rework_details'),
        meta: {
          groupid: 2
        }
      }, {
        path: 'history',
        name: 'history',
        component: () => import('@/views/label/history/history'),
        meta: {
          groupid: 2
        }
      }, {
        path: 'performance',
        name: 'performance',
        component: () => import('@/views/label/performance/performance'),
        meta: {
          groupid: 2
        }
      }, {
        path: 'task_details_line',
        name: 'task_details_line',
        component: () => import('@/views/label/task_details/task_details_line'),
        meta: {
          groupid: 2
        }
      }, {
        path: 'quality_task',
        name: 'quality_task',
        component: () => import('@/views/label/quality_task/quality_task'),
        meta: {
          groupid: 3
        }
      }, {
        path: 'handle',
        name: 'handle',
        component: () => import('@/views/label/handle/handle'),
        meta: {
          groupid: 3
        }
      }, {
        path: 'quality_history',
        name: 'quality_history',
        component: () => import('@/views/label/quality_history/quality_history'),
        meta: {
          groupid: 3
        }
      }, {
        path: 'quality_user_detail',
        name: 'quality_user_detail',
        component: () => import('@/views/label/quality_user_detail/quality_user_detail'),
        meta: {
          groupid: 3
        }
      }, {
        path: 'quality_check_details',
        name: 'quality_check_details',
        component: () => import('@/views/label/quality_check_details/quality_check_details'),
        meta: {
          groupid: 3
        }
      }]
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/register/register')
    }, {
      path: '*',
      name: 'login',
      component: () => import('@/views/label/login/login')
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
      router.push({path: '/label/quality_task'})
    }
  }
  // 已登录状态，当路由到label时进行跳转
  if (to.path === '/label') {
    if (groupid == 1) {
      router.push({path: '/label/task'})
    } else if (groupid == 2) {
      router.push({path: '/label/task_label'})
    } else if (groupid == 3) {
      router.push({path: '/label/quality_task'})
    } else {
      router.push({path: '/login'})
    }
  }
})

export default router
