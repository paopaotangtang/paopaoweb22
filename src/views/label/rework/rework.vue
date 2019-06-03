<template>
  <div>
    <div class="c-table">
      <a-table :columns="columns" :dataSource="reworkDatas" :rowKey="item => item.rework_id" v-if="reworkDatas.length" :pagination="false">
        <span slot="date" >date</span>
        <span slot="task_id" >task_id</span>
        <span slot="task_name" >task_name</span>
        <span slot="all_count" >all_count</span>
        <span slot="right_rate" >right_rate</span>
        <span slot="action" slot-scope="text,record">
           <a-button type="primary"  @click="toLabel(record)" >修改</a-button>
        </span>
      </a-table>
      <div  v-else style="padding: 20px;">暂无任务信息</div>
    </div>
  </div>

</template>

<script>
var columns = [{
  title: '日期',
  dataIndex: 'date'
}, {
  title: '任务id',
  dataIndex: 'task_id'
}, {
  title: '任务名',
  dataIndex: 'task_name'
}, {
  title: '全部数量',
  dataIndex: 'all_count'
}, {
  title: '正确率',
  dataIndex: 'right_rate'
}, {
  title: '操作',
  dataIndex: 'action',
  scopedSlots: { customRender: 'action' }
}]
export default {
  name: 'rework',
  data () {
    return {
      reworkDatas: [],
      columns: columns
    }
  },
  created () {
    this.getData()
  },
  methods: {
    getData (e) {
      let params = {
        type: 'post',
        url: this.baseUrl + '/rework_list',
        data: {
          'nickname': window.localStorage.getItem('nickname'),
          'group_id': window.localStorage.getItem('groupid')
        },
        success: (res) => {
          console.log('这里是返回的真数据', res)
          this.reworkDatas = res.rework_datas
        },
        error: function (err) {
          console.log('error!', err)
        }
      }
      this.sendAjax(params)
    },
    toLabel (record) {
      this.$router.push({
        path: '/label/rework_details',
        query: {
          'rework_id': record.rework_id,
          'task_id': record.task_id,
          'date': record.date}})
    }
  }
}
</script>

<style scoped>
  .c-table{
    border: 1px solid #cbcbcb;
    border-radius: 5px;
    width: 80%;
    margin: 0 auto;
    color: rgba(0, 0, 0, 0.65);
  }

</style>
