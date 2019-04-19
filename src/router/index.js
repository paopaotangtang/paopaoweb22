import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/home/home'
import Label from '@/views/label/label'
import Login from '@/views/label/login/login'
import Register from '@/views/register/register'
import DataSource from '@/views/label/datasource/datasource'
import Task from '@/views/label/task/task'
import Attribute from '@/views/label/attribute/attribute'
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
      meta: {
        isLogin: true
      },
      children: [{
        path: '', // 默认子路由
        name: 'task',
        component: Task,
        meta: {
          isLogin: true
        }
      }, {
        path: 'datasource',
        name: 'datasource',
        component: DataSource,
        meta: {
          isLogin: true
        }
      }, {
        path: 'attribute',
        name: 'attribute',
        component: Attribute,
        meta: {
          isLogin: true
        }
      }, {
        path: '*', // 默认子路由
        component: Task
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
  let needlogin = to.matched.some(item => item.meta.isLogin)// 有要求先登录的话就是true
  let isLogin = localStorage.getItem('isLogin')
  if (needlogin) {
    if (isLogin) {
      next()
    } else {
      router.push('/login')
    }
  } else {
    next()
  }
  // 已登录状态；当路由到login时，跳转至home
  if (to.path === '/login') {
    if (isLogin) {
      router.push({path: '/label'})
    }
  }
})

export default router
