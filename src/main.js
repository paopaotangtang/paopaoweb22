// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
/* eslint-disable no-unused-vars */
import $ from 'jquery'
import '@/assets/js/jquery.mousewheel.min'

Vue.use(antd)

Vue.config.productionTip = false
// Vue.prototype.baseUrl = 'https://www.easy-mock.com/mock/5c931ac12418a911d0e22aa7/paopaoweb'//这里是基础路由，以后铺设服务器也是改这个！
Vue.prototype.baseUrl = 'http://localhost:8282'
// Vue.prototype.baseUrl = 'http://192.168.0.196:8282'
// Vue.prototype.baseUrl = 'http://111.200.255.114:45982'
// Vue.prototype.baseUrl = 'http://182.61.51.47:82'
Vue.prototype.sendAjax = (params) => {
  $.ajax({
    type: params.type || 'get',
    url: params.url,
    dataType: 'json',
    timeout: params.timeout || -1,
    contentType: 'application/json',
    async: params.async || true,
    data: (params.type == 'post' || params.type == 'POST') ? JSON.stringify(params.data) : params.data,
    success: (res) => { params.success(res) },
    error: (err) => { params.error(err) }
  })
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
