<template>
    <div>
      <table class="c-table" border="1">
        <tr>
          <th width="20%">属性名</th>
          <th width="80%">属性值</th>
        </tr>
        <tr>
          <td>衣服</td>
          <td>
            <a-radio-group @change="onChange" v-model="value">
              <a-radio :value="1">A</a-radio>
              <a-radio :value="2">B</a-radio>
              <a-radio :value="3">C</a-radio>
              <a-radio :value="4">D</a-radio>
            </a-radio-group>
          </td>
        </tr>
        <tr>
          <td>肤色</td>
          <td>
            <a-radio-group @change="onChange2" v-model="value2">
              <a-radio :value="1">AA</a-radio>
              <a-radio :value="2">BB</a-radio>
              <a-radio :value="3">CC</a-radio>
              <a-radio :value="4">DD</a-radio>
            </a-radio-group>
          </td>
        </tr>
      </table>
      <div>
        <a-button type="primary"  @click="getDetail" >确认修改</a-button>
        <a-button type="primary"  @click="getDetail" >上一张</a-button>
        <a-button type="primary"  @click="getDetail" >下一章</a-button>
        <a-button type="primary"  @click="getDetail" >尾页</a-button>
      </div>
      <div class="img-box">
        <img id="myimg" src="../../../assets/image/homebg.jpg" alt="图片加载失败">
      </div>

    </div>
</template>
<script>

export default {
  name: 'detail',
  data () {
    return {
      value: 1,
      value2: 2
    }
  },
  mounted () {
    $('#myimg').on('mousewheel', function (e, delta) {
      console.log(1111, e, 222, delta)
      // var del = ev.detail ? ev.detail > 0 : ev.wheelDelta < 0
      // console.log(del)
      // let ev = window.event || e // old IE support
      // var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)))
      $('#myimg').width(function (n, width) {
        return width + 30*delta
      })
      // $('#myimg').style.width = Math.max(50, Math.min(800, $('#myimg').width + (30 * delta))) + 'px'
      return false
    })
  },
  methods: {
    onChange (e) {
      console.log('radio checked', e.target.value)
    },
    onChange2 (e) {
      console.log('radio checked', e.target.value)
    },
    getDetail () {
      console.log('click')
    }

  }
}
</script>

<style scoped>
  .c-table{
    width: 80%;
    margin: 0 auto 20px;
  }
  .c-table tr{
    height: 50px;
  }
  .img-box{
    padding: 20px;
    margin: 0 auto;
    width: 90%;
    height: 500px;
    overflow: auto;
    text-align: center;
  }

</style>
