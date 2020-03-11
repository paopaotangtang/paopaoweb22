<template>
  <div class="hello">
    <header>标 注 系 统</header>
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
          <router-link class="login-form-forgot" to="/register">
            没有账号？立即注册
          </router-link>
          <br>
          <router-link class="modify-form-password" to="/modify_pwd">
            修改密码
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

export default {
  name: 'login',
  data () {
    return {
      form: this.$form.createForm(this)
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        console.log('form:', values)
        if (!err) {
          let params = {
            type: 'POST',
            url: this.baseUrl + '/login',
            data: {
              'nickname': values.username,
              'password': values.password
            },
            success: (res) => {
              console.log('成功调用了ajax', res)
              if (res.code === 200) { // 如果账号密码正确
                console.log('返回了', res)
                window.localStorage.setItem('groupid', res.groupid)
                window.localStorage.setItem('user_id', res.user_id)
                window.localStorage.setItem('nickname', res.nickname)
                this.$success({
                  title: '登陆成功',
                  content: res.msg,
                  maskClosable: true
                })
                if (res.groupid == 1) {
                  this.$router.push('/label/task')
                } else if (res.groupid == 2) {
                  this.$router.push('/label/task_label')
                } else if (res.groupid == 3) {
                  this.$router.push('/label/quality_task')
                }
              } else if (res.error_code != 0) {
                this.$error({
                  title: '登录失败',
                  content: res.msg,
                  maskClosable: true
                })
              }
            },
            error: function (err) {
              console.log('ajax error!', err.responseJSON.msg)
            }
          }
          this.sendAjax(params)
        }
      })
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  header {
    height: 60px;
    font: 35px/60px "STXingkai";
    background: linear-gradient(to right, #98F5FF, #76EEC6);
    color: rgba(0, 0, 0, 0.76);
  }
  .c-login {
    width: 300px;
    height: 300px;
    background: linear-gradient(to bottom, #98F5FF, #76EEC6);
    border-radius: 50px;
    border: 4px solid #000;
    margin: 15% auto 0;
    padding: 30px;
  }
  .c-remember{
    color: #1890ff;
  }

</style>
