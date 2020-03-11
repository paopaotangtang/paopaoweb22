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
        <a-form-item label="用户名"
                     :label-col="labelCol"
                     :wrapper-col="wrapperCol">
          <a-input
            v-decorator="[
          'nickname',
          { rules: [{ required: true, message: '请输入用户名!' }] }
        ]"
            placeholder="请输入用户名"
          >
            <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)"/>
          </a-input>
        </a-form-item>
        <a-form-item label="旧密码"
                     :label-col="labelCol"
                     :wrapper-col="wrapperCol">
          <a-input
            v-decorator="[
          'old_password',
          { rules: [{ required: true, message: '请输入旧的密码!' }] }
        ]"
            type="password"
            placeholder="请输入旧的密码"
          >
            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)"/>
          </a-input>
        </a-form-item>
                <a-form-item label="新密码"
                     :label-col="labelCol"
                     :wrapper-col="wrapperCol">
          <a-input
            v-decorator="[
          'new_password',
          { rules: [{ required: true, message: '请输入新的密码!' }] }
        ]"
            type="password"
            placeholder="请输入新的密码"
          >
            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)"/>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="login-form-button"
          > 确认修改
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>

export default {
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  methods: {
    handleSource (value) {
      console.log(`Selected: ${value}`)
      // this.groupChecked = value
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          let params = {
            type: 'POST',
            url: this.baseUrl + '/modify_pwd',
            data: {
              'nickname': values.nickname,
              'old_password': values.old_password,
              'new_password': values.new_password
            },
            success: (res) => {
              console.log('成功调用了ajax', res)
              if (res.error_code === 0) {
                console.log('返回了', res)
                this.$success({
                  title: '修改成功',
                  content: '您已成功修改密码，请重新登录',
                  maskClosable: true
                })
                this.$router.push({path: '/login'})
              } else if (res.error_code !== 0) {
                this.$error({
                  title: '修改失败',
                  content: res.msg,
                  maskClosable: true
                })
              }
            },
            error: (err) => {
              console.log(err)
              this.$error({
                title: '修改失败',
                content: err.responseJSON.msg,
                maskClosable: true
              })
            }
          }
          this.sendAjax(params)
        }
      })
    }
  },
  name: 'modify_pwd',
  data () {
    return {
      msg: '',
      labelCol: {
        sm: { span: 8 }
      },
      wrapperCol: {
        sm: { span: 12 }
      }
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
  h1{
    padding: 20px;
  }
  .c-login {
    width: 400px;
    height:400px;
    background: linear-gradient(to bottom, #98F5FF, #76EEC6);
    border-radius: 50px;
    border: 4px solid #000000;
    margin: 10% auto 0;
    padding: 30px;
  }
.back-login{
  margin-left: 20px;
}
</style>
