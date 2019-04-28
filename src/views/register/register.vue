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
    toLabelHome () {
      this.$router.push({path: '/label'})
    },
    handleSource (value) {
      console.log(`Selected: ${value}`)
      // this.groupChecked = value
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          $.ajax({
            type: 'POST',
            url: this.baseUrl + '/register',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
              'nickname': values.nickname,
              'realname': values.realname,
              'password': values.password,
              'email': values.email,
              'groupid': values.groupid
            }),
            success: (res) => {
              console.log('成功调用了ajax', res)
              if (res.status === 'success') {
                console.log('返回了', res)

                this.$success({
                  title: '注册成功',
                  content: '已为您跳转到主页...'
                })
                window.localStorage.setItem('isLogin', true)
                this.toLabelHome()
              } else if (res.status === 'fail') {
                this.$error({
                  title: '注册失败',
                  content: res.msg
                })
              }
            },
            error: (err) => {
              this.$error({
                title: '注册失败',
                content: err
              })
            }
          })
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
  h1{
    padding: 20px;
  }
  .c-login {
    width: 400px;
    height:420px;
    background: linear-gradient(bottom right, rgba(170, 136, 174, 0.39), rgba(135, 0, 103, 0.3));
    border-radius: 50px;
    border: 4px solid #000000;
    margin: 50px auto 0;
    padding: 30px;
  }

</style>
