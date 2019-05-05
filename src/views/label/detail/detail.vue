<template>
    <div class="wrap">
      <div class="img-box">
        <img id="myimg" :src="photo_path" alt="图片加载失败">
      </div>
      <div class="right">
        <table class="c-table" border="1">
          <tr>
            <th width="20%">属性名</th>
            <th width="80%">属性值</th>
          </tr>
          <tr v-for="item in props" :key="item.prop_id">
            <td>{{item.prop_name}}</td>
            <td>
              <a-radio-group @change="onChange" v-model="propCheck[item.prop_name]">
                <a-radio v-for="it in item.property_values" :key="it.option_value" :value="it.option_value">{{it.option_name}}</a-radio>
              </a-radio-group>
            </td>
          </tr>
          <!--<tr>-->
            <!--<td>衣服</td>-->
            <!--<td>-->
              <!--<a-radio-group @change="onChange" v-model="value">-->
                <!--<a-radio :value="1">A</a-radio>-->
                <!--<a-radio :value="2">B</a-radio>-->
                <!--<a-radio :value="3">C</a-radio>-->
                <!--<a-radio :value="4">D</a-radio>-->
              <!--</a-radio-group>-->
            <!--</td>-->
          <!--</tr>-->
          <!--<tr>-->
            <!--<td>肤色</td>-->
            <!--<td>-->
              <!--<a-radio-group @change="onChange2" v-model="value2">-->
                <!--<a-radio :value="1">AA</a-radio>-->
                <!--<a-radio :value="2">BB</a-radio>-->
                <!--<a-radio :value="3">CC</a-radio>-->
                <!--<a-radio :value="4">DD</a-radio>-->
              <!--</a-radio-group>-->
            <!--</td>-->
          <!--</tr>-->
        </table>
        <div>
          <a-button type="primary"  @click="getDetail" >确认修改</a-button>
          <a-button type="primary"  @click="getDetail" >上一张</a-button>
          <a-button type="primary"  @click="getDetail" >下一张</a-button>
          <a-button type="primary"  @click="getDetail" >尾页</a-button>
        </div>
      </div>
    </div>
</template>
<script>

export default {
  name: 'detail',
  data () {
    return {
      photo_path: '',
      props: [],
      propCheck: {}
    }
  },
  beforeMount () {
    this.getDetail()
  },
  mounted () {
    $('.img-box').on('mousewheel', function (e, delta) {
      // console.log(1111, e, 222, delta)
      // var del = ev.detail ? ev.detail > 0 : ev.wheelDelta < 0
      // console.log(del)
      // let ev = window.event || e // old IE support
      // var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)))
      var imgWidth = $('#myimg').width()
      var newWidth = imgWidth + 30 * delta
      $('#myimg').width(newWidth)
      // console.log($('#myimg').offset().left)

      return false
    })
  },
  methods: {
    onChange (e) {
      console.log('radio checked', e.target.value)
      console.log(this.propCheck)
    },
    getDetail () {
      console.log('click', this.$route.query)
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/task/show_task_detail',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'nickname': window.localStorage.getItem('nickname'),
          'task_id': this.$route.query.task_id,
          'type': this.$route.query.type
        }),
        success: (res) => {
          console.log('这里是返回的详情', res)
          this.photo_path = res.photo_path
          this.props = res.props
        },
        error: function (err) {
          console.log('error!', err)
        }
      })
    }

  }
}
</script>

<style scoped>
  .wrap{
    display: flex;
  }
  .c-table{
    width: 80%;
    margin: 0 auto 20px;
  }
  .c-table tr{
    height: 50px;
  }
  .img-box{
    border: 1px solid rgba(85, 85, 85, 0.33);
    width: 50%;
    height: 800px;
    overflow: auto;
    position: relative;
  }
  .right{
    width: 50%;
  }
  #myimg{
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin:auto;
  }

</style>
