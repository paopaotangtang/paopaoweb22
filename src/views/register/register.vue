<template>
  <div class="hello">
    <header>标 注 系 统</header>
    <h1>注册账号之后您就可以畅游本网站了哦ヾ(◍°∇°◍)ﾉﾞ</h1>
    <div class="c-login">
      <a-form
        id="components-form-demo-normal-login"
        :form="form"
        class="login-form"
        @submit="handleSubmit"
      >
        <a-form-item label="昵称"
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
        <a-form-item label="真实姓名"
                     :label-col="labelCol"
                     :wrapper-col="wrapperCol">
          <a-input
            v-decorator="[
          'realname',
          { rules: [{ required: true, message: '请输入真实姓名!' }] }
        ]"
            placeholder="请输入真实姓名"
          >
            <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)"/>
          </a-input>
        </a-form-item>
        <a-form-item label="密码"
                     :label-col="labelCol"
                     :wrapper-col="wrapperCol">
          <a-input
            v-decorator="[
          'password',
          { rules: [{ required: true, message: '请输入密码!' }] }
        ]"
            type="password"
            placeholder="请输入密码"
          >
            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)"/>
          </a-input>
        </a-form-item>
        <a-form-item label="邮箱"
                     :label-col="labelCol"
                     :wrapper-col="wrapperCol">
          <a-input
            v-decorator="['email',{rules: [{type: 'email', message: '邮箱格式错误!',},{required: true, message: '请输入邮箱!'}]}]"
            placeholder="请输入邮箱"
          />
        </a-form-item>
        <a-form-item label="标注类型"
                     :label-col="labelCol"
                     :wrapper-col="wrapperCol">
          <a-select
            :size="'default'"
            v-decorator="['groupid', { rules: [{ required: true, message: '请选择类型!' }] ,initialValue:2}]"
          >
            <a-select-option v-for="item in groupType" :key="item.groupId">
              {{item.groupName}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="login-form-button"
          > 注册
          </a-button>
          <router-link class="back-login" to="/login">
            返回登录
          </router-link>
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
            url: this.baseUrl + '/register',
            data: {
              'nickname': values.nickname,
              'realname': values.realname,
              'password': values.password,
              'email': values.email,
              'groupid': values.groupid
            },
            success: (res) => {
              console.log('成功调用了ajax', res)
              if (res.error_code === 0) {
                console.log('返回了', res)
                this.$success({
                  title: '注册成功',
                  content: '您已注册，请登录',
                  maskClosable: true
                })
                this.$router.push({path: '/login'})
              } else if (res.error_code !== 0) {
                this.$error({
                  title: '注册失败',
                  content: res.msg,
                  maskClosable: true
                })
              }
            },
            error: (err) => {
              this.$error({
                title: '注册失败了',
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
  name: 'register',
  data () {
    return {
      msg: '',
      labelCol: {
        sm: { span: 8 }
      },
      wrapperCol: {
        sm: { span: 12 }
      },
      groupType: [{
        groupName: '标注员',
        groupId: 2
      }, {
        groupName: '质检员',
        groupId: 3
      }]
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
    height:420px;
    background: linear-gradient(to bottom, #98F5FF, #76EEC6);
    border-radius: 50px;
    border: 4px solid #000000;
    margin: 50px auto 0;
    padding: 30px;
  }
.back-login{
  margin-left: 20px;
}
</style>
