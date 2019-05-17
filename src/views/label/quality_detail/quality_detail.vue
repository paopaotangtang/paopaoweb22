<template>
  <div>
    <div class="c-bread">
      <router-link exact to="/label/task_quality" tag="span" class="c-home">
        <a-icon type="home" />
        任务列表</router-link>
      /
      <span >任务详情</span>

    </div>
    <div class="c-table">
      <a-table :columns="columns"
               :dataSource="users"
               :rowKey="item => item.task_id"
               v-if="users.length"
               :pagination="false"
               @change="handleTableChange"
               :loading="loading">
        <span  slot="check_user">check_user</span>
        <span slot="check_num" >check_num</span>
        <span slot="total_num" >total_num</span>
        <span slot="error_num" >error_num</span>
        <span slot="already_num" >already_num</span>>
        <span slot="action"  slot-scope="text,record">
           <a-button type="primary"  @click="toDetail(record)" >开始质检</a-button>
        </span>
      </a-table>
      <div  v-else style="padding: 20px;">暂无任务信息</div>
    </div>

  </div>
</template>

<script>
var columns = [{
  title: '标注员',
  dataIndex: 'check_user'
}, {
  title: '抽检数量',
  dataIndex: 'check_num'
}, {
  title: '总数量',
  dataIndex: 'total_num'
}, {
  title: '错误数',
  dataIndex: 'error_num'
}, {
  title: '已完成数量',
  dataIndex: 'already_num'
}, {
  title: '操作',
  dataIndex: 'action',
  scopedSlots: { customRender: 'action' }
}]

export default {
  name: 'quality_detail',
  data () {
    return {
      users: [],
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
        path: '/label/detail',
        query: {
          'task_id': record.task_id,
          'check_task_id': record.check_task_id
        }})
    },
    getData (e) {
      this.loading = true
      $.ajax({
        url: this.baseUrl + '/check_task',
        dataType: 'json',
        data: {},
        success: (res) => {
          console.log('这里是返回的真数据', res)
          this.users = res.users
          // 假数据
          // this.users = [
          //   {
          //     'check_user': 'paopao',
          //     'check_num': 12,
          //     'total_num': 120,
          //     'error_num': 6,
          //     'already_num': 12
          //   },
          //   {
          //     'check_user': 'wangwei',
          //     'check_num': 6,
          //     'total_num': 58,
          //     'error_num': 2,
          //     'already_num': 5
          //   }
          // ]

          // this.data.forEach(item => {
          //   item.create_time = this.getTime(item.create_time)
          // })
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
  .c-home{
    cursor: pointer;
  }
  .c-home:hover{
    color:#65ae7e;
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
