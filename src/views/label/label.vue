<template>
  <div class="hello">
    <header>meto糖糖自用标注系统</header>
    <ul class="c-label-nav">
      <!--1.管理员2.标注员2.质检员-->
      <template v-if="groupId==1">
        <li class="c-user">当前用户：管理员</li>
        <router-link exact to="/label/task" tag="li">任务</router-link>
        <router-link exact to="/label/datasource" tag="li">数据源</router-link>
        <router-link exact to="/label/attribute" tag="li">属性设置</router-link>
      </template>
      <template v-if="groupId==2">
        <li class="c-user">当前用户：标注员</li>
        <router-link exact to="/label/task2" tag="li">任务</router-link>
        <router-link exact to="/label/history" tag="li">历史</router-link>
        <router-link exact to="/label/performance" tag="li">绩效</router-link>
      </template>
      <template v-if="groupId==3">
        <li class="c-user">当前用户：质检员</li>
        <router-link exact to="/label/task" tag="li">任务</router-link>
        <!--<router-link exact to="/label/datasource" tag="li">数据源</router-link>-->
        <!--<router-link exact to="/label/attribute" tag="li">属性设置</router-link>-->
      </template>
      <li @click="quit">退出系统</li>
    </ul>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'clabel',
  data () {
    return {
      groupId: -1
    }
  },
  beforeMount () {
    this.groupId = localStorage.getItem('groupid')
    console.log('获取用户groupid', this.groupId)
  },
  methods: {
    quit () {
      localStorage.removeItem('groupid')
      localStorage.removeItem('user_id')
      localStorage.removeItem('nickname')
      this.$success({
        title: '提示',
        content: '退出成功'
      })
      this.$router.push({path: '/login'})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  header {
    height: 40px;
    font: 16px/40px "微软雅黑";
    background: linear-gradient(right bottom, palevioletred, aquamarine);
    color: white;
  }
   a{
     text-underline: none;
     color: white;
   }
  ul.c-label-nav {
    height: 60px;
    font: 16px/60px "微软雅黑";
    background: rgba(74, 142, 202, 0.48);
    color: white;
  }
  .c-label-nav li{
    display: inline-block;
    padding: 0 20px;
    cursor: pointer;
    transition:0.5s;
  }
  .c-label-nav li:hover{
    background: #65ae7e;
  }
  .c-user{
    color: gray;
  }
  .c-user:hover{
    background: none;
  }
  .c-isActive{
    color: #4c7eae;
  }

  .c-text{
    font: 20px/40px "微软雅黑";
    color: blue;
    text-align: center;
  }
  .c-label-box {
    position: absolute;
    border: 5px dashed yellow;
    z-index: 99;
  }

</style>
