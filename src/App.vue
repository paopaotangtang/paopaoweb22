<template>
  <div id="app">
    <header>标注系统</header>
    <router-view></router-view>
  </div>
</template>

<script>
// window.onunload = function () {
//   console.log('unload')
//   localStorage.removeItem('groupid')
//   localStorage.removeItem('user_id')
//   localStorage.removeItem('nickname')
// }
export default {
  name: 'App'
}
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    width: 100%;
    height: 100%;
  }
  header {
    height: 60px;
    font: 16px/60px "微软雅黑";
    /*background: linear-gradient(right bottom, palevioletred, aquamarine);*/
    background: rgba(41, 109, 202, 0.48);
    color: white;
  }
  li{
    padding: 0;
    margin: 0;
    list-style: none;
  }
</style>
