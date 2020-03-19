<template>
    <div class="wrap">
      <div class="left">
        <div class="c-done">
          <span id='mk_del' @click="triggleMove($event.target,'del',2)">删除（del/D）</span>
          <span id='mk_drag' @click="triggleMove($event.target,'move',2)">拖拽（Space）</span>
          <span  id="coor" class="c-span-active" @click="toggleXY($event.target)">坐标线（X）</span>
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
            <!--<a-button type="primary"  v-if="detail_type!==1 && !qualityLock" @click="modifyDetail()" :loading="modifyLoading">确认修改</a-button>-->
            <!--<a-tooltip title="此数据已被质检员确认，不可修改"><a-button type="primary"  v-if="detail_type!==1 && qualityLock" disabled>确认修改</a-button></a-tooltip>-->
          </div>
          <div v-if="detail_type!=1">
            <a-button type="primary"  @click="getDetail(1)" :loading="saveLoading">回到质检页</a-button>
          </div>
        </div>
      </div>

      <div class="center"  ref="scrollRight">
        <!--<a-tag v-if="qualityLock" color="#f50" style="margin-bottom: 10px;">此数据已被质检员确认，不可修改</a-tag>-->
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
              <a-tooltip placement="top"  v-if="item.prop_type==2">
                <template slot="title" v-if="item.prop_option_value_final!=item.prop_option_value">
                  <span>{{item.prop_option_value}}</span>
                </template>
                <a-input :class="item.prop_option_value_final!=item.prop_option_value?'c-diff':''"
                         @change="onInput(item.prop_id)"
                         :placeholder="item.prop_option_value_final"
                         :value="item.prop_option_value_final"/>
              </a-tooltip>
              <!--<a-input v-if="item.prop_type==2" @change="onInput(item.prop_id)"  :placeholder="item.prop_option_value" :value="item.prop_option_value"/>-->
              <a-button v-if="item.prop_type==3" :id="item.prop_id" :type="currentFrameId==item.prop_id?'primary':'default'" @click="checkFrame" >画框</a-button>
              <a-button v-if="item.prop_type==4" :id="item.prop_id" :type="currentPolygonId==item.prop_id?'primary':'default'" @click="checkPolygon" >多边形</a-button>

              <a-checkbox-group  v-if="item.prop_type==5" :value=item.prop_option_value @change="(val)=>checkChange(val,item.prop_id)" >
                <a-checkbox v-for="option in item.property_values"

                            :key="option.option_value"
                            :value="option.option_value"
                            :disabled="qualityInspection==-1?true:false"
                            :class="item.prop_option_value!=item.prop_option_value_final&&option.option_value==item.prop_option_value_final?'red':''"
                >{{option.option_name}}</a-checkbox>
              </a-checkbox-group>
              <a-button v-if="item.prop_type==6" :id="item.prop_id" :type="currentPointId==item.prop_id?'primary':'default'" @click="checkPoint">关键点</a-button>
            </td>
          </tr>
        </table>
      </div>
      <div class="right">
          <a-button  shape="circle" icon="check" class="c-abtn c-green" @click="modifyDetail(1)"/>
          <a-button type="danger" shape="circle" icon="close" class="c-abtn" @click="modifyDetail(0)"/>
      </div>
    </div>
</template>
<script>

export default {
  name: 'quality_check_details',
  data () {
    return {
      task_id: this.$route.query.task_id,
      check_task_id: this.$route.query.check_task_id,
      photo_path: '',
      task_detail_id: -1,
      props: [], // 传来的并传回去
      openSpace: false,
      classActive: 'c-span-active',
      detail_type: 1,
      check_data_info_id: -1,
      qualityLock: false,
      quality_inspection: 0,
      modifyLoading: false,
      lastLoading: false,
      nextLoading: false,
      saveLoading: false,
      qualityInspection: 0,
      currentFrameId: -1, // 当前画框属性
      currentPolygonId: -1, // 当前多边形属性
      currentPointId: -1, // 当前关键点属性
      drawOpen: false, // 打开画框
      drawPolygon: false, // 打开画多边形
      drawPoint: false, // 打开画关键点
      img: new Image(),
      markup: [], // 用来存放标注的数据
      polygon: [],
      points: [], // 保存关键点数组
      opt: false, // 是否操作启用
      origin_w: null, // 保存图片的原始宽高数据
      origin_h: null,
      scale: 1, // 放大比例
      trans_x: 0, // x轴相对于scale=1时的移动量，
      trans_y: 0, // y轴相对于scale=1时的移动量
      stats: { // 保存可操作的状态
        move: false,
        del: false,
        ding: false,
        line: false,
        man: false,
        car: false,
        bycycle: false
      },
      coor: true,
      coor_x: 0,
      coor_y: 0
    }
  },
  beforeMount () {
    // 进入页面detail_type ==1,相当于新的一张
    this.getDetail(1)
  },
  mounted () {
    /*eslint-disable*/
    var _this = this
    // 获取画布和画笔对象。
    var cvs = $('#canvas')[0]
    var ctx = cvs.getContext('2d')
    // 画布的宽高
    var wd = cvs.offsetWidth
    var ht = cvs.offsetHeight

    // 加载图片
    this.img.src = this.photo_path
    // 图片加载完成后，获取图片的原始宽高属性
    bindEvent()
    this.img.onload = function () {
      _this.origin_w = _this.img.width
      _this.origin_h = _this.img.height
      wd = cvs.offsetWidth
      ht = cvs.offsetHeight
      var w_scale = 1
      var h_scale = 1
      if (_this.origin_w > wd) {
        w_scale = wd * 0.9 / _this.origin_w
      }
      if (_this.origin_h > ht) {
        h_scale = ht * 0.9 / _this.origin_h
      }
      var min = Math.min(w_scale, h_scale)
      _this.scale = Math.min(min, _this.scale)

      setTimeout(function () {
        // renderByData();
        startRender()
      }, 0)
    }

    var ding_png = new Image()
    ding_png.src = '/sorting/image/dingding.jpg'
    ding_png.onload = function () {
    }

    // 保存不同标注的颜色值
    var colors = {
      drawOpen: 'red',
      drawPolygon:'red',
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
    //     _this.markup.push(mark)
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
    //     _this.polygon.push(poly)
    //   }
    // }

    // 获取传输标注数据
    function RectPost () {
      var arr = []
      for (var i = 0; i < _this.markup.length; i++) {
        var tmp = _this.markup[i]
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
      for (var i = 0; i < _this.polygon.length; i++) {
        var tmp = _this.polygon[i]
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
    // var stats = {
    //   move: false,
    //   del: false,
    //   ding: false,
    //   line: false,
    //   man: false,
    //   car: false,
    //   bycycle: false
    // }

    // var fsize = 14
    // var coor = true
    // var coor_x = 0
    // var coor_y = 0
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
      var img_left = (wd - (_this.origin_w) * _this.scale) / 2 + _this.trans_x * _this.scale
      var img_top = (ht - (_this.origin_h) * _this.scale) / 2 + _this.trans_y * _this.scale
      var img_w = _this.origin_w * _this.scale
      var img_h = _this.origin_h * _this.scale
      ctx.drawImage(_this.img, img_left, img_top, img_w, img_h)
      // 根据data里面的数据绘制标注
      if (_this.markup.length > 0) {
        for (var i = 0; i < _this.markup.length; i++) {
          ctx.beginPath()
          var mup = _this.markup[i]
          ctx.strokeStyle = mup.color || 'green'
          ctx.fontSize = '12px'
          ctx.lineWidth = '1px'
          if (mup.sx != undefined && mup.sy != undefined && mup.wd != undefined && mup.ht != undefined) {
            var xx = mup.sx
            var yy = mup.sy
            if ((mup.ex && mup.ex < mup.sx) || (mup.ey && mup.ey < mup.sy)) {
              xx = mup.ex
              yy = mup.ey
            }
            var cx = xx * _this.scale + img_left
            var cy = yy * _this.scale + img_top
            var cwd = mup.wd * _this.scale
            var cht = mup.ht * _this.scale
            // if(mup.color=='red'){
            //   ctx.setLineDash([5, 5]);
            // }
            ctx.strokeRect(cx, cy, cwd, cht)
            var txt = (mup.wd) + '*' + (mup.ht)
            ctx.lineWidth = '1px'
            ctx.strokeText(txt, cx + cwd - ctx.measureText(txt).width - 4, cy + 12)
            if (mup.ding) {
              ctx.drawImage(ding_png, cx + 4, cy + 4, 20, 20)
            }
          }
        }
      }
      // polygon里的每个多边形渲染出来

      if (_this.polygon.length > 0) {
        for (var i = 0; i < _this.polygon.length; i++) {
          var poly = _this.polygon[i]
          for (var j = 0; j < poly.points.length; j++) {
            var point = poly.points[j]
            let cx = point.x * _this.scale + img_left
            let cy = point.y * _this.scale + img_top
            ctx.beginPath()
            ctx.arc(cx,cy,3,0,2*Math.PI)
            ctx.fillStyle="red";
            ctx.fill();
            ctx.closePath()
          }
        }

        for (var i = 0; i < _this.polygon.length; i++) {
          var poly = _this.polygon[i]
          ctx.beginPath()
          ctx.strokeStyle =  poly.color || 'green'
          ctx.strokeWidth = '1px'
          for (var j = 0; j < poly.points.length; j++) {
            var point = poly.points[j]
            let cx = point.x * _this.scale + img_left
            let cy = point.y * _this.scale + img_top
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
            let cx = first.x * _this.scale + img_left
            let cy = first.y * _this.scale + img_top
            ctx.drawImage(ding_png, cx - 10, cy - 10, 20, 20)
          }
        }
      }

      //渲染关键点
      if (_this.points.length > 0){
        var annotation_str = 0

        for (var s in _this.points){
            var x = _this.points[s].point['x'] * _this.scale + img_left
            var y = _this.points[s].point['y'] * _this.scale + img_top
            annotation_str +=1

            //画索引框
            ctx.fillStyle="black";
            ctx.globalAlpha = 0.5;
            var bgnd_rect_width;
            var strw = ctx.measureText(annotation_str).width;
            var bgnd_rect_width = strw + 13
            var char_width  = ctx.measureText('M').width;
            var char_height = 1.8 * char_width;
            ctx.fillRect(parseFloat(x -10),
                        parseFloat(y - 1.2*char_height),
                        parseFloat(bgnd_rect_width),
                        parseFloat(char_height));

            //填充文字
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "yellow";
            ctx.fillText(annotation_str, parseFloat(x - 0.4*char_width), parseFloat(y - 0.35*char_height));
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI*2);
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth=2;
            ctx.stroke();
        }
      }

      // 绘制十字架
      if (_this.coor) {
        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = '#F77C05'
        ctx.moveTo(_this.coor_x, 0)
        ctx.lineTo(_this.coor_x, ht)
        ctx.moveTo(0, _this.coor_y)
        ctx.lineTo(wd, _this.coor_y)
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
      console.log('bind事件')
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
        _this.scale += countV * 0.1
        if (_this.scale < 0.1) {
          _this.scale = 0.1
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
        if (!_this.stats.move) {
          return
        }
        evt.preventDefault()
        mv_x = evt.clientX
        mv_y = evt.clientY
        ismove = true
        tmp_transx = _this.trans_x
        tmp_transy = _this.trans_y
      })
      cvs.addEventListener('mousemove', function (evt) {
        if (!_this.stats.move || !ismove) {
          return
        }
        var tmp_x = evt.clientX
        var tmp_y = evt.clientY
        _this.trans_x = tmp_transx + ((tmp_x - mv_x) / _this.scale)
        _this.trans_y = tmp_transy + ((tmp_y - mv_y) / _this.scale)
        // renderByData();
      })
      cvs.addEventListener('mouseup', function (evt) {
        if (_this.stats.move) {
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
        if (!_this.opt && _this.drawOpen) {
          let color = ''
          if (_this.drawOpen) { color = colors.drawOpen }
          mk_down = true
          mk_x = evt.clientX
          mk_y = evt.clientY
          var point = convertCoordtion(mk_x, mk_y)
          if (point.x < 0) {
            point.x = 0
          }
          if (point.x > _this.origin_w) {
            point.x = _this.origin_w
          }
          if (point.y < 0) {
            point.y = 0
          }
          if (point.y > _this.origin_h) {
            point.y = _this.origin_h
          }
          // uid = uuId()
          mk_dt = {
            prop_id: _this.currentFrameId,
            color: color,
            sx: point.x,
            sy: point.y,
            point1: point
          }
          // 同一个属性id,只能画一个框
          _this.markup.forEach((item, index) => {
            if (item.prop_id == mk_dt.prop_id) {
              _this.markup.splice(index, 1)
            }
          })

          _this.markup.push(mk_dt)
          console.log(_this.markup)
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
          if (point.x > _this.origin_w) {
            point.x = _this.origin_w
          }
          if (point.y < 0) {
            point.y = 0
          }
          if (point.y > _this.origin_h) {
            point.y = _this.origin_h
          }
          mk_dt.point2 = point
          mk_dt.sx = Math.min(mk_dt.point1.x, mk_dt.point2.x)
          mk_dt.sy = Math.min(mk_dt.point1.y, mk_dt.point2.y)
          mk_dt.wd = Math.abs(Math.floor((mk_dt.point1.x - mk_dt.point2.x)))
          mk_dt.ht = Math.abs(Math.floor((mk_dt.point1.y - mk_dt.point2.y)))
          mk_move = true
          _this.markup.forEach((item, index) => {
            if (item.prop_id == this.currentFrameId) {
              _this.markup.splice(index, 1)
            }
          })
          // renderByData();
        }
      })
      document.addEventListener('mouseup', function (evt) {
        if (mk_down) {
          if (!mk_move) {
            _this.markup.pop()
            return
          }
          if (mk_dt.wd + mk_dt.sx > _this.origin_w || mk_dt.ht + mk_dt.sy > _this.origin_h || mk_dt.sx < 0 || mk_dt.sy < 0) {
            _this.markup.pop()
            // renderByData();
            alert('请在图片上进行标注！^_^')
          }
          if (mk_dt.wd < 20 || mk_dt.ht < 20) {
            _this.markup.pop()
            // renderByData();
            // alert("标注宽高必须大于20哦！*_*");
          }
          mk_down = false
          mk_dt = null
          _this.markup.forEach(item => {
            _this.props.forEach(prop => {
              if (item.prop_id == prop.prop_id) {
                prop.prop_option_value = item.sx + ',' + item.sy + ',' + item.wd + ',' + item.ht
                prop.prop_option_value_final = item.sx + ',' + item.sy + ',' + item.wd + ',' + item.ht
              }
            })
          })
        }
      })

      // 删除事件的绑定
      cvs.addEventListener('click', function (evt) {
        if (!_this.stats.del) {
          return
        }
        var x = evt.clientX
        var y = evt.clientY
        var point = convertCoordtion(x, y)
        if (_this.markup.length > 0) {
          for (var i = 0; i < _this.markup.length; i++) {
            var tmp = _this.markup[i]
            if (point.x >= tmp.sx && point.x <= tmp.sx - (-tmp.wd) && point.y >= tmp.sy && point.y <= tmp.sy - (-tmp.ht)) {
              _this.markup.splice(i, 1)
              _this.props.forEach(item => {
                if (item.prop_id == tmp.prop_id) {
                  item.prop_option_value = ''
                  item.prop_option_value_final = ''
                }
              })
              // renderByData();
              break
            }
          }
        }
        if (_this.polygon.length > 0) {
          for (var i = 0; i < _this.polygon.length; i++) {
            let tmp = _this.polygon[i].points
            let tmpId = _this.polygon[i].prop_id
            var flag = isInPolygon(point, tmp)
            if (flag) {
              console.log('flag')
              _this.polygon.splice(i, 1)
              _this.props.forEach(item => {
                if (item.prop_id == tmpId) {
                  item.prop_option_value = ''
                  item.prop_option_value_final = ''
                }
              })
              // renderByData();
              break
            }
          }
        }
      })

      var poly = { // 存储多边形的点坐标位置
        prop_id: -1,
        points: [],
        cp: false,
        color: 'red'
      }
      // 绑定标记的事件
      cvs.addEventListener('click', function (evt) {
        if (!_this.drawPolygon || _this.stats.move) {
          return
        }
        var x = evt.clientX
        var y = evt.clientY
        var point = convertCoordtion(x, y)
        poly.prop_id = _this.currentPolygonId //点的时候赋予多边形ID，后面与已存在的作比较
        if (poly.points.length == 0) {//说明上个操作是点击右键
          // 同一个属性id,只能画一个多边形
          _this.polygon.forEach((item, index) => {
            if (item.cp && item.prop_id == poly.prop_id) {
              _this.polygon.splice(index, 1)
            }
          })
          _this.polygon.push(poly)
        }

        poly.points.push(point)
        // renderByData();
      })
      cvs.addEventListener('contextmenu', function (evt) {
        if (_this.drawPolygon) {
          evt.preventDefault()
          if (poly.points.length <= 2) {
            _this.polygon.pop()
            _this.$warning({
              title: '温馨提示：',
              content: '标记形状无效',
              maskClosable: true
            })
          } else {
            poly.cp = true
            console.log(poly)
          }
          _this.polygon.forEach(item => {
            _this.props.forEach(prop => {
              if (item.prop_id == prop.prop_id) {
                prop.prop_option_value = JSON.stringify(item.points)
                prop.prop_option_value_final = JSON.stringify(item.points)
              }
            })
          })
          poly = { // 重置多边形的点坐标位置
            prop_id: -1,
            points: [],
            cp: false,
            color:'red'
          }
          // renderByData();
        }
      })

            //在这里写关键点的代码
      var keypoints = {
        prop_id: -1,
        point:[]
      }

      // 关键点事件监听
      cvs.addEventListener('click', function(evt){
        var pt2 = []
        var x = evt.clientX
        var y = evt.clientY
        var pt = convertCoordtion(x,y)

                //增加提示，如果删除点等属性时没有选中对应的属性，则弹窗提示
        if(!_this.drawPoint && !_this.drawOpen && !_this.drawPolygon && _this.stats.del){
          if (pt.x <= _this.origin_w && pt.y <= _this.origin_h && pt.x >= 0 && pt.y >= 0) {
            // alert('如需删除，请先选中对应的属性')
            _this.$warning({
              title: '温馨提示：',
              content: '如需删除，请先选中对应的属性',
              maskClosable: true
            })
          }
        }
        if(!_this.drawPoint || _this.stats.move){
          return
        }


        if(!_this.stats.del){
          // 添加点
          keypoints.prop_id = _this.currentPointId
          keypoints.point = pt
          console.log(keypoints.point)
          _this.points.push(keypoints)
          keypoints = {
            prop_id: -1,
            point:[]
          }
        } else{
          // 删除点
          var extend_num = 3
          for(var index in _this.points){
            var item = _this.points[index]
            if(pt.x >= item.point.x-extend_num && pt.x <= item.point.x +extend_num && pt.y>= item.point.y - extend_num && pt.y<=item.point.y+extend_num ){
              _this.points.splice(index,1)
              break;
            }
          }
        }
        // 超出边界处理
          if (pt.x > _this.origin_w || pt.y > _this.origin_h || pt.x < 0 || pt.y < 0) {

            _this.points.pop()
          }

          pt2 = []
        _this.props.forEach(prop => {
          pt2=[]
          if (_this.points.length > 0){
            _this.points.forEach(item => {

              if (item.prop_id == prop.prop_id) {
                var pt3 = []
                pt3.push(item.point.x)
                pt3.push(item.point.y)
                pt2.push(pt3)
                prop.prop_option_value = pt2
                prop.prop_option_value_final = pt2
                // console.log('prop_id:',prop.prop_id)
                // console.log(prop.prop_option_value)
                }
              })
            } else{
            _this.props.forEach(prop => {
              if (prop.prop_id ==  _this.currentPointId){
                console.log('进入这里')
                prop.prop_option_value = []
                prop.prop_option_value_final = []
              }
            })
          }

          })
        console.log(_this.points)
      })


      // 绑定十字架事件
      cvs.addEventListener('mousemove', function (evt) {
        var x = evt.clientX
        var y = evt.clientY
        var cvs_rect = cvs.getBoundingClientRect()
        _this.coor_x = x - cvs_rect.left
        _this.coor_y = y - cvs_rect.top
      })
    }

    function convertCoordtion (x, y) {
      var _left = (wd - (_this.origin_w) * _this.scale) / 2 + _this.trans_x * _this.scale
      var _top = (ht - (_this.origin_h) * _this.scale) / 2 + _this.trans_y * _this.scale

      var cvs_rect = cvs.getBoundingClientRect()
      var mk_fx = x - cvs_rect.left// 转化成相对于画布的坐标
      var mk_fy = y - cvs_rect.top

      mk_fx = mk_fx - _left// 转换成相对于图片的坐标
      mk_fy = mk_fy - _top

      mk_fx = mk_fx / _this.scale// 去除缩放后转换的坐标
      mk_fy = mk_fy / _this.scale
      return {x: Math.floor(mk_fx), y: Math.floor(mk_fy)}
    }

    document.addEventListener('keyup', _this.myKeyUp)

    // 用来生成前端的唯一ID，
    function uuId () {
      return 'off-' + Math.floor(Math.random() * 1000) + '-' + Math.floor(Math.random() * 1000) + '-' + Math.floor(Math.random() * 1000)
    }
    window.addEventListener('resize', function () {
      // renderByData();
    })
  },
  beforeDestroy () {
    var _this = this
    document.removeEventListener('keyup', _this.myKeyUp)
  },

  methods: {
    onchange (id) {
      // console.log('change啦')
      // console.log(event.target.value, id)
      this.props.forEach(item => {
        if (item.prop_id == id) {
          item.prop_option_value = parseInt(event.target.value)
          item.prop_option_value_final = parseInt(event.target.value)
        }
      })
    },
    checkChange(checkedValues,id){
      console.log();
      this.props.forEach(item => {
        if(item.prop_id == id) {
          item.prop_option_value = checkedValues
          item.prop_option_value_final = checkedValues
          console.log(item.prop_option_value);
        }

      })
      console.log(this.props);
    },
    checkFrame (e) {
      this.drawOpen = true
      this.drawPolygon = false
      this.drawPoint = false
      this.currentFrameId = e.target.id
      this.currentPolygonId = -1
      this.currentPointId = -1
    },
    checkPolygon (e) {
      this.drawOpen = false
      this.drawPolygon = true
      this.drawPoint = false
      this.currentPolygonId = e.target.id
      this.currentFrameId = -1
      this.currentPointId = -1

    },
    checkPoint (e) {
      this.drawOpen = false
      this.drawPolygon = false
      this.drawPoint = true
      this.currentPolygonId = -1
      this.currentFrameId = -1
      this.currentPointId = e.target.id

    },
    onInput (id) {
      this.props.forEach(item => {
        if (item.prop_id == id) {
          item.prop_option_value = event.target.value,
          item.prop_option_value_final = event.target.value
        }
      })
    },
    toggleXY (th) { // 改变坐标线
      /* eslint-disable*/
      if ($(th).hasClass('c-span-active')) {
        this.coor = false
        $(th).removeClass('c-span-active')
      } else {
        $(th).addClass('c-span-active')
        this.coor = true
      }
    },
    // 改变拖拽的状态
    triggleMove (th, key, isopt) {
      if (isopt) {
        if (isopt == '1') {
          this.opt = true
          $('.opitem').removeClass('c-span-active')
          for (var keys in this.stats) {
            if (keys != 'man' && keys != 'car' && keys != 'bycycle') {
              this.stats[keys] = false
            }
          }
        } else {
          if ($(th).hasClass('c-span-active')) {
            this.opt = false
            $(th).removeClass('c-span-active')
            this.stats[key] = false
            return
          } else {
            this.opt = true
            $('.opitem').removeClass('c-span-active')
            for (var keys in this.stats) {
              if (keys != 'man' && keys != 'car' && keys != 'bycycle') {
                this.stats[keys] = false
              }
            }
          }
    }
  } else {
    $('.mkitem').removeClass('c-span-active')
    for (var stat in this.stats) {
      if (stat == 'man' || stat == 'car' || stat == 'bycycle') {
        this.stats[stat] = false
      }
    }
  }
  $(th).addClass('c-span-active')
  this.stats[key] = true
},
    myKeyUp (evt) {
      console.log(evt.keyCode)
      evt.preventDefault()
      if (evt.keyCode == 46 || evt.keyCode == 68) {
        this.triggleMove($('#mk_del')[0], 'del', '2')
        return
      }
      if (evt.keyCode == 32) {
        this.triggleMove($('#mk_drag')[0], 'move', '2')
        return
      }
      if (evt.keyCode == 88) {
       this.toggleXY($('#coor')[0])
      }

      if(evt.keyCode==107 || evt.keyCode == 187){ // 按 +或者=
        console.log(evt.keyCode)
        this.scale += 0.3
      }
      if(evt.keyCode==109 || evt.keyCode == 189){ // 按 -或者-
        this.scale += -0.3
        if (this.scale < 0.1) {
          this.scale = 0.1
        }
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
    },
    getDetail (detail_type) {
      if (detail_type == 2) {
        this.lastLoading = true
      } else if (detail_type == 3) {
        this.nextLoading = true
      }else{
        this.saveLoading = true
      }

      let params = {
        type: 'POST',
        url: this.baseUrl + '/check_task_details',
        async: false,
        data: {
          'task_id':  this.$route.query.task_id,
          "date":  this.$route.query.date,
          "label_user": this.$route.query.label_user,
          "quality_user": window.localStorage.getItem('nickname'),
          "detail_type": detail_type,
          'check_task_id': this.$route.query.check_task_id,
          'task_detail_id': this.task_detail_id
        },
        success: (res) => {
          if(res.msg) {
            this.$warning({
              title: '温馨提示：',
              content: res.msg,
              maskClosable: true
            })
            // if (res.status == 666) {
            //   this.$router.push({
            //     path: '/label/quality_user_detail',
            //     query: {
            //       'task_id': this.task_id,
            //       'check_task_id': this.check_task_id
            //     }
            //   })
            // }
          }else {
            console.log('check_task_details:',res)
            this.photo_path = res.photo_path
            this.task_detail_id = res.task_detail_id
            this.task_id  = res.task_id
            this.props = res.props
            this.detail_type = res.detail_type
            this.check_data_info_id = res.check_data_info_id
            /*eslint-disable*/
            this.qualityLock = res.quality_lock == 1 ? true : false
            this.quality_inspection = res.quality_inspection
            //初始化canvas&&img
            this.drawOpen = false
            this.currentFrameId = -1
            this.currentPolygonId = -1
            this.currentPointId = -1
            this.origin_w = null
            this.origin_h = null
            this.scale = 1 // 放大比例
            this.trans_x = 0 // x轴相对于scale=1时的移动量，
            this.trans_y = 0// y轴相对于scale=1时的移动量
            this.img.src = this.photo_path
            this.markup = []
            this.polygon = []
            this.points = []

              this.props.forEach(item=>{
                if(item.prop_type==3){
                  // console.log(item.prop_option_value)
                  if(item.prop_option_value && item.prop_option_value_final) {
                    let pos = item.prop_option_value.split(',')
                    let obj = {
                      prop_id: item.prop_id,
                      color: 'green',
                      sx: pos[0],
                      sy: pos[1],
                      wd: pos[2],
                      ht: pos[3]
                    }
                    this.markup.push(obj)
                  }

                  if( item.prop_option_value != item.prop_option_value_final && item.prop_option_value_final){
                    let posFinal = item.prop_option_value_final.split(',')
                    let objFinal = {
                      prop_id: item.prop_id,
                      color:'red',
                      sx: posFinal[0],
                      sy: posFinal[1],
                      wd: posFinal[2],
                      ht: posFinal[3]
                    }
                    this.markup.push(objFinal)
                  }
                }

                if(item.prop_type==4){
                  if(item.prop_option_value && item.prop_option_value_final){
                    console.log("存在标注",item.prop_option_value_final)
                    let value = JSON.parse(item.prop_option_value_final);
                    let poly = { // 存储多边形的点坐标位置
                      color:'green',
                      prop_id: item.prop_id,
                      points: value,
                      cp: true
                    }
                    this.polygon.push(poly)
                  }

                  console.log(item.prop_option_value ,item.prop_option_value_final)
                  if(item.prop_option_value != item.prop_option_value_final && item.prop_option_value_final){
                    console.log('存在final')
                    let valueFinal = JSON.parse(item.prop_option_value_final);
                    let polyFinal = { // 存储多边形的点坐标位置
                      color:'red',
                      prop_id: item.prop_id,
                      points: valueFinal,
                      cp: true
                    }
                    this.polygon.push(polyFinal)
                  }
                }
                if(item.prop_type == 5){
                  if(item.prop_option_value != item.prop_option_value_final){
                    item.prop_option_value = item.prop_option_value_final;
                  }
                }
                // 获取数据库中关键点的数据
                if(item.prop_type==6 && item.prop_option_value_final){
                  let value = item.prop_option_value_final;
                  if (value.length){
                    console.log(value)
                    value.forEach(pt=>{
                      let keypoints = {
                      prop_id: item.prop_id,
                      point:[]
                      }
                      keypoints.point.x = pt[0]
                      keypoints.point.y = pt[1]
                      this.points.push(keypoints)
                    })
                    console.log(this.points)
                  }
                }
              })
            this.$refs.scrollRight.scrollTop = 0
          }
          this.lastLoading = false
          this.nextLoading = false
          this.saveLoading = false
        },
        error: function (err) {
          // console.log('error!', err)
        }
      }
      this.sendAjax(params)

    },
    modifyDetail (result_status) {
      this.modifyLoading = true
      let params = {
        type: 'POST',
        url: this.baseUrl + '/modify_check_data',
        data: {
          'create_user': window.localStorage.getItem('nickname'),
          'group_id': parseInt(window.localStorage.getItem('groupid')),
          'photo_path': this.photo_path,
          'task_id': this.task_id,
          'task_detail_id': this.task_detail_id,
          'check_data_info_id':this.check_data_info_id,
          'props': this.props,
          'detail_type': this.detail_type,
          'result_status':result_status
        },
        success: (res) => {
          this.modifyLoading = false
          if (res.status == 'success') {
            console.log('已提交')
            //如果是质检新的，调取新的一张，与查看历史的对错不获取新的只保存
            if(this.detail_type == 1){
              this.getDetail(1)
            }

            // this.$success({
            //   title: '修改成功：',
            //   content: '此数据已保存。',
            //   maskClosable: true
            // })
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
      }
      this.sendAjax(params)
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
    padding: 5px 20px 0;
    text-align: left;
  }
  .ant-radio-button-wrapper{
    margin-bottom:5px;
    background: #ddf1e3;
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
  .center{
    width: 45%;
    overflow-y:scroll;
    height: 850px;
  }
  .right{
    width: 5%;
    height: 100%;
    position: fixed;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 200px;
  }
  .c-abtn{
    width: 80px;
    height: 80px;
    font-size: 50px;
  }
  .c-green{
    border-color: limegreen;
    color: limegreen;
    margin-bottom: 200px;
  }
  .c-green:hover{
    color: #fff;
    background-color: limegreen;
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
    text-align: left;
  }
  .red{
    background: red;
    color:white;
  }
  .c-diff{
    background-color: #ff8940;
  }
</style>
