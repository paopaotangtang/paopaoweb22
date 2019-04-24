<template>
  <div class="hello">
    <header>meto糖糖自用标注系统</header>
    <div class="c-login">
      <a-form
        id="components-form-demo-normal-login"
        :form="form"
        class="login-form"
        @submit="handleSubmit"
      >
        <a-form-item>
          <a-input
            v-decorator="[
          'username',
          { rules: [{ required: true, message: '请输入用户名!' }] }
        ]"
            placeholder="Username"
          >
            <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)"/>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input
            v-decorator="[
          'password',
          { rules: [{ required: true, message: '请输入密码!' }] }
        ]"
            type="password"
            placeholder="Password"
          >
            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)"/>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-checkbox
            v-decorator="['remember',{
            valuePropName: 'checked',
            initialValue: true,
          }]">记住我
          </a-checkbox>
          <router-link class="login-form-forgot" to="/register">
            注册
          </router-link>
          <br>
          <a-button
            type="primary"
            html-type="submit"
            class="login-form-button"
          > 登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
// var baseUrl = 'https://www.easy-mock.com/mock/5c931ac12418a911d0e22aa7/paopaoweb'
// var baseUrl = 'http://localhost:81'

export default {
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          var params = {
            url: this.baseUrl + '/login',
            method: 'post',
            data: {
              'nickname': values.username,
              'password': values.password
            },
            success: (res) => {
              console.log('成功调用了ajax', res)
              // if (res.data.code === 200) { // 如果账号密码正确
              if (res.code === 200) { // 如果账号密码正确
                console.log('返回了', res)
                window.localStorage.setItem('isLogin', true)
                this.$success({
                  title: '登陆成功',
                  content: res.msg
                })
                this.$router.push('/label')
              } else if (res.code === 250) {
                this.$error({
                  title: '登录失败',
                  content: res.msg
                })
              }
            },
            error: function (err) {
              console.log('ajax error!', err)
            }

          }
          this.myAjax(params)
        }
      })
    }

  },
  name: 'login',
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
  header {
    height: 40px;
    font: 16px/40px "微软雅黑";
    background: linear-gradient(right bottom, palevioletred, aquamarine);
    color: white;
  }
  .c-login {
    width: 300px;
    height: 300px;
    background: linear-gradient(bottom right, rgba(137, 174, 80, 0.39), rgba(85, 14, 50, 0.39));
    border-radius: 50px;
    border: 4px solid #000000;
    margin: 15% auto 0;
    padding: 30px;
  }

</style>
