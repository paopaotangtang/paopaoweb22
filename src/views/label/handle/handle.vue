<template>
  <div>
    <a-date-picker @change="onChange" />
    <a-button type="primary"  @click="generate()" :loading="loading">生成质检任务</a-button>
  </div>

</template>

<script>
export default {
  name: 'handle',
  data () {
    return {
      loading: false,
      date: ''
    }
  },
  methods: {
    onChange (date, dateString) {
      console.log(date, dateString)
      this.date = dateString
    },
    generate () {
      if (this.date == '') {
        this.$warning({
          title: '日期不能为空',
          content: '请选择日期',
          maskClosable: true
        })
        return
      }
      this.loading = true
      let params = {
        type: 'POST',
        url: this.baseUrl + '/generate_quality_check',
        data: {
          'date': this.date
        },
        success: (res) => {
          console.log(res)
          this.loading = false
        },
        error: (err) => {
          console.log('error!', err)
          this.loading = false
        }
      }
      this.sendAjax(params)
    }
  }
}
</script>

<style scoped>

</style>
