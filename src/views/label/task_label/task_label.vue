<template>
  <div>
    <div class="c-bread">
      <span>任务列表</span>
      <a-button type="primary"  @click="refreshTask()" style="float: right">刷新</a-button>
    </div>
    <div class="c-table">

      <a-table :columns="columns" :dataSource="data" :rowKey="item => item.task_id" v-if="data.length"
               :pagination="pagination"
               @change="handleTableChange"
                :loading="loading">
        <span slot="task_name" >task_name</span>
        <span slot="task_id" >task_id</span>
        <span slot="label_type" >label_type</span>
        <span slot="all_count" >图片总数</span>
        <span slot="completed_count" >已完成总数</span>
        <span slot="my_label_count" >我的标注量</span>
        <span slot="my_today_label_count" >今日标注量</span>
        <span slot="be_left_doubt_count" >未完成存疑量</span>
        <!--<span slot="my_frame_count" >我的框数</span>-->
        <span slot="action"  slot-scope="text,record">
           <a-button type="primary"  @click="toTaskDetailsPolygon(record)" >标注</a-button>
           <a-button type="primary"  @click="toDoubtDetailsPolygon(record)" >存疑</a-button>
        </span>
      </a-table>
      <div  v-else style="padding: 20px;">暂无任务信息</div>
    </div>

  </div>
</template>

<script>
var columns = [{
  title: '任务id',
  dataIndex: 'task_id'
}, {
  title: '任务名称',
  dataIndex: 'task_name'
}, {
  title: '任务类型',
  dataIndex: 'label_type'
}, {
  title: '图片总数',
  dataIndex: 'all_count'
}, {
  title: '已完成总数',
  dataIndex: 'completed_count'
}, {
  title: '我的标注量',
  dataIndex: 'my_label_count'
}, {
  title: '今日标注量',
  dataIndex: 'my_today_label_count'
}, {
  title: '未完成存疑量',
  dataIndex: 'be_left_doubt_count'
},
//   {
//   title: '当前用户框数',
//   dataIndex: 'my_frame_count'
// },
{
  title: '操作',
  dataIndex: 'action',
  scopedSlots: { customRender: 'action' }
}]

export default {
  name: 'task_label',
  data () {
    return {
      data: [],
      pagination: {
        current: 1,
        pageSize: 10
      },
      columns: columns,
      loading: true
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
    refreshTask () {
      this.loading = true
      let params = {
        type: 'GET',
        url: this.baseUrl + '/task/refresh_task',
        data: {
          'page': this.pagination.current,
          'pagerows': this.pagination.pageSize,
          'nickname': window.localStorage.getItem('nickname')
        },
        success: (res) => {
          console.log(('刷新成果'))
          this.getData(res)
        },
        error: function (err) {
          console.log('error!', err)
        }
      }
      this.sendAjax(params)
      this.loading = false
    },
    toTaskDetailsPolygon (record) {
      console.log('去标注', record)
      this.$router.push({
        path: '/label/task_details_line',
        query: {
          'task_id': record.task_id,
          'is_doubt': 0
        }})
    },
    toDoubtDetailsPolygon (record) {
      console.log('进入存疑界面', record)
      this.$router.push({
        path: '/label/task_details_line',
        query: {
          'task_id': record.task_id,
          'is_doubt': 1
        }})
    },
    getData (e) {
      this.loading = true
      let params = {
        url: this.baseUrl + '/task/labeler',
        data: {
          'page': this.pagination.current,
          'pagerows': this.pagination.pageSize,
          'nickname': window.localStorage.getItem('nickname')
        },
        success: (res) => {
          console.log('这里是返回的真数据', res)
          // 假数据
          this.pagination.total = res.total
          this.data = res.tasks
          this.data.forEach(item => { item.my_frame_count = '--' })
          this.loading = false
          // this.data.forEach(item => {
          //   item.create_time = this.getTime(item.create_time)
          // })
          // console.log(this.data)
        },
        error: function (err) {
          console.log('error!', err)
        }
      }
      this.sendAjax(params)
    },
    getTime (timestamp) {
      let time = new Date(timestamp * 1000)
      // console.log(111, timestamp, time)
      let y = time.getFullYear()
      let m = time.getMonth() + 1
      let d = time.getDate()
      return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d)
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
    background: #ffffff;
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
