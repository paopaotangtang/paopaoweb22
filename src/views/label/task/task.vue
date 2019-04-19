<template>
<div>任务列表</div>
</template>

<script>
export default {

  beforeCreate () {
  },
  mounted: function () {

  },
  methods: {

  },
  name: 'task',
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  nav {
    height: 60px;
    font: 16px/60px "微软雅黑";
    background: rgba(74, 142, 202, 0.48);
    color: white;
  }
  li{
    display: inline-block;
    padding: 0 20px;
    cursor: pointer;
    transition:0.5s;
  }
  li:hover{
    background: #65ae7e;
  }
  .c-user{
    color: gray;
  }
  .c-user:hover{
    background: none;
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
