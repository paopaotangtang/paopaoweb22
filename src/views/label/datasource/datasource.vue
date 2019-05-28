
<template>
  <div>
    <div class="c-bread">
      <span>数据源</span><a-button type="primary" class="c-create" @click="showModal">新建数据源</a-button>
    </div>
    <div class="c-table">
      <a-table :columns="columns" :dataSource="data" :rowKey="item => item.id" v-if="data.length"
               :pagination="pagination"
               @change="handleTableChange">
        <span slot="source_name" >source_name</span>
        <span slot="label_type" >label_type</span>
        <span slot="count" >count</span>
        <span slot="create_time" >create_time</span>
        <span slot="action" slot-scope="text,record"   @click="look(record.id,1)" >
           <a-button type="primary">查看图片</a-button>
        </span>
      </a-table>
      <div  v-else style="padding: 20px;">暂无数据源信息</div>
    </div>
    <a-modal
      title="数据源图片"
      v-model="imgVisible"
      width="800px"
      :footer="null"
    >
     <div class="c-modal-content">
       <a-icon class="c-icon-l" theme="filled" type="left-circle" @click="look(sourceId,2)"/>
       <img v-if="imgSrc" :src="imgSrc" ondragstart="window.event.returnValue=false;return false;" >
       <p v-if="imgNone" style="line-height: 500px;">已经没有了！</p>
       <a-icon class="c-icon-r" theme="filled" type="right-circle"  @click="look(sourceId,3)"/>
     </div>
    </a-modal>

    <a-modal
      title="新建数据源"
      width="600px"
      :visible="visible"
      @ok="handleOk"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
      okText="确认"
      cancelText="取消"
      :maskClosable="false"
    >
      <div class="c-flex">
        <span class="c-title">数据源名称：</span><a-input placeholder="请输入数据源名称" v-model="sourceName"/>
      </div>
      <div class="c-flex">
        <span class="c-title">图像分类：</span>
        <a-dropdown style="width: 200px;" :trigger="['click']">
        <a-menu slot="overlay" overlayClassName="c-menu" @click="handleButtonClick">
          <a-menu-item key="1" class="c-item" title="人脸质量标注">人脸质量标注</a-menu-item>
          <a-menu-item key="2" class="c-item" title="人车混合">人车混合</a-menu-item>
        </a-menu>
        <a-button>
          {{labelType}}<a-icon type="down" />
        </a-button>
      </a-dropdown>
      </div>
      <div class="c-flex">
        <span class="c-title">数据源地址：</span><a-input placeholder="请输入数据源地址" v-model="fileUrl"/>
      </div>
    </a-modal>
  </div>

</template>

<script>
var columns = [{
  title: '数据源名称',
  dataIndex: 'source_name'
}, {
  title: '类型',
  dataIndex: 'label_type'
}, {
  title: '图片数量',
  dataIndex: 'count'
}, {
  title: '创建时间',
  dataIndex: 'create_time'
}, {
  title: '操作',
  dataIndex: 'action',
  scopedSlots: { customRender: 'action' }
}]

export default {
  name: 'datasource',
  data () {
    return {
      pagination: {
        current: 1,
        pageSize: 10
      },
      data: [],
      columns: columns,
      sourceName: '', // 新建数据源名
      labelType: '人脸质量标注',
      labelTypeId: 1,
      fileUrl: '',
      checked: true,
      visible: false,
      confirmLoading: false,
      imgVisible: false,
      imgSrc: '',
      imgType: 1,
      imgId: -1,
      sourceId: -1,
      imgNone: false
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
    look (sourceId, imgType) {
      if (!this.imgVisible) {
        this.imgVisible = true
      }
      this.sourceId = sourceId
      this.imgType = imgType
      let params = {
        type: 'post',
        url: this.baseUrl + '/view_source_image',
        data: {
          'source_id': this.sourceId,
          'source_img_type': this.imgType,
          'source_image_id': this.imgId
        },
        success: (res) => {
          console.log('图片', res)
          if (res.msg) {
            this.imgSrc = ''
            this.imgNone = true
          } else {
            this.imgNone = false
            this.sourceId = res.source_id
            this.imgId = res.source_image_id
            this.imgSrc = res.image_url
          }
        },
        error: function (err) {
          this.$error({
            title: '失败',
            content: err
          })
          console.log('error!', err)
        }
      }
      this.sendAjax(params)
    },
    initModal () {
      this.sourceName = ''
      this.labelType = '人脸质量标注'
      this.labelTypeId = 1
      this.fileUrl = ''
    },
    getData (e) {
      let params = {
        url: this.baseUrl + '/source',
        data: {
          'page': this.pagination.current,
          'pagerows': this.pagination.pageSize
        },
        success: (res) => {
          console.log('这里是返回的真数据', res)
          // 假数据
          this.pagination.total = res.total
          this.data = res.sources
          this.data.forEach(item => {
            item.create_time = this.getTime(item.create_time)
          })
        },
        error: function (err) {
          this.$error({
            title: '创建失败',
            content: err
          })
          console.log('error!', err)
        }
      }
      this.sendAjax(params)
    },
    showModal () {
      this.initModal()
      this.visible = true
      this.confirmLoading = false
    },
    handleOk (e) {
      if (!this.sourceName) {
        this.$warning({
          title: '数据源名称不能为空',
          content: '请填写数据源名称',
          maskClosable: true
        })
        return
      } else if (!this.fileUrl) {
        this.$warning({
          title: '数据源地址不能为空',
          content: '请填写数据源地址',
          maskClosable: true
        })
        return
      }
      this.confirmLoading = true
      let params = {
        type: 'POST',
        url: this.baseUrl + '/add_source',
        data: {
          'source_name': this.sourceName,
          'label_type_id': this.labelTypeId,
          'file_url': this.fileUrl
        },
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
      }
      this.sendAjax(params)
    },
    handleCancel (e) {
      console.log('Clicked cancel button')
      this.visible = false
      this.confirmLoading = false
    },
    getTime (timestamp) {
      let time = new Date(timestamp * 1000)
      let y = time.getFullYear()
      let m = time.getMonth() + 1
      let d = time.getDate()
      return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d)
    },
    handleButtonClick (e) { // 修改数据类型
      this.labelType = e.item.title // 修改类型的显示
      this.labelTypeId = e.key
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
  .c-flex{
   margin-bottom: 10px;
  }
  .ant-input{
    width: 80%;
  }
  .c-title{
    display: inline-block;
    width: 20%;
  }
  .c-menu{
    width: 200px;
  }
  .c-item{
    display: block;
  }
  .c-modal-content{
    width: 100%;
    height: 600px;
    overflow: auto;
    text-align: center;
  }
  .c-modal-content img{
    height: 600px;
  }
  .c-icon-l{
    position: absolute;
    top: 350px;

    left: 0;
    font-size: 60px;
    cursor: pointer;

  }
  .c-icon-r{
    position: absolute;
    top: 350px;
    right: 0;
    font-size: 60px;
    cursor: pointer;

  }
</style>
