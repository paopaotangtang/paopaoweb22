<template>
  <div>
    <div class="c-bread">
      <span>任务列表</span>
    </div>
    <div class="c-table">
      <a-table :columns="columns"
               :dataSource="tableData"
               :rowKey="item => item.task_id"
               v-if="tableData.length"
               :pagination="false"
               @change="handleTableChange"
               :loading="loading">
        <span  slot="date">date</span>
        <span slot="task_id" >task_id</span>
        <span slot="task_name" >task_name</span>
        <span slot="task_type" >task_type</span>>
        <span slot="action"  slot-scope="text,record">
           <a-button type="primary"  @click="toDetail(record)" >查看任务</a-button>
        </span>
      </a-table>
      <div  v-else style="padding: 20px;">暂无任务信息</div>
    </div>

  </div>
</template>

<script>
var columns = [{
  title: '质检生成时间',
  dataIndex: 'date'
}, {
  title: '任务名称',
  dataIndex: 'task_name'
}, {
  title: '任务id',
  dataIndex: 'task_id'
}, {
  title: '任务类型',
  dataIndex: 'task_type'
}, {
  title: '操作',
  dataIndex: 'action',
  scopedSlots: { customRender: 'action' }
}]

export default {
  name: 'quality_task',
  data () {
    return {
      tableData: [],
      quality_data: [],
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
    toDetail (record) {
      this.$router.push({
        path: '/label/quality_user_detail',
        query: {
          'task_id': record.task_id,
          'check_task_id': record.check_task_id
        }})
    },
    getData (e) {
      this.loading = true
      let params = {
        url: this.baseUrl + '/check_task',
        data: {},
        success: (res) => {
          console.log('这里是返回的真数据', res)
          this.quality_data = res.quality_data
          // 假数据
          // this.quality_data = [
          //   {
          //     'date': '2019-05-14',
          //     'check_task_id': 6,
          //     'tasks': [
          //       {
          //         'check_task_id': 6,
          //         'date': '2019-05-14',
          //         'task_name': '完整的标注测试',
          //         'task_id': 8,
          //         'task_type': '人脸质量标注'
          //       },
          //       {
          //         'check_task_id': 6,
          //         'date': '2019-05-14',
          //         'task_name': '文本框',
          //         'task_id': 10,
          //         'task_type': '人脸质量标注'
          //       },
          //       {
          //         'check_task_id': 6,
          //         'date': '2019-05-14',
          //         'task_name': '标记年龄',
          //         'task_id': 11,
          //         'task_type': '人脸质量标注'
          //       }
          //     ]
          //   },
          //   {
          //     'date': '2019-05-15',
          //     'check_task_id': 7,
          //     'tasks': [
          //       {
          //         'check_task_id': 7,
          //         'date': '2019-05-15',
          //         'task_name': '标记年龄',
          //         'task_id': 11,
          //         'task_type': '人脸质量标注'
          //       }
          //     ]
          //   }
          // ]

          this.quality_data.forEach(item => {
            this.tableData.push(...item.tasks)
          })
          this.loading = false
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
