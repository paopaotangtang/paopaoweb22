<template>
  <div>
    <div class="c-bread">
      <span>任务列表</span>
    </div>
    <div class="c-table">
      <a-table :columns="columns" :dataSource="data" :rowKey="item => item.task_id" v-if="data.length"
               :pagination="pagination"
               @change="handleTableChange"
                :loading="loading">
        <span slot="create_time" >create_time</span>
        <span slot="task_name" >task_name</span>
        <span slot="task_id" >task_id</span>
        <span slot="label_type" >label_type</span>>
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
  dataIndex: 'create_time'
}, {
  title: '任务名称',
  dataIndex: 'task_name'
}, {
  title: '任务id',
  dataIndex: 'task_id'
}, {
  title: '任务类型',
  dataIndex: 'label_type'
}, {
  title: '操作',
  dataIndex: 'action',
  scopedSlots: { customRender: 'action' }
}]

export default {
  name: 'task_quality',
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
    toDetail (record) {
      console.log('去标注', record)
      this.$router.push({
        path: '/label/detail',
        query: {
          'task_id': record.task_id}})
    },
    getData (e) {
      this.loading = true
      $.ajax({
        url: this.baseUrl + '/task/labeler',
        dataType: 'json',
        data: {
          'page': this.pagination.current,
          'pagerows': this.pagination.pageSize,
          'nickname': window.localStorage.getItem('nickname')
        },
        success: (res) => {
          console.log('这里是返回的真数据', res)
          // 假数据
          this.pagination.total = res.total
          // this.data = res.tasks
          this.data = [{
            create_time: 20170516,
            task_id: 19,
            task_name: '带文本框的任务',
            label_type: 'label_type'
          }, {
            create_time: 20170516,
            task_id: 20,
            task_name: '带文本框的任务',
            label_type: 'label_type'
          }, {
            create_time: 20170516,
            task_id: 11,
            task_name: '带文本框的任务',
            label_type: 'label_type'
          }, {
            create_time: 20170516,
            task_id: 12,
            task_name: '带文本框的任务',
            label_type: 'label_type'
          }]

          this.data.forEach(item => {
            item.create_time = this.getTime(item.create_time)
          })
          this.loading = false

        },
        error: function (err) {
          console.log('error!', err)
        }
      })
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
