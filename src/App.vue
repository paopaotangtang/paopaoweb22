<template>
  <div id="app">
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
  li{
    padding: 0;
    margin: 0;
    list-style: none;
  }
</style>
