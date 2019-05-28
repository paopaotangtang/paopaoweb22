<template>
    <div class="wrap">
      <div class="left">
        <div class="c-done">
          <span>删除（del/D）</span>
          <span :class="openSpace? 'c-span-active': ''">拖拽（Space）</span>
          <span>坐标线（X）</span>
          <span >废弃</span>
          <span>退出标注</span>
        </div>
        <div class="img-box" ondragstart="window.event.returnValue=false;return false;">
        <img id="myimg" :src="photo_path" />
        </div>
        <div class="wrap-bottom">
          <div class="left-bottom">
            历史记录：
            <a-button type="primary"  @click="getDetail(2)" :loading="lastLoading" >上一张</a-button>
            <a-button type="primary"  @click="getDetail(3)" :loading="nextLoading">下一张</a-button>
            <a-button type="primary"  v-if="detail_type!==1 && !qualityLock" @click="modifyDetail()" :loading="modifyLoading">确认修改</a-button>
            <a-tooltip title="此数据已被质检员确认，不可修改"><a-button type="primary"  v-if="detail_type!==1 && qualityLock" disabled>确认修改</a-button></a-tooltip>
          </div>
          <div>
            <a-button type="primary"  @click="saveData(1)" :loading="saveLoading">新的一张</a-button>
          </div>
        </div>
      </div>

      <div class="right">
        <a-tag v-if="qualityLock" color="#f50" style="margin-bottom: 10px;">此数据已被质检员确认，不可修改</a-tag>
        <table class="c-table" border="1">
          <tr>
            <th width="20%">属性名</th>
            <th width="80%">属性值</th>
          </tr>
          <tr v-for="item in props" :key="item.prop_id" :item="item" >
            <td>{{item.prop_name}}</td>
            <td class="c-left-td">
              <a-radio-group  v-if="item.prop_type==1"
                              @change="onchange(item.prop_id)"
                              :value="parseInt(item.prop_option_value)"
                              buttonStyle="solid"
                              size="large">
                <a-radio-button v-for="option in item.property_values" :key="option.option_value" :value="option.option_value"
                                :class="item.prop_option_value!==item.prop_option_value_final&&option.option_value==item.prop_option_value_final?'red':''"
                >{{option.option_name}}</a-radio-button>
              </a-radio-group>
              <a-input v-if="item.prop_type==2" @change="onInput(item.prop_id)"   :placeholder="item.prop_option_value" :value="item.prop_option_value"/>
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
      openSpace: false,
      classActive: 'c-span-active',
      detail_type: 1,
      qualityLock: false,
      modifyLoading: false,
      lastLoading: false,
      nextLoading: false,
      saveLoading: false,
      isMove: false,
      isDown: false
    }
  },
  beforeMount () {
    // 进入页面detail_type ==1,相当于新的一张
    this.getDetail(1)
  },
  mounted () {
    var that = this
    // 滚轮缩放
    $('.img-box').on('mousewheel', function (e, delta) {
      e.preventDefault()
      var oldWidth = $('#myimg').width()
      var oldHeight = $('#myimg').height()
      var retio = oldHeight / oldWidth
      var oldLeft = $('#myimg').offset().left
      var oldTop = $('#myimg').offset().top
      // 计算新值
      var newWidth = oldWidth + 30 * delta
      var newHeight = newWidth * retio
      var newLeft = oldLeft - 15 * delta
      var newTop = oldTop - 15 * delta
      // 最小宽度100,否则不赋值
      if (newWidth >= 100) {
        $('#myimg').width(newWidth)
        $('#myimg').height(newHeight)
        $('#myimg').offset({left: newLeft, top: newTop})
      }
      return false
    })

    $(document).on('keydown', function (event) {
      if (event.keyCode == 32) {
        that.openSpace = !that.openSpace
      }
    })

    $(document).on('mousedown', function (e) {
      that.isDown = true
      if (!that.openSpace && e.target.id !== 'myimg') {
        return
      }
      var startP = {
        x: e.clientX,
        y: e.clientY
      }
      var endP = {}
      var diff = {}
      var startLeft = $('#myimg').offset().left
      var startTop = $('#myimg').offset().top
      // 计算新值
      $(document).on('mousemove', function (e2) {
        if (!that.openSpace || !that.isDown) {
          return
        }
        that.isMove = true
        endP = {
          x: e2.clientX,
          y: e2.clientY
        }
        var boxX1 = $('.img-box').offset().left
        var boxX2 = boxX1 + $('.img-box').width()
        var boxY1 = $('.img-box').offset().top
        var boxY2 = boxY1 + $('.img-box').height()

        if (endP.x < boxX1 || endP.x > boxX2 || endP.y < boxY1 || endP.y > boxY2) {
          that.isMove = false
        }
        diff = {
          x: endP.x - startP.x,
          y: endP.y - startP.y
        }
        if (that.openSpace && that.isMove) {
          $('#myimg').offset({left: startLeft + diff.x, top: startTop + diff.y})
        }
        $(document).on('mouseup', function () {
          that.isDown = false
          that.isMove = false
          $(document).off('mousemove')
        })
      })
      $('.img-box').on('mouseup', function () {
        that.isDown = false
      })
      return false
    })
  },
  destroyed () {
    $(document).off('keydown')
    $(document).off('mousedown')
  },

  methods: {
    onchange (id) {
      console.log('change啦')
      console.log(event.target.value, id)
      this.props.forEach(item => {
        if (item.prop_id == id) {
          item.prop_option_value = parseInt(event.target.value)
          item.prop_option_value_final = parseInt(event.target.value)
        }
      })
    },
    onInput (id) {
      this.props.forEach(item => {
        if (item.prop_id == id) {
          item.prop_option_value = event.target.value
        }
      })
    },
    getDetail (detailType) {
      if (detailType == 2) {
        this.lastLoading = true
      } else if (detailType == 3) {
        this.nextLoading = true
      }
      let params = {
        type: 'POST',
        url: this.baseUrl + '/task/show_task_detail',
        data: {
          'nickname': window.localStorage.getItem('nickname'),
          'task_id': this.task_id,
          'detail_type': detailType,
          'task_detail_id': this.task_detail_id
        },
        success: (res) => {
          if (res.status == '该任务已结束') {
            this.$warning({
              title: '此任务已完成：',
              content: '已经没有图片了。',
              maskClosable: true
            })
            this.$router.push({path: '/label/task2'})
          } else if (res.msg) {
            this.$warning({
              title: '温馨提示：',
              content: res.msg,
              maskClosable: true
            })
          } else {
            this.initImg()
            this.photo_path = res.photo_path
            this.task_detail_id = res.task_detail_id
            this.props = res.props
            this.detail_type = res.detail_type
            /*eslint-disable*/
            this.qualityLock = res.quality_lock == 1 ? true : false
          }
          this.lastLoading = false
          this.nextLoading = false
          this.saveLoading = false
        },
        error: function (err) {
          console.log('error!', err)
        }
      }
      this.sendAjax(params)
    },
    modifyDetail () {
      this.modifyLoading = true
      let params = {
        type: 'POST',
        url: this.baseUrl + '/task/modify_data',
        data: {
          'create_user': window.localStorage.getItem('nickname'),
          'group_id': window.localStorage.getItem('groupid'),
          'photo_path': this.photo_path,
          'task_id': this.task_id,
          'task_detail_id': this.task_detail_id,
          'props': this.props,
          'detail_type': this.detail_type

        },
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
      }
      this.sendAjax(params)
    },
    saveData (detailType) {
      this.saveLoading = true
      if (this.detail_type !== 1) {
        this.getDetail(1)
        return
      }
      let params = {
        type: 'POST',
        url: this.baseUrl + '/task/save_data',
        data: {
          'create_user': window.localStorage.getItem('nickname'),
          'group_id': window.localStorage.getItem('groupid'),
          'photo_path': this.photo_path,
          'task_id': this.task_id,
          'task_detail_id': this.task_detail_id,
          'props': this.props
        },
        success: (res) => {
          if (res.status == 'success') {
            this.saveLoading = false
            this.getDetail(1)
          }
        },
        error: function (err) {
          console.log('error!', err)
        }
      }
      this.sendAjax(params)
    },
    initImg () {
      let wid = $('#myimg').width()
      let hei = $('#myimg').height()
      if (wid > hei) {
        $('#myimg').width('100%')
        $('#myimg').height('auto')
      } else {
        $('#myimg').width('auto')
        $('#myimg').height('100%')
      }
      $('#myimg').css({'left': '0', 'top': '0'})
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
  .c-left-td{
    padding: 0 20px;
    text-align: left;
  }
  .c-done{
    text-align: left;
    line-height: 50px;
    cursor: pointer;
  }
  .c-done span{
    margin-right: 20px;
  }
  .c-span-active{
    color:blue;
  }
  .img-box{
    border: 1px solid rgba(85, 85, 85, 0.33);
    width: 100%;
    height: 800px;
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
    width: auto;
    height: 100%;
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
  padding-bottom: 10px;
}
  .left-bottom{
    width: 50%;
    border-right:1px solid gray;
    text-align: left;
  }
  .red{
    background: red;
    color:white;
  }
</style>
