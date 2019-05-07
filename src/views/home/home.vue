<template>
  <div class="hello">
    <img class="c-paopao" src="../../assets/image/cat.jpg" >
    <h1>{{ msg }}</h1>
    <nav class="c-nav">
      <router-link class="c-li" to="">
        打卡
      </router-link>
      <a class="c-li" href="https://blog.csdn.net/paopaosama" target="_blank">
        博客
      </a>
      <router-link class="c-li" to="/login">
        标注
      </router-link>
      <router-link class="c-li" to="/register">
        注册
      </router-link>
      <router-link class="c-li" to="">
        撸猫
      </router-link>
    </nav>
  </div>
</template>

<script>
export default {
  beforeCreate () {
  },
  methods: {
  },
  name: 'home',
  data () {
    return {
      msg: '嘿、我发现你了'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .hello{
    width: 100%;
    height: 100%;
    background: url("../../assets/image/bg.jpg") no-repeat;
    background-size: cover;
  }
  .c-paopao{
    width: 100px;
    height:100px;
    border:2px solid #ffe7f2;
    border-radius: 50%;
    margin: 50px 50px 10px;
  }
  .c-nav{
    background: linear-gradient(transparent 0, rgba(255, 255, 255, 0.6) 20%,rgba(255, 255, 255, 0.6) 80%,transparent 100%);
  }
  h1, h2 {
    font-weight: normal;
    font-size: 22px;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin:0;
    padding: 0;
    list-style: none;
  }
  .c-li{
    display: inline-block;
    margin: 20px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    text-align: center;
    line-height: 100px;
    font-size: 20px;
    color: rgba(139, 21, 156, 0.53);
    font-weight: 600;
    cursor: pointer;
    text-underline: none;
  }
  .c-li:nth-of-type(1){
    background: radial-gradient(75% 75%,transparent,transparent,red);
  }
  .c-li:nth-of-type(1):hover{
    background: radial-gradient(75% 75%,transparent,transparent,green);
  }
  .c-li:nth-of-type(2){
    background: radial-gradient(75% 75%,transparent,transparent,orange);
  }
  .c-li:nth-of-type(2):hover{
    background: radial-gradient(75% 75%,transparent,transparent,purple);
  }
  .c-li:nth-of-type(3){
    background: radial-gradient(75% 75%,transparent,transparent,aqua);
  }
  .c-li:nth-of-type(3):hover{
    background: radial-gradient(75% 75%,transparent,transparent,palevioletred);
  }
  .c-li:nth-of-type(4){
    background: radial-gradient(75% 75%,transparent,transparent,green);
  }
  .c-li:nth-of-type(4):hover{
    background: radial-gradient(75% 75%,transparent,transparent,orangered);
  }
  .c-li:nth-of-type(5){
    background: radial-gradient(75% 75%,transparent,transparent,blue);
  }
  .c-li:nth-of-type(5):hover{
    background: radial-gradient(75% 75%,transparent,transparent, #66ff77);
  }
</style>
