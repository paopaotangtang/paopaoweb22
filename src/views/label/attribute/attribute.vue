
<template>
  <div>
    <div class="c-bread">
      <span>属性设置</span><a-button type="primary" class="c-create" @click="showModal(1)">添加属性</a-button>
    </div>
    <div class="c-menu-table">
      <a-menu
        mode="inline"
        :openKeys="openKeys"
        @openChange="onOpenChange"
        style="width: 100%"
        v-if="allPropertyType.length"
      >
        <a-sub-menu v-for="(item1,index1) in allPropertyType" :key="item1" >
          <span slot="title"><a-icon type="deployment-unit" /><span>{{item1}}</span></span>
          <a-menu-item  class="c-item" v-for="item2 in propData[index1]" :key="item2.id">
              <span > {{item2.prop_name}}</span>
              <span>
              <a-button type="primary"  @click="showModal(2,item2.id)" >查看/修改</a-button>
              </span>
          </a-menu-item>
        </a-sub-menu>

      </a-menu>
      <div v-else style="padding: 20px;">您还未设置属性</div>
    </div>

    <a-modal
      :title="this.modalType===1?'添加属性':'属性详情'"
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
        placeholder="请输入属性名称" v-model="modalObj.propName" :disabled="modalType===1?false:true"/>
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
            <a-menu-item key="2" class="c-item" title="画框">画框</a-menu-item>
          </a-menu>
          <a-button :disabled="modalType==1?false:true">
            {{modalObj.propType==1?'单选':'画框'}}<a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <div style="height: 250px;overflow-y: auto;">

        <div class="c-card" v-for="(item,index) in modalObj.propertyValues" v-bind:key="index">
          <div class="c-flex">
            <span class="c-title">选项名称：</span><a-input placeholder="请输入属性名称" v-model="item.value_name" @change="changeValue(item)"/>
            <a-button type="danger" icon="minus" @click="deleteValue(item,index)">删除此项</a-button>
          </div>
          <div class="c-flex">
            <span class="c-title">选项值：</span><a-input placeholder="请输入选项的值"  v-model="item.value_id"/>
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

export default {
  name: 'attribute',
  data () {
    return {
      modalType: 1,
      modalObj: {
        propName: '', // 新建数据源名
        labelType: '人脸质量标注',
        labelTypeId: 1,
        propType: 1,
        propertyValues: [{
          'value_name': '', // 选项名字
          'value_id': '', // 选项id
          'localId': new Date().getTime() + 'first'
        }]
      },
      properties: [],
      propData: [],
      allPropertyType: [],
      visible: false,
      confirmLoading: false,
      openKeys: []
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
    onOpenChange (openKeys) {
      console.log(openKeys)
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1)
      if (this.allPropertyType.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    },
    initModal () {
      this.modalObj = {
        propName: '', // 新建数据源名
        labelType: '人脸质量标注',
        labelTypeId: 1,
        propType: 1,
        propertyValues: [{
          'value_name': '', // 选项名字
          'value_id': '', // 选项id
          'localId': new Date().getTime() + 'first'
        }]
      }
    },
    getProperty (e) {
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/show_property',
        dataType: 'json',
        data: {
        },
        success: (res) => {
          console.log('这里是返回的真数据', res)
          this.allPropertyType = res.all_property_type
          this.openKeys.push(this.allPropertyType[0])
          this.properties = res.properties
          this.allPropertyType.forEach(item => { // 筛选不同分类下的属性，存在数组里
            let diffData = this.properties.filter(item2 => {
              return item2.label_type_name === item
            })
            this.propData.push(diffData)
          })
          // add之后获取数据完成之后关闭loading和modal
          if (this.confirmLoading || this.visible) {
            this.confirmLoading = false
            this.visible = false
            // this.$success({
            //   title: '创建成功',
            //   content: '您已添加新属性'
            // })
            this.$forceUpdate()
            console.log('添加成功，重新赋值以后的数组', this.properties)
          }
        },
        error: function (err) {
          this.$error({
            title: '失败',
            content: err
          })
          console.log('error!', err)
        }
      })
    },
    showModal (modalType, propId) { // modalType:1创建属性2查看修改
      console.log('点击的属性的id', propId)
      this.modalType = modalType
      if (this.modalType === 1) {
        this.initModal()// 新建需要清除modal脏数据
        this.visible = true
        this.confirmLoading = false
      } else {
        this.getPropertyValue(propId)
      }
    },
    getPropertyValue (propId) {
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/show_property_value',
        dataType: 'json',
        data: {
          prop_id: propId
        },
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
          console.log('查看了record一下', this.modalObj.recordValues)
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
          content: '请填写属性名称'
        })
        return
      } else if (!this.modalObj.propertyValues.length) {
        this.$warning({
          title: '选项至少添加一项',
          content: '请填写属性选项'
        })
        return
      } else if (this.modalObj.propertyValues.some(item => { return !item.value_id || !item.value_name })) {
        // propertyValues
        this.$warning({
          title: '有的选项不完整',
          content: '请填写选项信息'
        })
        return
      }
      this.confirmLoading = true
      let modalData
      if (this.modalType === 1) { // 新建属性的参数
        modalData = {
          'prop_name': this.modalObj.propName, // 属性名
          'label_type_id': this.modalObj.labelTypeId, // 标注类型
          'prop_type': this.modalObj.propType,
          'property_value': this.modalObj.propertyValues
        }
      } else if (this.modalType === 2) { // 修改属性的参数
        modalData = {
          'prop_id': this.modalObj.propId, // 属性名
          'property_value': this.modalObj.recordValues // 记录的values
        }
      }
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/add_property',
        dataType: 'json',
        data: modalData,
        success: (res) => {
          if (res.status === 'success') {
            this.getProperty()
          }
        },
        error: function (err) {
          this.$error({
            title: '创建失败',
            content: err
          })
          console.log('error!', err)
        }
      })
    },
    handleCancel (e) {
      this.visible = false
      this.confirmLoading = false
    },
    getTime (timestamp) {
      let time = new Date(timestamp * 1000)
      console.log(111, timestamp, time)
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
      this.modalObj.propType = e.key // 修改数据类型
    },
    addValue () {
      let localId = new Date().getTime() + this.modalObj.propertyValues.length
      // 增加选项
      let newValue = {
        'value_name': '', // 选项名字
        'value_id': '', // 选项id
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
      if (this.modalObj.propertyValues.length === 1) {
        this.$warning({
          title: '删除失败',
          content: '至少有一项选项'
        })
      } else {
        // 删除选项,
        if (!item.id) { // 如果没有远程id,就是要删除新增的选项，那record里就删除
          this.modalObj.propertyValues = this.modalObj.propertyValues.filter(oldItem => oldItem.localId !== item.localId)
          if (this.modalObj.recordValues) {
            this.modalObj.recordValues = this.modalObj.recordValues.filter(recordTtem => recordTtem.localId !== item.localId)
          }
        } else { // 如果有prop_id，就是要删除已存在的选项，record里记录delete
          this.modalObj.propertyValues = this.modalObj.propertyValues.filter(oldItem => oldItem.id !== item.id)
          if (this.modalObj.recordValues) {
            this.modalObj.recordValues.forEach(recordTtem => {
              if (recordTtem.id === item.id) {
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
          if (recordTtem.id === item.id) {
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
