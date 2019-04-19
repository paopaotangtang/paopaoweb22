<template>
  <div class="hello">
    <h1>注册账号之后您就可以畅游本网站了哦ヾ(◍°∇°◍)ﾉﾞ</h1>
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
          <a-button
            type="primary"
            html-type="submit"
            class="login-form-button"
          > 注册
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
// var baseUrl = 'https://www.easy-mock.com/mock/5c931ac12418a911d0e22aa7/paopaoweb'
var baseUrl = 'http://localhost:81'

export default {
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  methods: {
    toLabelHome () {
      this.$router.push({path: '/label/labelhome'})
    },
    handleSubmit (e) {
      var that = this
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          var params = {
            url: baseUrl + '/login',
            data: {
              'nickname': values.username,
              'password': values.password
            },
            success: (res) => {
              console.log('成功调用了ajax', res)

              if (res.status === 1) { // 如果账号密码正确
                console.log('返回了', res)
                localStorage.setItem('isLogin', true)
                that.toLabelHome()
              } else if (res.status === 0) {
                this.msg = res.msg
                this.error()
              }
            },
            error: function (err) {
              console.log('ajaxerrle!', err)
            }

          }
          this.myAjax(params)
        }
      })
    },
    success () {
      this.$success({
        title: '登陆成功',
        content: this.msg
      })
    },
    error () {
      this.$error({
        title: '登录失败',
        content: this.msg
      })
    }
  },
  name: 'register',
  data () {
    return {
      msg: ''
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1{
    padding: 20px;
  }
  .c-login {
    width: 300px;
    height: 300px;
    background: linear-gradient(bottom right, rgba(170, 136, 174, 0.39), rgba(135, 0, 103, 0.3));
    border-radius: 50px;
    border: 4px solid #000000;
    margin: 10% auto 0;
    padding: 30px;
  }

</style>
