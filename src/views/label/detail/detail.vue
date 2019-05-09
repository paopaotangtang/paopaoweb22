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
            <a-button type="primary"  @click="getDetail(2)" :loading="lastLoading" >上一张</a-button>
            <a-button type="primary"  @click="getDetail(3)" :loading="nextLoading">下一张</a-button>
            <a-button type="primary"  v-if="detail_type!==1" @click="modifyDetail()" :loading="modifyLoading">确认修改</a-button>
          </div>
          <div>
            <a-button type="primary"  @click="saveData(1)" :loading="saveLoading">新的一张</a-button>
          </div>
        </div>
      </div>

      <div class="right">
        <table class="c-table" border="1">
          <tr>
            <th width="20%">属性名</th>
            <th width="80%">属性值</th>
          </tr>
          <tr v-for="item in props" :key="item.prop_id" :item="item" >
            <td>{{item.prop_name}}</td>
            <td class="c-height">
              <a-radio-group
                @change="onchange"
                :options="getOptions(item.property_values)"
                v-model="radioCheck[item.prop_id]"
                :defaultValue="item.prop_option_value"
                style="line-height:50px;"></a-radio-group>
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
      props: [], // 传来的并传回去
      radioCheck: {},
      open: false,
      detail_type: 1,
      modifyLoading: false,
      lastLoading: false,
      nextLoading: false,
      saveLoading: false
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
      // event.preventDefault()
      if (event.keyCode == 32) {
        this.open = !this.open
        console.log(this.open)
      }
    })

    $('#myimg').on('mousedown', function (e) {
      if (!this.open) {
        return false
      }
      // event.preventDefault()
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
    onchange (e) {
      console.log(e.target.value)
      console.log(this.radioCheck)
    },
    getOptions (propertyValues) {
      console.log('更新了option:')
      let options = []
      propertyValues.forEach(item => {
        options.push({ label: item.option_name, value: item.option_value })
      })
      return options
    },
    getDetail (detailType) {
      if (detailType == 2) {
        this.lastLoading = true
      } else if (detailType == 3) {
        this.nextLoading = true
      }
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
          if (res.status == '该任务已结束') {
            this.$warning({
              title: '此任务已完成：',
              content: '已经没有图片了。'
            })
            this.$router.push({path: '/label/task2'})
          } else if (res.msg) {
            this.$warning({
              title: '温馨提示：',
              content: res.msg
            })
          } else {
            this.photo_path = res.photo_path
            this.task_detail_id = res.task_detail_id
            this.props = res.props
            this.detail_type = res.detail_type
            if (this.detail_type == 1) {
              // 如果是新的一张，保存之后重置用户的选择列表，使新的radio干净
              for (var i in this.radioCheck) {
                this.radioCheck[i] = 0
              }
            } else {
              // 如果是2/3历史记录，使新的radio展示原来的数据
              this.props.forEach(item => {
                this.radioCheck[item.prop_id] = parseInt(item.prop_option_value)
              })
            }
          }
          this.lastLoading = false
          this.nextLoading = false
          this.saveLoading = false
        },
        error: function (err) {
          console.log('error!', err)
        }
      })
    },
    modifyDetail () {
      this.modifyLoading = true
      for (var i in this.radioCheck) {
        this.props.forEach(item => {
          if (item.prop_id == i) {
            item['prop_option_value'] = this.radioCheck[i]
          }
        })
      }
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/task/modify_data',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'create_user': window.localStorage.getItem('nickname'),
          'photo_path': this.photo_path,
          'task_id': this.task_id,
          'task_detail_id': this.task_detail_id,
          'props': this.props,
          'detail_type': this.detail_type

        }),
        success: (res) => {
          this.modifyLoading = false
          if (res.status == 'success') {
            this.$success({
              title: '修改成功：',
              content: '此数据已保存。',
              maskClosable: true
            })
          } else if (res.msg) {
            this.$warning({
              title: '温馨提示：',
              content: res.msg,
              maskClosable: true
            })
          }
        },
        error: function (err) {
          console.log('error!', err)
        }
      })
    },
    saveData (detailType) {
      this.saveLoading = true
      if (this.detail_type !== 1) {
        this.getDetail(1)
        return
      }
      for (var i in this.radioCheck) {
        this.props.forEach(item => {
          if (item.prop_id == i) {
            item['prop_option_value'] = this.radioCheck[i]
          }
        })
      }
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/task/save_data',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'create_user': window.localStorage.getItem('nickname'),
          'photo_path': this.photo_path,
          'task_id': this.task_id,
          'task_detail_id': this.task_detail_id,
          'props': this.props
        }),
        success: (res) => {
          if (res.status == 'success') {
            this.saveLoading = false
            this.getDetail(1)
          }
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
  label.ant-radio-wrapper{
    line-height: 50px;
  }
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
  .ant-radio-group.ant-radio-group-outline.ant-radio-group-default span{
    line-height: 50px !important;
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
