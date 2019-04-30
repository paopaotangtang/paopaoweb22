<template>
  <div>
    <div class="c-bread">
      <span>任务列表</span>
    </div>
    <div class="c-table">
      <a-table :columns="columns" :dataSource="data" :rowKey="item => item.task_id" v-if="data.length"
               :pagination="pagination"
               @change="handleTableChange">
        <span slot="task_name" >task_name</span>
        <span slot="task_id" >task_id</span>
        <span slot="label_type" >label_type</span>
        <span slot="all_count" >图片数量</span>
        <span slot="completed_count" >已完成数量</span>
        <span slot="my_label_count" >我的标注量</span>
        <span slot="my_frame_count" >我的框数</span>
        <span slot="action" >
           <a-button type="primary"  @click="toDetail" >标注</a-button>
        </span>
      </a-table>
      <div  v-else style="padding: 20px;">暂无任务信息</div>
    </div>

  </div>
</template>

<script>
var columns = [{
  title: '任务名称',
  dataIndex: 'task_name'
}, {
  title: '任务id',
  dataIndex: 'task_id'
}, {
  title: '任务类型',
  dataIndex: 'label_type'
}, {
  title: '图片数量',
  dataIndex: 'all_count'
}, {
  title: '已完成数量',
  dataIndex: 'completed_count'
}, {
  title: '当前用户标注量',
  dataIndex: 'my_label_count'
}, {
  title: '当前用户框数',
  dataIndex: 'my_frame_count'
}, {
  title: '操作',
  dataIndex: 'action',
  scopedSlots: { customRender: 'action' }
}]

export default {
  name: 'task2',
  data () {
    return {
      data: [],
      pagination: {
        current: 1,
        pageSize: 10
      },
      columns: columns,
      allProps: [],
      allSources: [],
      propIds: [],
      prop_ids: [],
      source_id: undefined,
      sourceChecked: undefined,
      taskName: '', // 新建任务
      difficultNum: undefined, // 难度系数
      labelType: '人脸质量标注',
      labelTypeId: 1,
      checked: true,
      visible: false,
      confirmLoading: false
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  beforeMount () {
    this.getData()
  },
  mounted () {
  },
  methods: {
    toDetail (e) {
      this.$router.push({path: '/label/detail'})
    },
    getData (e) {
      this.data = [{
        task_name: '任务演示',
        task_id: 1,
        label_type: '人脸',
        all_count: 100,
        completed_count: 50,
        my_label_count: 12,
        my_frame_count: 5
      }]
      // $.ajax({
      //   url: this.baseUrl + '/task/labeler',
      //   dataType: 'json',
      //   data: {
      //     'page': this.pagination.current,
      //     'pagerows': this.pagination.pageSize
      //   },
      //   success: (res) => {
      //     console.log('这里是返回的真数据', res)
      //     // 假数据
      //     this.pagination.total = res.total
      //     this.data = res.tasks
      //     this.data.forEach(item => {
      //       item.create_time = this.getTime(item.create_time)
      //     })
      //     // console.log(this.data)
      //   },
      //   error: function (err) {
      //     console.log('error!', err)
      //   }
      // })
    },
    showModal () {
      this.initModal()
      this.visible = true
      this.confirmLoading = false
    },
    handleOk (e) {
      if (this.step === 1) { // 下一步获取所有的属性和数据源
        console.log(this.labelTypeId)
        this.confirmLoading = true
        $.ajax({
          type: 'GET',
          url: this.baseUrl + '/add_task?label_type_id=' + this.labelTypeId,
          dataType: 'json',
          success: (res) => {
            console.log('ok成功了！！！', res)
            this.allProps = res.props
            this.allSources = res.sources
            this.sourceChecked = this.allSources[0].source_name // 给组件的默认数据源
            this.source_id = this.allSources[0].source_id // 要传给后台的已选数据源id,默认第一个
            this.confirmLoading = false
            this.allProps.filter(item => {
              // this.allPropString.push(item.prop_name)// 给组件用的可选属性们
              this.propIds.push(item.prop_id)// 给组件用的可选属性们
              this.prop_ids.push(item.prop_id)// 给后台用的已选属性，默认全部
              // console.log(this.propIds)
            })
            this.step = 2
          },
          error: function (err) {
            console.log('error!', err)
          }
        })
      } else if (this.step === 2) {
        // 添加时，先过滤出组件里选择的属性ids
        console.log('配置属性数组', this.prop_ids)
        if (!this.taskName) {
          this.$warning({
            title: '任务名称不能为空',
            content: '请填写任务名称'
          })
          return
        } else if (!this.difficultNum) {
          this.$warning({
            title: '难度系数不能为空',
            content: '请填写难度系数'
          })
          return
        } else if (this.difficultNum <= 0) {
          this.$warning({
            title: '难度系数不正确',
            content: '请填写大于等于0的值'
          })
          return
        } else if (!this.prop_ids.length) {
          this.$warning({
            title: '配置属性不能为空',
            content: '请填写配置属性'
          })
          return
        }
        this.confirmLoading = true
        $.ajax({
          type: 'POST',
          url: this.baseUrl + '/add_task',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({
            'task_name': this.taskName,
            'difficult_num': this.difficultNum,
            'prop_ids': this.prop_ids.join(','),
            'source_id': this.source_id
          }),
          success: (res) => {
            console.log('ok成功了！！！', res)
            if (res.status === 'success') {
              this.getData()
              this.confirmLoading = false
              this.visible = false
            }
          },
          error: function (err) {
            console.log('error!', err)
          }
        })
      }
    },
    handleCancel (e) {
      this.visible = false
      this.confirmLoading = false
    },
    getTime (timestamp) {
      let time = new Date(timestamp * 1000)
      // console.log(111, timestamp, time)
      let y = time.getFullYear()
      let m = time.getMonth() + 1
      let d = time.getDate()
      return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d)
    },
    handleButtonClick (e) { // 修改数据类型
      this.labelType = e.item.title // 修改类型的显示
      this.labelTypeId = e.key // 修改数据类型
      console.log('labelTypeId', this.labelTypeId)
    },
    handleProp (value) {
      this.prop_ids = value
      console.log(`Selected: ${value}`)
    },
    handleSource (value) {
      console.log(`Selected: ${value}`)
      // sourceChecked
      let filterArray = this.allSources.filter(item => item.source_name === value)
      this.source_id = filterArray[0].source_id
      console.log(this.sourceChecked, this.source_id)
    },
    difficultNumChange (e) {
      if (e.target.value <= 0) {
        this.$warning({
          title: '难度系数不正确',
          content: '请填写大于等于0的值'
        })
      }
    },
    handleTableChange (pagination, filters, sorter) {
      this.pagination = pagination
      console.log(pagination, this.pagination)
      this.getData()
    }

  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
  .c-table{
    border: 1px solid #cbcbcb;
    border-radius: 5px;
    width: 80%;
    margin: 0 auto;
    color: rgba(0, 0, 0, 0.65);
  }
  .c-bread{
    padding: 0 10%;
    font-size: 22px;
    line-height: 60px;
    text-align: left;
  }

  .c-create{
    margin-left: 20px;

  }
  .c-margin-b{
    margin-bottom: 10px;
  }
  .ant-input{
    width: 70%;
  }
  .c-flex-box{
    display: flex;
    justify-content: space-between;
  }
  .c-title{
    display: inline-block;
    width: 20%;
  }
  .c-item{
    display: block;
  }
</style>
