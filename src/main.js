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
Vue.prototype.baseUrl = 'http://localhost:82'
Vue.prototype.sendAjax = (params) => {
  $.ajax({
    type: params.type || 'get',
    url: params.url,
    dataType: 'json',
    contentType: 'application/json',
    async: params.async || true,
    data: params.type == 'get' || 'GET' ? params.data : JSON.stringify(params.data),
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
