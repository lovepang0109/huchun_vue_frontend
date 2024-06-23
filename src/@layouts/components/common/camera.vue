<!--
 * @Description:调用PC摄像头组件
                可用浏览器  谷歌 火狐 360 UC  QQ
                这里要特别说明 摄像头权限是浏览器比较高的权限  需要本地地址 上线需要 https 域名 http 是没有用的
 * @version:
 * @Author: Hayden
 * @Date: 2019-12-04 18:51:09
 * @LastEditors: Hayden
 * @LastEditTime: 2019-12-13 21:21:27
 -->
<template>
  <div class="camera_outer">
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="videoZone">
          <div class="videoZone_font">视频区域</div>
          <video id="videoCamera" :width="videoWidth" :height="videoHeight" autoplay />
          <canvas
            id="canvasCamera"
            style="display:none;"
            :width="videoWidth"
            :height="videoHeight"
          />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="photoZone">
          <div class="photoZone_font">抓拍照片</div>
          <img :src="imgSrc" alt class="tx_img">
        </div>
      </el-col>
      <el-col :span="8">
        <el-row type="flex" align="middle" style="width:326px;height:408px;">
          <el-row style="width: 100%;">
            <div>
              请不要断开和人脸机的连接！请需要拍照的人站在
              合适的位置，看着摄像头~
            </div>
            <br>
            <el-row>
              <el-button type="danger" style="width: 100%;" @click="setImage">拍照</el-button>
            </el-row>
          </el-row>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      videoWidth: 326,
      videoHeight: 408,
      imgSrc: '',
      thisCancas: null,
      thisContext: null,
      thisVideo: null
    }
  },
  computed: {},
  mounted() {
    this.getCompetence()
  },
  beforeDestroy() {
    this.stopNavigator()
  },
  methods: {
    /*
     *@function  调用权限
     *****************************************/
    getCompetence() {
      var _this = this
      this.thisCancas = document.getElementById('canvasCamera')
      this.thisContext = this.thisCancas.getContext('2d')
      this.thisVideo = document.getElementById('videoCamera')
      // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {}
      }
      // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
      // 使用getUserMedia，因为它会覆盖现有的属性。
      // 这里，如果缺少getUserMedia属性，就添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          // 首先获取现存的getUserMedia(如果存在)
          var getUserMedia =
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.getUserMedia
          // 有些浏览器不支持，会返回错误信息
          // 保持接口一致
          if (!getUserMedia) {
            return Promise.reject(
              new Error('getUserMedia is not implemented in this browser')
            )
          }
          // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }
      var constraints = {
        audio: false,
        video: {
          width: this.videoWidth,
          height: this.videoHeight,
          transform: 'scaleX(-1)'
        }
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
          // 旧的浏览器可能没有srcObject
          if ('srcObject' in _this.thisVideo) {
            _this.thisVideo.srcObject = stream
          } else {
            // 避免在新的浏览器中使用它，因为它正在被弃用。
            _this.thisVideo.src = window.URL.createObjectURL(stream)
          }
          _this.thisVideo.onloadedmetadata = function(e) {
            _this.thisVideo.play()
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    /**
     * @author: Hayden
     * @Date: 2019-12-05 15:53:15
     * @function: 绘制图片
     * @description:
     * @param {type}
     * @return:
     */
    setImage() {
      var _this = this
      // 点击，canvas画图
      _this.thisContext.drawImage(
        _this.thisVideo,
        0,
        0,
        _this.videoWidth,
        _this.videoHeight
      )
      // 获取图片base64链接
      var image = this.thisCancas.toDataURL('image/png')
      _this.imgSrc = image
      this.$emit('takePhotoChange', this.imgSrc)
    },
    /**
     * @author: Hayden
     * @Date: 2019-12-05 15:54:19
     * @function: 关闭摄像头
     * @description:
     * @param {type}
     * @return:
     */
    stopNavigator() {
      this.thisVideo.srcObject.getTracks()[0].stop()
    }
  }
}
</script>
<style lang="scss" scoped>
.camera_outer {
  position: relative;
  overflow: hidden;
  // background: require('@/assets/images/system_logo.png') no-repeat center;
  background-size: 100%;
  video,
  canvas,
  .tx_img {
    -moz-transform: scaleX(-1);
    -webkit-transform: scaleX(-1);
    -o-transform: scaleX(-1);
    transform: scaleX(-1);
  }
  .videoZone {
    width: 326px;
    height: 408px;
    background: rgba(221, 221, 221, 1);
    opacity: 1;
    .videoZone_font {
      position: absolute;
      width: 144px;
      height: 190px;
      margin-top: 109px;
      margin-left: 91px;
      font-size: 72px;
      font-family: Microsoft YaHei;
      font-weight: 400;
      line-height: 95px;
      color: rgba(204, 204, 204, 1);
      opacity: 1;
    }
  }
  .photoZone {
    width: 326px;
    height: 408px;
    background: url("~@/assets/images/voucher_face.png") no-repeat center;
    opacity: 1;
    .photoZone_font {
      position: absolute;
      width: 144px;
      height: 190px;
      margin-top: 109px;
      margin-left: 91px;
      font-size: 72px;
      font-family: Microsoft YaHei;
      font-weight: 400;
      line-height: 95px;
      color: rgba(204, 204, 204, 1);
      opacity: 1;
    }
  }
  .btn_camera {
    position: absolute;
    bottom: 4px;
    left: 0;
    right: 0;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.3);
    line-height: 50px;
    text-align: center;
    color: #ffffff;
  }
  .bg_r_img {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
  }
  .img_bg_camera {
    // position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    img {
      width: 100%;
      height: 100%;
    }
    .img_btn_camera {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      line-height: 50px;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.3);
      color: #ffffff;
      .loding_img {
        width: 50px;
        height: 50px;
      }
    }
  }
}
</style>
