<template>
    <div class="wrap">
      <div class="left">
        <div class="c-done">
          <span>删除（del/D）</span>
          <span :class="openSpace? 'c-span-active': ''">拖拽（Space）</span>
          <span>坐标线（X）</span>
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
                <a-radio-button v-for="option in item.property_values" :key="option.option_value" :value="option.option_value">{{option.option_name}}</a-radio-button>
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
      isDown: false
    }
  },
  beforeMount () {
    // 进入页面detail_type ==1,相当于新的一张
    this.getDetail(1)
  },
  mounted () {
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
    var trans_y = 0 // y轴相对于scale=1时的移动量
    var opt = false// 是否操作启用
    // 加载图片
    var img = new Image()
    img.src = this.photo_path
    // 图片加载完成后，获取图片的原始宽高属性
    img.onload = function () {
      origin_w = img.width
      origin_h = img.height
      wd = cvs.offsetWidth
      ht = cvs.offsetHeight
      var w_scale = 1
      var h_scale = 1
      if (origin_w > wd) {
        w_scale = wd / origin_w
      }
      if (origin_h > ht) {
        h_scale = ht / origin_h
      }
      var min = Math.min(w_scale, h_scale)
      scale = Math.min(min, scale)
      bindEvent()
      setTimeout(function () {
        startRender()
      }, 0)
    }

    var ding_png = new Image()
    ding_png.src = this.photo_path
    ding_png.onload = function () {}
    // 用来保存图片，标注等的位置大小数据
    var datas = {
      markup: [// 用来存放标注的数据。
      ],
      arrows: [

      ]
    }
    // 保存不同标注的颜色值
    var colors = {
      man: 'yellow',
      car: 'blue',
      bycycle: 'green'
    }

    // 保存可操作的状态
    var stats = {
      move: false,
      del: false,
      ding: false,
      rect: false,
      arrow: false
    }

    var r_color = null
    var r_type = null
    function openRect (type, color) {
      stats.rect = true
      r_type = type
      r_color = color
      stats.arrow = false
      $('#carrow').removeAttr('checked')
    }
    var ar_type
    function openArrow (th, type) {
      stats.rect = false
      $('.kuang').removeAttr('checked')
      if (th.checked) {
        ar_type = type
        stats.arrow = true
      } else {
        stats.arrow = false
      }
    }
    // 展现不动的矩形框
    var realStr = '978,982,111,98'// 标注员标注的区域
    var expandRect = '867,933,333,147'// 外扩之后的区域
    var brect = null
    if (expandRect.length > 0) {
      var expandRectArr = expandRect.split(',')
      brect = {x: expandRectArr[0], y: expandRectArr[1], width: expandRectArr[2], height: expandRectArr[3]}
    }
    var crect = null
    var img_left = null
    var img_top = null

    var realRect = null
    var arr = realStr.split(',')
    if (arr.length > 0) {
      realRect = {x: arr[0], y: arr[1], width: arr[2], height: arr[3]}
    }
    // 计算展现矩形以及初始偏移量，放大系数
    function calcWin (ctx) {
      $(cvs).attr('width', $('#cvs_cont').width())
      $(cvs).attr('height', $('#cvs_cont').height())
      wd = $(cvs).width()
      ht = $(cvs).height()
      var hor_scale = wd / brect.width
      var ver_scale = ht / brect.height
      var bscale = Math.min(hor_scale, ver_scale)
      scale = bscale
      img_left = (wd - (origin_w) * scale) / 2 + trans_x * scale
      img_top = (ht - (origin_h) * scale) / 2 + trans_y * scale
      var bx = brect.x * scale + img_left
      var by = brect.y * scale + img_top
      var bwd = brect.width * scale
      var bht = brect.height * scale
      var want_x = (wd - bwd) / 2
      var want_y = (ht - bht) / 2
      trans_x = (want_x - bx) / scale
      trans_y = (want_y - by) / scale
      crect = {x: want_x, y: want_y, width: bwd, height: bht}
      img_left = (wd - (origin_w) * scale) / 2 + trans_x * scale
      img_top = (ht - (origin_h) * scale) / 2 + trans_y * scale
    }

    var coor = true
    var coor_x = 0
    var coor_y = 0
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

    // 根据data数据渲染画布
    function renderByData () {
      $(cvs).attr('width', $('#cvs_cont').width())
      $(cvs).attr('height', $('#cvs yyyy_cont').height())
      wd = $(cvs).width()
      ht = $(cvs).height()
      // 首先清空画布
      ctx.clearRect(0, 0, wd, ht)
      img_left = (wd - (origin_w) * scale) / 2 + trans_x * scale
      img_top = (ht - (origin_h) * scale) / 2 + trans_y * scale
      // 计算矩形框的位置以及画布的初始偏移量
      if (!crect) {
        /* var bx=brect.x*scale+img_left;
            var by=brect.y*scale+img_top;
            var bwd=brect.width*scale;
            var bht=brect.height*scale;
            var want_x=(wd-bwd)/2;
            var want_y=(ht-bht)/2;
            trans_x=want_x-bx;
            trans_y=want_y-by;
            crect={x:want_x,y:want_y,width:bwd,height:bht};
            img_left=(wd-(origin_w)*scale)/2+trans_x*scale;
            img_top=(ht-(origin_h)*scale)/2+trans_y*scale; */
        calcWin(ctx)
      }
      // 绘制图片
      var img_w = origin_w * scale
      var img_h = origin_h * scale
      ctx.drawImage(img, img_left, img_top, img_w, img_h)

      if (realRect) {
        var rx = realRect.x * scale + img_left
        var ry = realRect.y * scale + img_top
        var rwd = realRect.width * scale
        var rht = realRect.height * scale
        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = '#D1D30A'
        ctx.setLineDash([15, 7])
        ctx.lineWidth = '3'
        ctx.strokeRect(rx, ry, rwd, rht)
        ctx.closePath()
        ctx.restore()
      }

      // 根据data里面的数据绘制标注。
      if (datas.markup.length > 0) {
        for (var i = 0; i < datas.markup.length; i++) {
          ctx.beginPath()
          var mup = datas.markup[i]
          ctx.strokeStyle = mup.color
          ctx.fontSize = '12px'
          ctx.lineWidth = '3'
          if (mup.sx && mup.sy && mup.wd && mup.ht) {
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
      ctx.fillStyle = '#505050'
      ctx.fillRect(0, 0, wd, crect.y)
      ctx.fillRect(0, crect.y + crect.height, wd, ht - (crect.y + crect.height))
      ctx.fillRect(0, crect.y, (wd - crect.width) / 2, crect.height)
      ctx.fillRect((wd - crect.width) / 2 + crect.width, crect.y, (wd - crect.width) / 2, crect.height)

      // 画箭头的函数
      function drawArrow (ctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
        let theta1 = theta || 30
        let headlen1 = headlen || 10
        let width1 = width || 3
        let color1 = color || '#7FFFAA'
        let angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI
        let angle1 = (angle + theta1) * Math.PI / 180
        let angle2 = (angle - theta1) * Math.PI / 180
        let topX = headlen1 * Math.cos(angle1)
        let topY = headlen1 * Math.sin(angle1)
        let botX = headlen1 * Math.cos(angle2)
        let botY = headlen1 * Math.sin(angle2)
        ctx.save()
        ctx.beginPath()
        var arrowX = fromX - topX
        var arrowY = fromY - topY
        /* ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(fromX, fromY);
          arrowX = fromX - botX;
          arrowY = fromY - botY;
          ctx.lineTo(arrowX, arrowY); */
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        // Reverse length on the other side
        arrowX = toX + topX
        arrowY = toY + topY
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(toX, toY)
        arrowX = toX + botX
        arrowY = toY + botY
        ctx.lineTo(arrowX, arrowY)
        ctx.strokeStyle = color1
        ctx.lineWidth = width1
        ctx.stroke()
        ctx.restore()
      }
      // 根据datas数据绘制箭头
      if (datas.arrows.length > 0) {
        for (let i = 0; i < datas.arrows.length; i++) {
          var aow = datas.arrows[i]
          /* ctx.beginPath()
                ctx.strokeStyle="black"
                ctx.lineWidth="3" */
          let cx = aow.start.x * scale + img_left
          let cy = aow.start.y * scale + img_top
          /* ctx.moveTo(cx,cy); */
          var cx2 = aow.end.x * scale + img_left
          var cy2 = aow.end.y * scale + img_top
          // ctx.lineTo(cx2,cy2)
          //       ctx.closePath()
          //       var  deg=Math.atan(cx2/cy2)

          // ctx.stroke()
          drawArrow(ctx, cx, cy, cx2, cy2)
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
        // renderByData()
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
        // renderByData()
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
        if (!opt && stats.rect) {
          mk_down = true
          mk_x = evt.clientX
          mk_y = evt.clientY
          var point = convertCoordtion(mk_x, mk_y)
          uid = uuId()
          mk_dt = {
            id: uid,
            color: r_color,
            type: r_type,
            sx: point.x,
            sy: point.y,
            point1: point
          }
          datas.markup.push(mk_dt)
          mk_move = false
        }
      })
      cvs.addEventListener('mousemove', function (evt) {
        if (mk_down) {
          mk_ex = evt.clientX
          mk_ey = evt.clientY
          var point = convertCoordtion(mk_ex, mk_ey)
          mk_dt.point2 = point
          mk_dt.sx = Math.min(mk_dt.point1.x, mk_dt.point2.x)
          mk_dt.sy = Math.min(mk_dt.point1.y, mk_dt.point2.y)
          mk_dt.wd = Math.abs(Math.floor((mk_dt.point1.x - mk_dt.point2.x)))
          mk_dt.ht = Math.abs(Math.floor((mk_dt.point1.y - mk_dt.point2.y)))
          mk_move = true

          // renderByData()
        }
      })
      document.addEventListener('mouseup', function (evt) {
        if (mk_down) {
          if (!mk_move) {
            datas.markup.pop()
          } else {
            if (mk_dt.wd + mk_dt.sx > origin_w || mk_dt.ht + mk_dt.sy > origin_h || mk_dt.sx < 0 || mk_dt.sy < 0) {
              datas.markup.pop()
              // renderByData()
              alert('请在图片上进行标注！^_^')
            }
            if (mk_dt.wd < 1 || mk_dt.ht < 1) {
              datas.markup.pop()
              // renderByData()
              // alert("标注宽高必须大于20哦！*_*")
            }
          }
          mk_down = false
          mk_dt = null
        }
      })

      var a_sx = 0
      var a_sy = 0
      var a_ex = 0
      var a_ey = 0
      var arr_down = false
      var arr_move = false
      var arr_dt = {start: {}, end: {}}
      // 绑定画箭头的功能
      cvs.addEventListener('mousedown', function (evt) {
        if (!opt && stats.arrow) {
          arr_down = true
          a_sx = evt.clientX
          a_sy = evt.clientY
          var point = convertCoordtion(a_sx, a_sy)
          arr_dt.start = point
          arr_dt.type = ar_type
          datas.arrows.push(arr_dt)
        }
      })
      cvs.addEventListener('mousemove', function (evt) {
        if (arr_down) {
          arr_move = true
          a_ex = evt.clientX
          a_ey = evt.clientY
          var point = convertCoordtion(a_ex, a_ey)
          arr_dt.end = point
          // renderByData()
        }
      })
      document.addEventListener('mouseup', function (evt) {
        if (arr_down) {
          if (!arr_move) {
            datas.arrows.pop()
          } else {

          }
          arr_dt = {start: {}, end: {}}
          // renderByData()
          arr_down = false
          arr_move = false
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
              // renderByData()
              break
            }
          }
        }
        if (datas.arrows.length > 0) {
          for (let i = 0; i < datas.arrows.length; i++) {
            var arrow = datas.arrows[i]
            var arrow_len = Math.sqrt(Math.pow(Math.abs(arrow.start.x - arrow.end.x), 2) + Math.pow(Math.abs(arrow.start.y - arrow.end.y), 2))
            var len1 = Math.sqrt(Math.pow(Math.abs(arrow.start.x - point.x), 2) + Math.pow(Math.abs(arrow.start.y - point.y), 2))
            var len2 = Math.sqrt(Math.pow(Math.abs(arrow.end.x - point.x), 2) + Math.pow(Math.abs(arrow.end.y - point.y), 2))
            if (Math.abs(len1 + len2 - arrow_len) < 2) {
              datas.arrows.splice(i, 1)
              // renderByData()
              break
            }
          }
        }
        // if(datas.polygon.length>0){
        //          for(var i=0;i<datas.polygon.length;i++){
        //              var tmp=datas.polygon[i].points;
        //              var flag=isInPolygon(point,tmp);
        //              if(flag){
        //                  datas.polygon.splice(i,1);
        //                  renderByData();
        //                  break;
        //              }
        //
        //          }
        //      }
      })

      // 绑定订的事件
      // cvs.addEventListener('click', function (evt) {
      //   if (!stats.ding) {
      //     return
      //   }
      //   var x = evt.clientX
      //   var y = evt.clientY
      //   var point = convertCoordtion(x, y)
      //   if (datas.markup.length > 0) {
      //     for (var i = 0; i < datas.markup.length; i++) {
      //       var tmp = datas.markup[i]
      //       if (point.x > tmp.sx && point.x < tmp.sx - (-tmp.wd) && point.y > tmp.sy && point.y < tmp.sy - (-tmp.ht)) {
      //         tmp.ding = !tmp.ding
      //         toDing(tmp, 'r', tmp.ding)
      //
      //         break
      //       }
      //     }
      //   }
      //   if (datas.polygon.length > 0) {
      //     for (var i = 0; i < datas.polygon.length; i++) {
      //       var tmp = datas.polygon[i]
      //       if (isInPolygon(point, tmp.points)) {
      //         tmp.ding = !tmp.ding
      //         toDing(tmp, 'd', tmp.ding)
      //       }
      //     }
      //   }
      // })

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
      if ($(th).hasClass('active')) {
        opt = false
        $(th).removeClass('active')
        stats[key] = false
      } else {
        opt = true
        $('.mkitem').removeClass('active')
        $(th).addClass('active')
        stats.move = false
        stats.del = false
        stats.ding = false
        stats[key] = true
        // cvs.style.cursor='crosshair'
      }
    }

    document.addEventListener('keyup', function (evt) {
      evt.preventDefault()
      if (evt.keyCode == 46 || evt.keyCode == 68) {
        triggleMove($('#mk_del')[0], 'del', '2')
        return
      }
      if (evt.keyCode == 32) {
        triggleMove($('#mk_drag')[0], 'move', '2')
        return
      }
      /* if(evt.keyCode==84){
                triggleMove($("#mk_ding")[0],'ding',"2")
            } */
      if (evt.keyCode == 88) {
        toggleXY($('#coor')[0])
      }
    })

    function toggleXY (th) {
      console.log('coordition')
      if ($(th).hasClass('active')) {
        coor = false
        $(th).removeClass('active')
      } else {
        $(th).addClass('active')
        coor = true
      }
    }
    // 用来生成前端的唯一ID，
    function uuId () {
      return 'off-' + Math.floor(Math.random() * 1000) + '-' + Math.floor(Math.random() * 1000) + '-' + Math.floor(Math.random() * 1000)
    }
    window.addEventListener('resize', function () {
      // renderByData()
      calcWin(ctx)
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
            this.initImg()
            this.photo_path = res.photo_path
            this.task_detail_id = res.task_detail_id
            this.props = res.props
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
</style>
