function myAjax (params) {
  var xhr = createXHR()
  // 定义xhr对象的请求响应事件
  xhr.onreadystatechange = function () {
    console.log(xhr.readyState)
    switch (xhr.readyState) {
      case 0 :
        // alert("请求未初始化");
        break
      case 1 :
        // alert("请求启动，尚未发送");
        break
      case 2 :
        // alert("请求发送，尚未得到响应");
        break
      case 3 :
        // alert("请求开始响应，收到部分数据");
        break
      case 4 :
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
          let data = xhr.responseText
          params.success(JSON.parse(data))
        } else {
          let data = xhr.responseText
          params.error(JSON.parse(data))
        }
        break
    }
  }
  xhr.open(params.method, params.url, true)
  // 不支持FormData的浏览器的处理
  // if(typeof FormData == "undefined") {
  xhr.setRequestHeader('Content-Type', 'application/json')
  // }
  console.log(params.data)
  xhr.send(JSON.stringify(params.data))
  // xhr.send(params.data)
}
/*
 * 统一XHR接口
 */
function createXHR () {
  // IE7+,Firefox, Opera, Chrome ,Safari
  if (typeof XMLHttpRequest !== 'undefined') {
    return new XMLHttpRequest()
  }
  // IE6-
  else if (typeof ActiveXObject !== 'undefined') {
    if (typeof arguments.callee.activeXString !== 'string') {
      var versions = ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0', 'MSXMLHttp'],
        i, len
      for (i = 0, len = versions.length; i < len; i++) {
        try {
          new ActiveXObject(versions[i])
          arguments.callee.activeXString = versions[i]
          break
        } catch (ex) {
          alert('请升级浏览器版本')
        }
      }
    }
    return arguments.callee.activeXString
  } else {
    throw new Error('XHR对象不可用')
  }
}
export default myAjax
