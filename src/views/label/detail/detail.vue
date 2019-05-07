<template>
    <div class="wrap">
      <div class="left">
        <div class="img-box" ondragstart="window.event.returnValue=false;return false;">
          <!--<img id="myimg" :src="photo_path" alt="图片加载失败">-->
          <img id="myimg" :src="photo_path" alt="图片加载失败">

        </div>
        <div class="wrap-bottom">
          <div class="left-bottom">
            历史记录：
            <a-button type="primary"  @click="getDetail(4)" >确认修改</a-button>
            <a-button type="primary"  @click="getDetail(2)" >上一张</a-button>
            <a-button type="primary"  @click="getDetail(3)" >下一张</a-button>
          </div>
          <div>
            <a-button type="primary"  @click="saveData(1)" >新的一张</a-button>
          </div>
        </div>
      </div>

      <div class="right">
        <table class="c-table" border="1">
          <tr>
            <th width="20%">属性名</th>
            <th width="80%">属性值</th>
          </tr>
          <tr v-for="item in props" :key="item.prop_id" >
            <td>{{item.prop_name}}</td>
            <td>
              <a-radio-group @change="onChange" v-model="radioCheck[item.prop_id]" :defaultValue="item.prop_option_value" >
                <a-radio v-for="it in item.property_values" :key="it.option_value" :value="it.option_value">{{it.option_name}}</a-radio>
              </a-radio-group>
            </td>
          </tr>
        </table>
      </div>
    </div>
</template>
<script>

export default {
  name: 'detail',
  data () {
    return {
      task_id: this.$route.query.task_id,
      photo_path: '',
      task_detail_id: -1,
      props: [], // 传来的
      propsCheck: [], // 传给后台的
      radioCheck: {},
      open: false
    }
  },
  beforeMount () {
    // 进入页面detail_type ==1,相当于新的一张
    this.getDetail(1)
  },
  mounted () {
    $('.img-box').on('mousewheel', function (e, delta) {
      e.preventDefault()
      var oldWidth = $('#myimg').width()
      var oldLeft = $('#myimg').offset().left
      var oldTop = $('#myimg').offset().top

      console.log('原本宽度', oldWidth)
      console.log('原本偏移量', oldLeft, oldTop)
      // 计算新值
      var newWidth = oldWidth + 30 * delta
      var newLeft = oldLeft - 15 * delta
      var newTop = oldTop - 15 * delta

      console.log('新宽度', newWidth)
      console.log('新的偏移量', newLeft, newTop)
      // 最小宽度100,否则不赋值
      if (newWidth >= 100) {
        $('#myimg').width(newWidth)
        $('#myimg').offset({left: newLeft, top: newTop})
      }
      return false
    })
    $(document).on('keydown', function (event) {
      event.preventDefault()
      if (event.keyCode == 32) {
        this.open = !this.open
        console.log(this.open)
      }
    })

    $('#myimg').on('mousedown', function (e) {
      if (!this.open) {
        return false
      }
      event.preventDefault()
      var startP = {
        x: e.clientX,
        y: e.clientY
      }
      var endP = {}
      var diff = {}
      var startLeft = $('#myimg').offset().left
      var startTop = $('#myimg').offset().top
      // 计算新值

      $('.img-box').on('mousemove', function (e2) {
        endP = {
          x: e2.clientX,
          y: e2.clientY
        }
        diff = {
          x: endP.x - startP.x,
          y: endP.y - startP.y
        }
        console.log('移动了，', diff)
        $('#myimg').offset({left: startLeft + diff.x, top: startTop + diff.y})
        $('.img-box').on('mouseup', function () {
          $('.img-box').off('mousemove')
        })
        $('.img-box').on('mouseleave', function () {
          $('.img-box').off('mousemove')
        })
      })

      // console.log('新宽度', newWidth)
      // console.log('新的偏移量', newLeft, newTop)
      // 最小宽度100,否则不赋值

      return false
    })
  },
  methods: {
    onChange (e) {
      console.log(e.target.value)
    },
    getDetail (detailType) {
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/task/show_task_detail',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'nickname': window.localStorage.getItem('nickname'),
          'task_id': this.task_id,
          'detail_type': detailType,
          'task_detail_id': this.task_detail_id
        }),
        success: (res) => {
          console.log('这里是返回的详情', res.photo_path)
          // this.photo_path = 'data:image/*;base64,' + res.photo_path
          this.photo_path = res.photo_path
          this.task_detail_id = res.task_detail_id
          this.props = res.props.concat()
          this.propsCheck = res.props.concat()
        },
        error: function (err) {
          console.log('error!', err)
        }
      })
    },
    saveData (detailType) {
      console.log('y已选数据', this.radioCheck)
      // let arr = [1,2]
      // arr.forEach(item=>{
      //   console.log(123,item)
      // })
      console.log(this.propsCheck)

      this.propsCheck = this.propsCheck.forEach(item => {
        for (var i in this.radioCheck) {
          console.log('i:', i, 'prod_id:', item.prop_id)
          if (item.prop_id == i) {
            item['prop_option_value'] = this.radioCheck[i]
          } else {
            item['prop_option_value'] = 0
          }
          delete item['property_values']
        }
      })
      console.log(this.props)

      // $.ajax({
      //   type: 'POST',
      //   url: this.baseUrl + '/task/save_data',
      //   dataType: 'json',
      //   contentType: 'application/json',
      //   data: JSON.stringify({
      //     'create_user': window.localStorage.getItem('nickname'),
      //     'photo_path': this.photo_path,
      //     'task_id': this.task_id,
      //     'task_detail_id': this.task_detail_id,
      //     'props': this.radioCheck
      //   }),
      //   success: (res) => {
      //     console.log('这里是返回的详情', res)
      //     // this.photo_path = 'data:image/*;base64,' + res.photo_path
      //     // this.photo_path = res.photo_path
      //     // this.task_detail_id = res.task_detail_id
      //     // this.props = res.props
      //   },
      //   error: function (err) {
      //     console.log('error!', err)
      //   }
      // })
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
    width: 100%;
    height: 600px;
    overflow: hidden;
    position: relative;
    margin-bottom: 10px;

  }
  .left{
    width: 50%;
    margin-left:50px;
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
.wrap-bottom{
  display: flex;
  justify-content: space-between;
}
  .left-bottom{
    width: 50%;
    border-right:1px solid gray;
    text-align: left;
  }
</style>
