<template>
  <div v-if="show" class="barDiv" style="width: 600px;height: 70px;position: fixed;left: calc(18vw);top: calc(100vh - 80px);border-top:1px solid #E6E6E6;z-index:1000;">
    <!--蓝色进度条-->
    <span class="bar" :style="style" />
    <!--进度条灰色底, bar与backBar重叠，bar在上，backBar在下-->
    <span
      class="backBar"
      style="width: 400px;height: 24px;position: fixed;left: calc(18vw + 30px);;top: calc(100vh - 60px);background-color:#DDDDDD;border:1px solid #E6E6E6;border-radius:12px 12px 12px 12px;
"
    />
    <!--位于进度条右侧，显示当前进度-->
    <span class="processText" style="width: 50px;height: 40px; font-size:1em; position: fixed;left: calc(18vw + 435px);top: calc(100vh - 60px);">{{ text }}</span>
    <!--位于进度条右侧，取消进度条-->
    <span class="buttonSpan" style="width: 50px;height: 24px;position: fixed;left: calc(18vw + 520px);top: calc(100vh - 60px);"><el-button size="mini" @click="cancelExport()">Cancel</el-button></span>
  </div>
</template>
<script>

export default {
  name: 'ProgressBar',
  props: {
    options: {
      type: Object,
      default() {
        return {
          succColor: 'rgb(0, 122, 255)', // 进度条颜色
          failColor: 'rgb(218, 26, 101)', // 失败后进度条颜色
          position: 'fixed', // 进度条固定放置
          transition: {
            widthSpeed: 200,
            opacitySpeed: 400
          },
          inverse: false, // 进度条的加载方向
          thickness: 24 // 进度条的高度
        }
      }
    }
  },
  data() {
    return {
      percent: 0, // 进度条长度
      show: false, // 显示和隐藏
      canSuccess: true, // 是否是成功的状态
      text: '', // 进度条文本提示，用来显示百分比
      stop: false // 进度条是否被中止，这个值一般会被传递到后台，后台进行相关逻辑处理，比如中止某个循环
    }
  },
  computed: {
    style() {
      // 先拿到乱七八糟的属性
      const { succColor, failColor, position, transition, thickness } = this.options
      const { widthSpeed, opacitySpeed } = transition
      const { canSuccess, percent } = this
      // 定义 css 样式
      const style = {
        backgroundColor: canSuccess ? succColor : failColor,
        opacity: 1
      }
      style.width = (percent * 4) + 'px' // 设置进度条长度
      style.height = thickness + 'px' // 设置显示高度
      style.transition = `width ${widthSpeed}ms, opacity ${opacitySpeed}ms` // 设置过度样式
      style.position = position
      style.left = '30px' // 与窗口左边的距离
      return style
    }
  },
  methods: {
    cancelExport() {
      this.show = false
      this.stop = true
    }
  }
}

</script>

<style lang='scss' scoped>
  .barDiv{
    z-index: 1000;
    opacity:1;
    background-color: white;
  }
  .bar {
    border-radius:12px 12px 12px 12px;
    background-color:#007AFF;
    margin-top: 20px;  //与backBar一样，与其父元素的距离为20像素
    z-index: 99999;
    text-align: center;
    opacity: 1;
    margin-left: calc(18vw);
  }
</style>
