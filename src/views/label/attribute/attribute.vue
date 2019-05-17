
<template>
  <div>
    <div class="c-bread">
      <span>属性设置</span><a-button type="primary" class="c-create" @click="showModal(1)">添加属性</a-button>
    </div>
    <div class="c-bread">
      <span>当前类型：</span>
      <a-radio-group v-model="mode"  @change="onChange">
      <a-radio-button value="人脸质量标注">人脸质量标注</a-radio-button>
      <a-radio-button value="行人">行人</a-radio-button>
    </a-radio-group>
    </div>

      <a-table class="c-table" :columns="columns" :dataSource="currentData" v-if="currentData.length">
        <span slot="prop_name" >prop_name</span>
        <span slot="action" slot-scope="text,record" @click="showModal(2,record.id)">
           <a-button type="primary" >修改/查看</a-button>
        </span>
      </a-table>
      <div  v-else style="padding: 20px;">暂无数据</div>

    <a-modal
      :title="this.modalType==1?'添加属性':'属性详情'"
      :visible="visible"
      @ok="handleOk"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
      okText="确认"
      cancelText="取消"
      width="600px"
      :maskClosable="false"
    >
      <div class="c-flex">
        <span class="c-title">属性名称：</span><a-input
        placeholder="请输入属性名称" v-model="modalObj.propName" :disabled="modalType==1?false:true"/>
      </div>

      <div class="c-flex">
        <span class="c-title">标注类别：</span>
        <a-dropdown class="c-menu" :trigger="['click']">
          <a-menu slot="overlay" overlayClassName="c-menu" @click="labelTypeChange">
            <a-menu-item key="1" class="c-item" title="人脸质量标注">人脸质量标注</a-menu-item>
            <a-menu-item key="2" class="c-item" title="行人属性">行人属性</a-menu-item>
          </a-menu>
          <a-button :disabled="modalType==1?false:true">
            {{modalObj.labelType}}<a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <div class="c-flex">
        <span class="c-title">属性类别：</span>
        <a-dropdown class="c-menu" :trigger="['click']" >
          <a-menu slot="overlay" overlayClassName="c-menu" @click="propTypeChange">
            <a-menu-item key="1" class="c-item" title="单选">单选</a-menu-item>
            <a-menu-item key="2" class="c-item" title="文本框">文本框</a-menu-item>
          </a-menu>
          <a-button :disabled="modalType==1?false:true">
            {{modalObj.propType}}<a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <div style="height: 250px;overflow-y: auto;">

        <div class="c-card" v-for="(item,index) in modalObj.propertyValues" v-bind:key="index">
          <div class="c-flex">
            <span class="c-title">选项名称：</span><a-input placeholder="请输入选项名称" v-model="item.option_name" @change="changeValue(item)"/>
            <a-button type="danger" icon="minus" @click="deleteValue(item,index)">删除此项</a-button>
          </div>
          <div class="c-flex">
            <span class="c-title">选项值：</span><a-input placeholder="请输入选项的值"  v-model="item.option_value"/>
          </div>
        </div>
        <div style="text-align: center;padding: 10px 0;">
          <a-button type="primary" icon="plus" @click="addValue" >添加选项</a-button>
        </div>

      </div>

    </a-modal>

  </div>

</template>

<script>
var columns = [{
  title: '属性名称',
  dataIndex: 'prop_name'
}, {
  title: '操作',
  dataIndex: 'action',
  scopedSlots: { customRender: 'action' },
  width: '25%'
}]
export default {
  name: 'attribute',
  data () {
    return {
      mode: '人脸质量标注',
      modalType: 1,
      columns,
      modalObj: {
        propName: '', // 新建数据源名
        labelType: '人脸质量标注',
        labelTypeId: 1,
        propType: '单选',
        propTypeId: 1,
        propertyValues: [{
          'option_name': '未知', // 选项名字
          'option_value': '0', // 选项id
          'localId': new Date().getTime() + 'first'
        }]
      },
      properties: [],
      propData: [],
      currentData: [],
      visible: false,
      confirmLoading: false
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  beforeMount () {
    this.getProperty()
  },
  mounted () {
  },
  methods: {
    onChange (e) {
      this.currentData = this.properties.filter(item => {
        return item.label_type_name == this.mode
      })
    },
    initModal () {
      this.modalObj = {
        propName: '', // 新建数据源名
        labelType: '人脸质量标注',
        labelTypeId: 1,
        propType: '单选',
        propTypeId: 1,
        propertyValues: [{
          'option_name': '未知', // 选项名字
          'option_value': '0', // 选项id
          'localId': new Date().getTime() + 'first'
        }]
      }
    },
    getProperty (e) {
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/show_property',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({}),
        success: (res) => {
          this.properties = res.properties
          this.onChange()
          // console.log('properties', res.properties)
          // add之后获取数据完成之后关闭loading和modal
          if (this.confirmLoading || this.visible) {
            this.confirmLoading = false
            this.visible = false
            // this.$success({
            //   title: '创建成功',
            //   content: '您已添加新属性'
            // })
          }
        },
        error: function (err) {
          // this.$error({
          //   title: '失败',
          //   content: err
          // })
          console.log('error!', err)
        }
      })
    },
    showModal (modalType, recordId) { // modalType:1创建属性2查看修改
      this.modalType = modalType
      if (this.modalType == 1) {
        this.initModal()// 新建需要清除modal脏数据
        this.visible = true
        this.confirmLoading = false
      } else {
        this.getPropertyValue(recordId)
      }
    },
    getPropertyValue (propId) {
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/show_property_value',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          prop_id: propId
        }),
        success: (res) => {
          this.modalObj = {
            propName: res.prop_name,
            labelType: res.label_type,
            propType: res.prop_type,
            propertyValues: res.property_values,
            recordValues: res.property_values.concat(),
            propId: res.prop_id
          }
          this.visible = true
        },
        error: function (err) {
          console.log('error!', err)
        }
      })
    },
    handleOk (e) {
      if (!this.modalObj.propName) {
        this.$warning({
          title: '属性名称不能为空',
          content: '请填写属性名称',
          maskClosable: true
        })
        return
      } else if (!this.modalObj.propertyValues.length) {
        this.$warning({
          title: '选项至少添加一项',
          content: '请填写属性选项',
          maskClosable: true
        })
        return
      } else if (this.modalObj.propertyValues.some(item => { return !item.option_value || !item.option_name })) {
        // propertyValues
        this.$warning({
          title: '有的选项不完整',
          content: '请填写选项信息',
          maskClosable: true
        })
        return
      }
      this.confirmLoading = true
      let modalData
      console.log('看这里', this.modalObj)
      if (this.modalType == 1) { // 新建属性的参数
        modalData = {
          'prop_name': this.modalObj.propName, // 属性名
          'label_type_id': this.modalObj.labelTypeId, // 标注类型
          'prop_type': this.modalObj.propTypeId,
          'property_value': this.modalObj.propertyValues
        }
      } else if (this.modalType == 2) { // 修改属性的参数
        modalData = {
          'prop_id': this.modalObj.propId, // 属性名
          'property_value': this.modalObj.recordValues // 记录的values
        }
      }
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/add_property',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(modalData),
        success: (res) => {
          if (res.status == 'success') {
            this.getProperty()
          }
        },
        error: (err) => {
          this.$error({
            title: '创建失败',
            content: err.statusText
          })
        }
      })
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
      console.log(y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d))
      return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d)
    },
    labelTypeChange (e) { // 修改标注类别labeltype
      this.modalObj.labelType = e.item.title// 修改数据类型
      this.modalObj.labelTypeId = e.key
    },
    propTypeChange (e) { // 修改属性类别
      // console.log('proptypr',e)
      this.modalObj.propType = e.item.title // 修改数据类型
      this.modalObj.propTypeId = e.key
      console.log('选择了proptype:', this.modalObj.propTypeId)
    },
    addValue () {
      let localId = new Date().getTime() + this.modalObj.propertyValues.length
      // 增加选项
      let newValue = {
        'option_name': '', // 选项名字
        'option_value': '', // 选项id
        'localId': localId
      }
      this.modalObj.propertyValues.push(newValue)
      if (this.modalObj.recordValues) {
        this.modalObj.recordValues.push(newValue)
      }
      console.log(this.propertyValues, this.modalObj.recordValues)
    },

    deleteValue (item, index) {
      console.log(item, index, this.propertyValues)
      if (this.modalObj.propertyValues.length == 1) {
        this.$warning({
          title: '删除失败',
          content: '至少有一项选项',
          maskClosable: true
        })
      } else {
        // 删除选项,
        if (!item.option_id) { // 如果没有远程option_id,就是要删除新增的选项，那record里就删除
          this.modalObj.propertyValues = this.modalObj.propertyValues.filter(oldItem => oldItem.localId !== item.localId)
          if (this.modalObj.recordValues) {
            this.modalObj.recordValues = this.modalObj.recordValues.filter(recordTtem => recordTtem.localId !== item.localId)
          }
        } else { // 如果有option_id，就是要删除已存在的选项，record里记录delete
          this.modalObj.propertyValues = this.modalObj.propertyValues.filter(oldItem => oldItem.option_id !== item.option_id)
          if (this.modalObj.recordValues) {
            this.modalObj.recordValues.forEach(recordTtem => {
              if (recordTtem.option_id == item.option_id) {
                recordTtem['delete'] = 1
                console.log('test')
              }
            })
          }
        }
      }
    },
    changeValue (item) {
      if (this.modalObj.recordValues) {
        this.modalObj.recordValues.map(recordTtem => {
          if (recordTtem.option_id == item.option_id) {
            recordTtem = item
          }
        })
      }
    }

  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .c-menu-table{
    border: 1px solid paleturquoise;
    border-radius: 5px;
    width: 80%;
    margin: 0 auto;
    color: rgba(0, 0, 0, 0.65);
  }
  .c-menu-table li{
    width: 100%;
    text-align: left;
  }
  .c-table{
    border: 1px solid #cbcbcb;
    width: 80%;
    margin: 0 auto;
  }

  .c-bread{
    padding: 0 10%;
    font-size: 22px;
    line-height: 60px;
    text-align: left;
  }
  .c-item{
    display: flex;
    justify-content: space-between;
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
  .c-card{
    border-bottom: 1px solid silver;
    padding:20px 0;
  }

  .c-card .ant-input{
    width: 50%;
  }
</style>
