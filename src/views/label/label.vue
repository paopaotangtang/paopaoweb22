<template>
  <div class="hello">
    <ul class="c-label-nav">
      <!--<li class="c-icon">标注系统</li>-->
      <!--1.管理员2.标注员2.质检员-->
      <template v-if="groupId==1">
        <li class="c-user">当前用户：{{nickname}}（管理员）</li>
        <router-link exact to="/label/task" tag="li">任务</router-link>
        <router-link exact to="/label/datasource" tag="li">数据源</router-link>
        <router-link exact to="/label/attribute" tag="li">属性设置</router-link>
      </template>
      <template v-if="groupId==2">
        <li class="c-user">当前用户：{{nickname}}（标注员）</li>
        <router-link exact to="/label/task_label" tag="li">任务</router-link>
        <router-link exact to="/label/rework" tag="li">返工</router-link>
        <router-link exact to="/label/history" tag="li">历史</router-link>
        <router-link exact to="/label/performance" tag="li">绩效</router-link>
      </template>
      <template v-if="groupId==3">
        <li class="c-user">当前用户：{{nickname}}（质检员）</li>
        <router-link exact to="/label/quality_task" tag="li">查看质检</router-link>
        <router-link exact to="/label/handle" tag="li">手动生成质检</router-link>
        <router-link exact to="/label/quality_history" tag="li">质检历史</router-link>
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
      groupId: -1,
      nickname: ''
    }
  },
  beforeMount () {
    this.groupId = localStorage.getItem('groupid')
    this.nickname = localStorage.getItem('nickname')
  },
  methods: {
    quit () {
      localStorage.removeItem('groupid')
      localStorage.removeItem('user_id')
      localStorage.removeItem('nickname')
      this.$success({
        title: '提示',
        content: '退出成功',
        maskClosable: true
      })
      this.$router.push({path: '/login'})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
   .hello{
    width: 100%;
    height: 100%;
  }

   a{
     text-underline: none;
     color: white;
   }
  ul.c-label-nav {
    height: 60px;
    font: 16px/60px "微软雅黑";
    background: rgba(74, 142, 202, 0.48);
    background: linear-gradient(to right, #98F5FF, #76EEC6);
    color: white;
  }
  ul.c-label-nav .c-icon{
    position: absolute;
    left: 50px;
    font: 30px/60px "STXingkai";
    color: rgba(0, 0, 0, 0.76);
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
  .c-label-nav .c-user{
    color:  rgba(0, 0, 0, 0.76);
  }
  .c-label-nav .c-user:hover{
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
