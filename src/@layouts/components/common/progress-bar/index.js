import progressBar from './progress-bar.vue'

export default {
  install(Vue, options = {}) {
    // 注册组件
    Vue.component(progressBar.name, progressBar)
    // 创建一个 Vue 子类
    const Component = Vue.extend(progressBar)
    // 拿到自定义的属性
    const { autoFinish, ...res } = options
    // 创建组件实例
    const vm = new Component({
      data: {
        autoFinish: typeof autoFinish === 'boolean' ? autoFinish : true
      }
    })

    // 将 progressBar 的默认 options 与 自定义的 options 合并
    options = Object.assign(vm.$props.options, { ...res })
    // 合并新的 props
    vm.$propsData = options
    vm.$mount()
    // 如果是服务端渲染那么不继续执行
    if (!vm.$isServer) {
      document.body.appendChild(vm.$el)
    }
    let timer = null
    const progress = {
      // stop: false,
      start() {
        if (Vue.$isServer) return
        // 每次调用 start 都重新初始化一次，比如多次点击某个按钮连续请求，那么每次都从0开始
        vm.stop = false
        vm.percent = 0
        vm.show = true
        vm.canSuccess = true
        vm.text = ''
      },

      increase(cut) {
        vm.percent = Math.min(100, vm.percent + cut)
      },
      set(cut) {
        vm.percent = Math.min(100, cut)
        if (cut > 10) {
          vm.text = Math.floor(cut) + '%'
        } else {
          vm.text = Math.floor(cut) + '%'
        }
      },

      hide() {
        clearInterval(timer)
        // 这里面有2个定时器，外层定时器是让用户可以看到这个 进度已经完成啦
        // 内层定时器，由于 opacity 消失需要一定的过渡时间，所以要等待它消失以后
        // 在将其进度设置为0，等待下次调用，如果不延迟，那么会看到进度到100后又回到0的动画
        setTimeout(() => {
          vm.show = false
          setTimeout(() => {
            vm.percent = 0
            timer = null
          }, vm.options.transition.opacitySpeed)
        }, vm.options.transition.duration)
      },

      // 下面这2个方法就很简单了，只需要完成进度，然后执行隐藏即可
      finish() {
        if (Vue.$isServer) return
        vm.percent = 100
        this.hide()
      },

      fail() {
        if (Vue.$isServer) return
        // 修改未成功的状态，实际效果就是改变最后的颜色
        vm.canSuccess = false
        vm.percent = 100
        this.hide()
      },
      // 返回是否点击了取消进度条的操作，后台据此进行相关业务逻辑操作
      isStop() {
        return vm.stop
      }
    }
    // 最后挂在到全局
    Vue.prototype.$progress = progress
  }
}
