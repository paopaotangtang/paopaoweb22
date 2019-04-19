// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import myAjax from './assets/js/myajax'

Vue.use(antd)

Vue.prototype.myAjax = myAjax
Vue.config.productionTip = false
// Vue.prototype.baseUrl = 'https://www.easy-mock.com/mock/5c931ac12418a911d0e22aa7/paopaoweb'//这里是基础路由，以后铺设服务器也是改这个！
Vue.prototype.baseUrl = 'http://localhost:82'//是81么
// var baseUrl = 'http://localhost:81'
// let myObj={
//
// }
// Vue.prototype.$myObj = myObj
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
