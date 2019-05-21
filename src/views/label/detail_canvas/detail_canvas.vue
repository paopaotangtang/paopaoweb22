<template>
    <div class="wrap">
      <div class="left">
        <div class="c-done">
          <span id='mk_del'>删除（del/D）</span>
          <span id='mk_drag'>拖拽（Space）</span>
          <span  id="coor" class="c-span-active" @click="toggleXY(this)">坐标线（X）</span>
          <span >废弃</span>
          <span>退出标注</span>
        </div>
        <div class="main-content" id="cvs_cont">
          <canvas class="cvs_ct" id="canvas" width="890" height="757">不支持canvas，请更换火狐或者谷歌浏览器使用</canvas>
        </div>
        <div class="wrap-bottom">
          <div class="left-bottom">
            历史记录：
            <a-button type="primary"  @click="getDetail(2)" :loading="lastLoading" >上一张</a-button>
            <a-button type="primary"  @click="getDetail(3)" :loading="nextLoading">下一张</a-button>
            <a-button type="primary"  v-if="detail_type!==1" @click="modifyDetail()" :loading="modifyLoading">确认修改</a-button>
          </div>
          <div>
            <a-button type="primary"  @click="saveData(1)" :loading="saveLoading">新的一张</a-button>
          </div>
        </div>
      </div>

      <div class="right">
        <table class="c-table" border="1">
          <tr>
            <th width="20%">属性名</th>
            <th width="80%">属性值</th>
          </tr>
          <tr v-for="item in props" :key="item.prop_id" :item="item" >
            <td>{{item.prop_name}}</td>
            <td class="c-left-td">
              <a-radio-group  v-if="item.prop_type==1"
                              @change="onchange(item.prop_id)"
                              :value="parseInt(item.prop_option_value)"
                              buttonStyle="solid"
                              size="large">
                <a-radio-button v-for="option in item.property_values" :key="option.option_value" :value="option.option_value"
                                :disabled="qualityInspection==-1?true:false"
                                :class="item.prop_option_value!=item.prop_option_value_final&&option.option_value==item.prop_option_value_final?'red':''"
                >{{option.option_name}}</a-radio-button>
              </a-radio-group>
              <a-input v-if="item.prop_type==2" @change="onInput(item.prop_id)"   :placeholder="item.prop_option_value" :value="item.prop_option_value"/>
            </td>
          </tr>
        </table>
      </div>
    </div>
</template>
<script>

export default {
  name: 'detail_canvas',
  data () {
    return {
      task_id: this.$route.query.task_id,
      photo_path: '',
      task_detail_id: -1,
      props: [], // 传来的并传回去
      openSpace: false,
      classActive: 'c-span-active',
      detail_type: 1,
      modifyLoading: false,
      lastLoading: false,
      nextLoading: false,
      saveLoading: false,
      isMove: false,
      isDown: false,
      qualityInspection: 0
    }
  },
  beforeMount () {
    // 进入页面detail_type ==1,相当于新的一张
    this.getDetail(1)
  },
  mounted () {
  // 获取画布和画笔对象。
  // 先不加双缓存，如果有性能问题再考虑双缓存画布的结构
    var cvs = $('#canvas')[0]
    var ctx = cvs.getContext('2d')
    // 画布的宽高
    var wd = cvs.offsetWidth
    var ht = cvs.offsetHeight

    // 保存图片的原始宽高数据
    var origin_w = null
    var origin_h = null
    var scale = 1 // 放大比例
    var trans_x = 0 // x轴相对于scale=1时的移动量，
    var trans_y = 0// y轴相对于scale=1时的移动量
    var opt = false// 是否操作启用
    // 加载图片
    var img = new Image()
    console.log(93,this.photo_path)
    // img.src = '/sorting/upload/getLocalPic.do?pathFile=/home/lifeng/sortingFile/kunshan_20190305/0192/6a54f030-3c1c-11e9-9535-e8611f275834.jpg'
    img.src = this.photo_path
    console.log(img.src)
    // 图片加载完成后，获取图片的原始宽高属性
    img.onload = function () {
      origin_w = img.width
      origin_h = img.height
      wd = cvs.offsetWidth
      ht = cvs.offsetHeight
      console.log(wd,ht)
      var w_scale = 1
      var h_scale = 1
      if (origin_w > wd) {
        w_scale = wd * 0.9 / origin_w
      }
      if (origin_h > ht) {
        h_scale = ht * 0.9 / origin_h
      }
      var min = Math.min(w_scale, h_scale)
      scale = Math.min(min, scale)
      bindEvent()
      setTimeout(function () {
        // renderByData();
        startRender()
      }, 0)
    }

    var ding_png = new Image()
    ding_png.src = '/sorting/image/dingding.jpg'
    ding_png.onload = function () {

    }
    // 用来保存图片，标注等的位置大小数据
    var datas = {
      markup: [// 用来存放标注的数据。
      ],
      polygon: [

      ]
    }

    // 保存不同标注的颜色值
    var colors = {
      man: 'yellow',
      car: 'blue',
      bycycle: 'green'
    }

    // 回显数据
    // var kjson = JSON.parse($('#kuang').text())
    // var pjson = JSON.parse($('#duo').text())

    // if (kjson.length > 0) {
    //   for (var i = 0; i < kjson.length; i++) {
    //     var tmp = kjson[i]
    //     var mark = {id: tmp.id, sx: tmp.x, sy: tmp.y, wd: tmp.width, ht: tmp.height, ding: tmp.ding}
    //     switch (tmp.type) {
    //       case '2':mark.color = colors.man; break
    //       case '3':mark.color = colors.car; break
    //       case '4':mark.color = colors.bycycle; break
    //     }
    //     mark.ding = mark.ding
    //     datas.markup.push(mark)
    //   }
    // }

    // if (pjson.length > 0) {
    //   for (var i = 0; i < pjson.length; i++) {
    //     var tmp = pjson[i]
    //     var poly = {cp: true, points: []}
    //     tmp.zuoBiao = JSON.parse(tmp.zuoBiao)
    //     for (var k = 0; k < tmp.zuoBiao.length; k++) {
    //       var parr = tmp.zuoBiao[k]
    //       var pt = {x: parr[0], y: parr[1]}
    //       poly.points.push(pt)
    //     }
    //     poly.ding = tmp.ding
    //     datas.polygon.push(poly)
    //   }
    // }

    // 获取传输标注数据
    function RectPost () {
      var arr = []
      for (var i = 0; i < datas.markup.length; i++) {
        var tmp = datas.markup[i]
        var pt = {x: tmp.sx, y: tmp.sy, height: tmp.ht, width: tmp.wd, index: i}
        switch (tmp.color) {
          case colors.man:pt.type = '2'; break
          case colors.car:pt.type = '3'; break
          case colors.bycycle:pt.type = '4'; break
        }
        arr.push(pt)
      }
      return arr
    }

    // 获取传输多边形数据
    function PolygonPost () {
      var arr = []
      for (var i = 0; i < datas.polygon.length; i++) {
        var tmp = datas.polygon[i]
        var pt = {zuoBiao: [], group: 'poly' + i}
        if (tmp.points.length <= 2) {
          continue
        }
        for (var k = 0; k < tmp.points.length; k++) {
          var ppt = tmp.points[k]
          pt.zuoBiao.push([ppt.x, ppt.y])
        }
        arr.push(pt)
      }
      return arr
    }

    // 保存可操作的状态
    var stats = {
      move: false,
      del: false,
      ding: false,
      line: false,
      man: true,
      car: false,
      bycycle: false
    }

    // var fsize = 14
    var coor = true
    var coor_x = 0
    var coor_y = 0
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
    // 根据data数据渲染画布
    function renderByData () {
      $(cvs).attr('width', $('#cvs_cont').width())
      $(cvs).attr('height', $('#cvs_cont').height())
      wd = $(cvs).width()
      ht = $(cvs).height()
      // 首先清空画布
      ctx.clearRect(0, 0, wd, ht)
      // 绘制图片
      var img_left = (wd - (origin_w) * scale) / 2 + trans_x * scale
      var img_top = (ht - (origin_h) * scale) / 2 + trans_y * scale
      var img_w = origin_w * scale
      var img_h = origin_h * scale
      ctx.drawImage(img, img_left, img_top, img_w, img_h)
      // 根据data里面的数据绘制标注。
      if (datas.markup.length > 0) {
        for (var i = 0; i < datas.markup.length; i++) {
          ctx.beginPath()
          var mup = datas.markup[i]
          ctx.strokeStyle = mup.color
          ctx.fontSize = '12px'
          ctx.lineWidth = '3'
          if (mup.sx != undefined && mup.sy != undefined && mup.wd != undefined && mup.ht != undefined) {
            var xx = mup.sx
            var yy = mup.sy
            if ((mup.ex && mup.ex < mup.sx) || (mup.ey && mup.ey < mup.sy)) {
              xx = mup.ex
              yy = mup.ey
            }
            var cx = xx * scale + img_left
            var cy = yy * scale + img_top
            var cwd = mup.wd * scale
            var cht = mup.ht * scale
            ctx.strokeRect(cx, cy, cwd, cht)
            var txt = (mup.wd) + '*' + (mup.ht)
            ctx.lineWidth = '1'
            ctx.strokeText(txt, cx + cwd - ctx.measureText(txt).width - 4, cy + 12)
            if (mup.ding) {
              ctx.drawImage(ding_png, cx + 4, cy + 4, 20, 20)
            }
          }
        }
      }

      // 根据data里面的数据渲染多边形
      if (datas.polygon.length > 0) {
        for (var i = 0; i < datas.polygon.length; i++) {
          var poly = datas.polygon[i]
          ctx.beginPath()
          ctx.strokeStyle = 'red'
          ctx.strokeWidth = '5px'
          for (var j = 0; j < poly.points.length; j++) {
            var point = poly.points[j]
            let cx = point.x * scale + img_left
            let cy = point.y * scale + img_top
            if (j == 0) {
              ctx.moveTo(cx, cy)
            } else {
              ctx.lineTo(cx, cy)
            }
          }
          if (poly.cp) {
            ctx.closePath()
          }
          ctx.stroke()
          if (poly.ding) {
            var first = poly.points[0]
            let cx = first.x * scale + img_left
            let cy = first.y * scale + img_top
            ctx.drawImage(ding_png, cx - 10, cy - 10, 20, 20)
          }
        }
      }
      // 绘制十字架
      if (coor) {
        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = '#F77C05'
        ctx.moveTo(coor_x, 0)
        ctx.lineTo(coor_x, ht)
        ctx.moveTo(0, coor_y)
        ctx.lineTo(wd, coor_y)
        ctx.stroke()
        ctx.restore()
      }

      requestAnimationFrame(renderByData)
    }

    function startRender () {
      requestAnimationFrame(renderByData)
    }

    // 判断一个点是否在多边形中
    function isInPolygon (p, poly) {
      let px = p.x,
        py = p.y,
        flag = false

      for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
        let sx = poly[i].x,
          sy = poly[i].y,
          tx = poly[j].x,
          ty = poly[j].y

        // 点与多边形顶点重合
        if ((sx === px && sy === py) || (tx === px && ty === py)) {
          return 'on'
        }

        // 判断线段两端点是否在射线两侧
        if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
          // 线段上与射线 Y 坐标相同的点的 X 坐标
          var x = sx - (-(py - sy) * (tx - sx) / (ty - sy))

          // 点在多边形的边上
          if (x === px) {
            return 'on'
          }

          // 射线穿过多边形的边界
          if (x > px) {
            flag = !flag
          }
        }
      }

      // 射线穿过多边形边界的次数为奇数时点在多边形内
      // return flag ? 'in' : 'out'
      return flag
    }

    // 给画布添加上一些操作事件
    function bindEvent () {
      // 鼠标的滚轮事件兼容
      var wheelname = navigator.userAgent.indexOf('Firefox') > 0 ? 'DOMMouseScroll' : 'mousewheel'
      cvs.addEventListener(wheelname, function (evt) {
        evt.preventDefault()
        var countV = 0
        if (evt.wheelDelta) {
          countV = Math.floor(evt.wheelDelta / 120)
        } else if (evt.detail) {
          countV = -Math.floor(evt.detail / 3)
        }
        // 改变缩放比例
        scale += countV * 0.1
        if (scale < 0.1) {
          scale = 0.1
        }
        // 调用渲染函数
        // renderByData();
      })

      var ismove = false// 是否在拖拽状态中，
      var mv_x = 0
      var mv_y = 0// 拖拽的起始位置记录。
      var tmp_transx = 0
      var tmp_transy = 0// 用来保存开始时的偏移位置量，move过程中都以此偏移量为参照进行运算。
      // 绑定拖拽事件，拖拽事件要看是否处于可拖拽状态
      cvs.addEventListener('mousedown', function (evt) {
        if (!stats.move) {
          return
        }
        evt.preventDefault()
        mv_x = evt.clientX
        mv_y = evt.clientY
        ismove = true
        tmp_transx = trans_x
        tmp_transy = trans_y
      })
      cvs.addEventListener('mousemove', function (evt) {
        if (!stats.move || !ismove) {
          return
        }
        var tmp_x = evt.clientX
        var tmp_y = evt.clientY
        trans_x = tmp_transx + ((tmp_x - mv_x) / scale)
        trans_y = tmp_transy + ((tmp_y - mv_y) / scale)
        // renderByData();
      })
      cvs.addEventListener('mouseup', function (evt) {
        if (stats.move) {
          ismove = false
        }
      })

      var mk_x = 0
      var mk_y = 0 // 人车标注时的位置
      var mk_ex = 0
      var mk_ey = 0
      var mk_down = false// 人车标注开始时的标志。
      var uid = null// 每次标注都有一个唯一id
      var mk_dt = null
      var img_left = 0 // 计算保存图片左上角的位置，因为标注的保存位置是相对于图片左上角的。
      var img_top = 0
      var mk_move = false
      // 绑定人、车、非机动车的标注事件
      cvs.addEventListener('mousedown', function (evt) {
        if (!opt && (stats.man || stats.car || stats.bycycle)) {
          var color = ''
          if (stats.man) { color = colors.man }
          if (stats.car) { color = colors.car }
          if (stats.bycycle) { color = colors.bycycle }
          mk_down = true
          mk_x = evt.clientX
          mk_y = evt.clientY
          var point = convertCoordtion(mk_x, mk_y)
          if (point.x < 0) {
            point.x = 0
          }
          if (point.x > origin_w) {
            point.x = origin_w
          }
          if (point.y < 0) {
            point.y = 0
          }
          if (point.y > origin_h) {
            point.y = origin_h
          }
          uid = uuId()
          mk_dt = {
            id: uid,
            color: color,
            sx: point.x,
            sy: point.y,
            point1: point
          }
          datas.markup.push(mk_dt)
          console.log(datas.markup)
          mk_move = false
        }
      })
      cvs.addEventListener('mousemove', function (evt) {
        if (mk_down) {
          mk_ex = evt.clientX
          mk_ey = evt.clientY
          var point = convertCoordtion(mk_ex, mk_ey)
          if (point.x < 0) {
            point.x = 0
          }
          if (point.x > origin_w) {
            point.x = origin_w
          }
          if (point.y < 0) {
            point.y = 0
          }
          if (point.y > origin_h) {
            point.y = origin_h
          }
          mk_dt.point2 = point
          mk_dt.sx = Math.min(mk_dt.point1.x, mk_dt.point2.x)
          mk_dt.sy = Math.min(mk_dt.point1.y, mk_dt.point2.y)
          mk_dt.wd = Math.abs(Math.floor((mk_dt.point1.x - mk_dt.point2.x)))
          mk_dt.ht = Math.abs(Math.floor((mk_dt.point1.y - mk_dt.point2.y)))
          mk_move = true

          // renderByData();
        }
      })
      document.addEventListener('mouseup', function (evt) {
        if (mk_down) {
          if (!mk_move) {
            datas.markup.pop()
            return
          }
          if (mk_dt.wd + mk_dt.sx > origin_w || mk_dt.ht + mk_dt.sy > origin_h || mk_dt.sx < 0 || mk_dt.sy < 0) {
            datas.markup.pop()
            // renderByData();
            alert('请在图片上进行标注！^_^')
          }
          if (mk_dt.wd < 20 || mk_dt.ht < 20) {
            datas.markup.pop()
            // renderByData();
            // alert("标注宽高必须大于20哦！*_*");
          }
          mk_down = false
          mk_dt = null
        }
      })

      // 删除事件的绑定
      cvs.addEventListener('click', function (evt) {
        if (!stats.del) {
          return
        }
        var x = evt.clientX
        var y = evt.clientY
        var point = convertCoordtion(x, y)
        if (datas.markup.length > 0) {
          for (var i = 0; i < datas.markup.length; i++) {
            var tmp = datas.markup[i]
            if (point.x >= tmp.sx && point.x <= tmp.sx - (-tmp.wd) && point.y >= tmp.sy && point.y <= tmp.sy - (-tmp.ht)) {
              datas.markup.splice(i, 1)
              // renderByData();
              break
            }
          }
        }
        if (datas.polygon.length > 0) {
          for (var i = 0; i < datas.polygon.length; i++) {
            var tmp = datas.polygon[i].points
            var flag = isInPolygon(point, tmp)
            if (flag) {
              datas.polygon.splice(i, 1)
              // renderByData();
              break
            }
          }
        }
      })

      var poly = {points: [], cp: false}// 存储多边形的点坐标位置。
      // 绑定标记的事件
      cvs.addEventListener('click', function (evt) {
        if (!stats.line) {
          return
        }
        var x = evt.clientX
        var y = evt.clientY
        var point = convertCoordtion(x, y)
        if (poly.points.length == 0) {
          datas.polygon.push(poly)
        }
        poly.points.push(point)
        // renderByData();
      })
      cvs.addEventListener('contextmenu', function (evt) {
        if (stats.line) {
          evt.preventDefault()
          if (poly.points.length <= 2) {
            datas.polygon.pop()
            alert('标记形状无效')
          } else {
            poly.cp = true
          }
          poly = {points: [], cp: false}
          // renderByData();
        }
      })

      // 绑定订的事件
      cvs.addEventListener('click', function (evt) {
        if (!stats.ding) {
          return
        }
        var x = evt.clientX
        var y = evt.clientY
        var point = convertCoordtion(x, y)
        if (datas.markup.length > 0) {
          for (var i = 0; i < datas.markup.length; i++) {
            var tmp = datas.markup[i]
            if (point.x > tmp.sx && point.x < tmp.sx - (-tmp.wd) && point.y > tmp.sy && point.y < tmp.sy - (-tmp.ht)) {
              tmp.ding = !tmp.ding
              toDing(tmp, 'r', tmp.ding)

              break
            }
          }
        }
        if (datas.polygon.length > 0) {
          for (var i = 0; i < datas.polygon.length; i++) {
            var tmp = datas.polygon[i]
            if (isInPolygon(point, tmp.points)) {
              tmp.ding = !tmp.ding
              toDing(tmp, 'd', tmp.ding)
            }
          }
        }
      })

      // 绑定十字架事件
      cvs.addEventListener('mousemove', function (evt) {
        var x = evt.clientX
        var y = evt.clientY
        var cvs_rect = cvs.getBoundingClientRect()
        coor_x = x - cvs_rect.left
        coor_y = y - cvs_rect.top
      })
    }

    function convertCoordtion (x, y) {
      var _left = (wd - (origin_w) * scale) / 2 + trans_x * scale
      var _top = (ht - (origin_h) * scale) / 2 + trans_y * scale

      var cvs_rect = cvs.getBoundingClientRect()
      var mk_fx = x - cvs_rect.left// 转化成相对于画布的坐标
      var mk_fy = y - cvs_rect.top

      mk_fx = mk_fx - _left// 转换成相对于图片的坐标
      mk_fy = mk_fy - _top

      mk_fx = mk_fx / scale// 去除缩放后转换的坐标
      mk_fy = mk_fy / scale
      return {x: Math.floor(mk_fx), y: Math.floor(mk_fy)}
    }

    // 改变拖拽的状态
    function triggleMove (th, key, isopt) {
      if (isopt) {
        if (isopt == '1') {
          opt = true
          $('.opitem').removeClass('c-span-active')
          for (var keys in stats) {
            if (keys != 'man' && keys != 'car' && keys != 'bycycle') {
              stats[keys] = false
            }
          }
        } else {
          if ($(th).hasClass('c-span-active')) {
            opt = false
            $(th).removeClass('c-span-active')
            stats[key] = false
            return
          } else {
            opt = true
            $('.opitem').removeClass('c-span-active')
            for (var keys in stats) {
              if (keys != 'man' && keys != 'car' && keys != 'bycycle') {
                stats[keys] = false
              }
            }
          }
        }
      } else {
        $('.mkitem').removeClass('c-span-active')
        for (var keys in stats) {
          if (keys == 'man' || keys == 'car' || keys == 'bycycle') {
            stats[keys] = false
          }
        }
      }
      $(th).addClass('c-span-active')

      stats[key] = true
       	// if(key=='move'||key=='ding'||key=='del'){
         //      cvs.style.cursor='pointer';
         //  }else{
         //      cvs.style.cursor='crosshair';
         //  }
    }

    document.addEventListener('keyup', function (evt) {
      evt.preventDefault()
      console.log('key:' + evt.keyCode)
      if (evt.keyCode == 46 || evt.keyCode == 68) {
        triggleMove($('#mk_del')[0], 'del', '2')
        return
      }
      if (evt.keyCode == 32) {
        triggleMove($('#mk_drag')[0], 'move', '2')
        return
      }
      // if (evt.keyCode == 84) {
      //   triggleMove($('#mk_ding')[0], 'ding', '2')
      //   return
      // }
      // if (evt.keyCode == 66) {
      //   triggleMove($('#mk_poly')[0], 'line', '2')
      //   return
      // }
      // if (evt.keyCode == 97 || evt.keyCode == 49) {
      //   triggleMove($('#man')[0], 'man')
      //   return
      // }
      // if (evt.keyCode == 98 || evt.keyCode == 50) {
      //   triggleMove($('#car')[0], 'car')
      //   return
      // }
      // if (evt.keyCode == 99 || evt.keyCode == 51) {
      //   triggleMove($('#bycycle')[0], 'bycycle')
      //   return
      // }
      if (evt.keyCode == 88) {
        toggleXY($('#coor')[0])
      }
    })
    function toggleXY (th) {
      if ($(th).hasClass('c-span-active')) {
        coor = false
        $(th).removeClass('c-span-active')
      } else {
        $(th).addClass('c-span-active')
        coor = true
      }
    }

    // 用来生成前端的唯一ID，
    function uuId () {
      return 'off-' + Math.floor(Math.random() * 1000) + '-' + Math.floor(Math.random() * 1000) + '-' + Math.floor(Math.random() * 1000)
    }
    window.addEventListener('resize', function () {
      // renderByData();
    })
  },
  destroyed () {
  },

  methods: {
    onchange (id) {
      console.log('change啦')
      console.log(event.target.value, id)
      this.props.forEach(item => {
        if (item.prop_id == id) {
          item.prop_option_value = parseInt(event.target.value)
          item.prop_option_value_final = parseInt(event.target.value)
        }
      })
    },
    onInput (id) {
      this.props.forEach(item => {
        if (item.prop_id == id) {
          item.prop_option_value = event.target.value
        }
      })
    },
    toggleXY (th) {
      /* eslint-disable*/
      if ($(th).hasClass('c-span-active')) {
        coor = false
        $(th).removeClass('c-span-active')
      } else {
        $(th).addClass('c-span-active')
        coor = true
      }
    },
    getDetail (detailType) {
      if (detailType == 2) {
        this.lastLoading = true
      } else if (detailType == 3) {
        this.nextLoading = true
      }
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/task/show_task_detail',
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify({
          'nickname': window.localStorage.getItem('nickname'),
          'task_id': this.task_id,
          'detail_type': detailType,
          'task_detail_id': this.task_detail_id
        }),
        success: (res) => {
          if (res.status == '该任务已结束') {
            this.$warning({
              title: '此任务已完成：',
              content: '已经没有图片了。',
              maskClosable: true
            })
            this.$router.push({path: '/label/task2'})
          } else if (res.msg) {
            this.$warning({
              title: '温馨提示：',
              content: res.msg,
              maskClosable: true
            })
          } else {
            this.photo_path = res.photo_path
            this.task_detail_id = res.task_detail_id
            this.props = res.props
            this.props = [
              {
                "prop_id": 11,
                "prop_name": "衣服",
                "prop_option_value": 1,
                "prop_option_value_final": 3,
                "prop_type": 1,
                "property_values": [
                  {
                    "option_name": "黄皮",
                    "option_value": 1
                  },
                  {
                    "option_name": "黑皮",
                    "option_value": 2
                  },
                  {
                    "option_name": "白皮",
                    "option_value": 3
                  }
                ]
              },
              {
                "prop_id": 13,
                "prop_name": "肤色",
                "prop_option_value": 2,
                "prop_option_value_final": 2,
                "prop_type": 1,
                "property_values": [
                  {
                    "option_name": "黄",
                    "option_value": 2
                  },
                  {
                    "option_name": "黑",
                    "option_value": 1
                  },
                  {
                    "option_name": "白",
                    "option_value": 3
                  }
                ]
              }
            ]
            this.detail_type = res.detail_type
          }
          this.lastLoading = false
          this.nextLoading = false
          this.saveLoading = false
        },
        error: function (err) {
          console.log('error!', err)
        }
      })
    },
    modifyDetail () {
      this.modifyLoading = true
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/task/modify_data',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'create_user': window.localStorage.getItem('nickname'),
          'group_id': window.localStorage.getItem('groupid'),
          'photo_path': this.photo_path,
          'task_id': this.task_id,
          'task_detail_id': this.task_detail_id,
          'props': this.props,
          'detail_type': this.detail_type

        }),
        success: (res) => {
          this.modifyLoading = false
          if (res.status == 'success') {
            this.$success({
              title: '修改成功：',
              content: '此数据已保存。',
              maskClosable: true
            })
          } else if (res.msg) {
            this.$warning({
              title: '温馨提示：',
              content: res.msg,
              maskClosable: true
            })
          }
        },
        error: function (err) {
          console.log('error!', err)
        }
      })
    },
    saveData (detailType) {
      this.saveLoading = true
      if (this.detail_type !== 1) {
        this.getDetail(1)
        return
      }
      $.ajax({
        type: 'POST',
        url: this.baseUrl + '/task/save_data',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'create_user': window.localStorage.getItem('nickname'),
          'group_id': window.localStorage.getItem('groupid'),
          'photo_path': this.photo_path,
          'task_id': this.task_id,
          'task_detail_id': this.task_detail_id,
          'props': this.props
        }),
        success: (res) => {
          if (res.status == 'success') {
            this.saveLoading = false
            this.getDetail(1)
          }
        },
        error: function (err) {
          console.log('error!', err)
        }
      })
    },
    initImg () {
      let wid = $('#myimg').width()
      let hei = $('#myimg').height()
      if (wid > hei) {
        $('#myimg').width('100%')
        $('#myimg').height('auto')
      } else {
        $('#myimg').width('auto')
        $('#myimg').height('100%')
      }
      $('#myimg').css({'left': '0', 'top': '0'})
    }

  }
}
</script>

<style scoped>
  label.ant-radio-wrapper{
    line-height: 50px;
  }
  .wrap{
    display: flex;
  }
  .c-table{
    width: 80%;
    margin: 0 auto 20px;
  }
  .c-table tr{
    height: 50px;
  }
  .ant-radio-group.ant-radio-group-outline.ant-radio-group-default span{
    line-height: 50px !important;
  }
  .c-left-td{
    padding: 0 20px;
    text-align: left;
  }
  .c-done{
    text-align: left;
    line-height: 50px;
    cursor: pointer;
  }
  .c-done span{
    margin-right: 20px;
  }
  .c-span-active{
    color:blue;
  }
  .main-content{
    border: 1px solid rgba(85, 85, 85, 0.33);
    width: 100%;
    height: 700px;
    margin-bottom: 10px;
    overflow:hidden;}

  .img-box{
    border: 1px solid rgba(85, 85, 85, 0.33);
    width: 100%;
    height: 800px;
    overflow: hidden;
    position: relative;
    margin-bottom: 10px;
  }
  .left{
    width: 50%;
    margin-left:50px;
  }
  .right{
    width: 50%;
  }
  #myimg{
    width: auto;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin:auto;
  }
.wrap-bottom{
  display: flex;
  justify-content: space-between;
}
  .left-bottom{
    width: 50%;
    border-right:1px solid gray;
    text-align: left;
  }
  .red{
    background: red;
    color:white;
  }
</style>
