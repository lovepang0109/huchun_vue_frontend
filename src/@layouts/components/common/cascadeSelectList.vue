<!--级联选择列表组件 -->
<template>
  <section>
    <!-- 标题栏，搜索栏 -->
    <el-row>
      <el-col :span="6">
        <el-row>
          <el-col :span="2">
            <div style="width:3px;height:20px;background:rgba(0,122,255,1);opacity:1;" />
          </el-col>
          <el-col :span="22">
            {{ listTitle }}
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="18">
        <el-row type="flex" justify="end">
          <el-input v-model="leftSearch" size="mini" :placeholder="searchProps.leftPlaceholder" prefix-icon="el-icon-search" />
          &nbsp;
          <el-input v-model="rightSearch" size="mini" :placeholder="searchProps.rightPlaceholder" prefix-icon="el-icon-search" />
          &nbsp;
          <el-button
            :type="searchBttonProps.type"
            icon="el-icon-search"
            size="mini"
            @click="handleSearch"
          >
            {{ searchBttonProps.buttonText }}
          </el-button>
        </el-row>
      </el-col>
    </el-row>
    <!-- 选择列表栏 -->
    <el-row style="border:1px solid rgba(221,221,221,1); margin-top: 10px;">
      <!-- 左侧选择列表 -->
      <el-col :span="12">
        <el-table
          id="leftTable"
          ref="leftTable"
          highlight-current-row
          :height="listHeight"
          :header-cell-style="{background:'#D2E4FF',color:'#606266'}"
          :data="activeLeftData"
          style="width:100%;cursor:pointer"
          row-class-name="leftTableStyle"
          @current-change="handleLeftCurrentChange"
        >
          <!-- 左列表选择列 -->
          <el-table-column
            :fixed="true"
          >
            <template slot="header">
              <el-checkbox
                v-model="leftCheckAll"
                :indeterminate="leftIndeterminate"
              />
              {{ listProps.leftCheckAllText }}
              <span style="color:rgba(0,122,255,1);">({{ rigthTotalCount }})</span>
            </template>
            <template slot-scope="scope">
              <el-checkbox
                v-model="scope.row[selectProps.leftValue]"
                :indeterminate="leftRowIndeterminate(scope.row)"
                @change="(val)=>handleLeftCheckChange(val,scope.row)"
              />
              {{ scope.row[listProps.leftLabel] }}
              <span style="color:rgba(0,122,255,1);">({{ rigthCount(scope.row) }})</span>
            </template>
          </el-table-column>
          <!-- 加载左列表表格列 -->
          <el-table-column
            v-for="item in leftTableCols"
            :key="item.id"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
            :min-width="item.minWidth"
            :align="item.align"
            :render-header="item.require?renderHeader:null"
            :fixed="item.fixed"
            :show-overflow-tooltip="item.showOverflowTooltip"
          />
        </el-table>
      </el-col>
      <!-- 右侧选择列表 -->
      <el-col :span="12">
        <el-table
          id="rightTable"
          ref="rightTable"
          v-loading="rightLoading"
          style="width:100%"
          :height="listHeight"
          :header-cell-style="{background:'#D2E4FF',color:'#606266'}"
          :data="activeRightData"
        >
          <!-- 右列表选择列 -->
          <el-table-column
            :fixed="true"
          >
            <template slot="header">
              <el-checkbox
                v-model="rightCheckAll"
                :indeterminate="rightIndeterminate"
              />
              {{ listProps.rightCheckAllText }}
            </template>
            <template slot-scope="scope">
              <el-checkbox
                v-model="scope.row[selectProps.rightValue]"
                @change="handleRightCheckChange"
              >
                {{ scope.row[listProps.rightLabel] }}
              </el-checkbox>
            </template>
          </el-table-column>
          <!-- 加载右列表表格列 -->
          <el-table-column
            v-for="item in rightTableCols"
            :key="item.id"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
            :min-width="item.minWidth"
            :align="item.align"
            :render-header="item.require?renderHeader:null"
            :fixed="item.fixed"
            :show-overflow-tooltip="item.showOverflowTooltip"
          />
        </el-table>
      </el-col>
    </el-row>
    <!-- 操作按钮栏 -->
    <el-row type="flex" justify="center" style="border:1px solid rgba(221,221,221,1);border-top:none;">
      <div style="margin-top: 10px; margin-bottom: 10px;">
        <!-- 选择按钮 -->
        <el-button
          v-waves
          :type="handleBttonProps.type"
          :icon="handleBttonProps.icon"
          size="mini"
          @click="handleSeleted"
        >
          {{ handleBttonProps.buttonText }}
        </el-button>
        <!-- 自定义按钮 -->

      </div>
    </el-row>
  </section>
</template>

<script>
import waves from '@/directive/waves'
// import { deepClone } from '@/assets/js/deepClone'
// import { MessageBox, Message } from 'element-ui'
import { isNullOrUndefined } from 'util'

export default {
  directives: { waves },
  props: {
    // 控件相关属性
    that: { // 组件父组件对象
      type: Object, default: this
    },
    // value: { // 绑定的选择右侧列表
    //   type: Array, default: () => []
    // },
    // 搜索框相关属性
    listTitle: { // 多选列表名称
      type: String, default: '选择列表'
    },
    listHeight: { // 多选列表的高度
      type: String, default: '300px'
    },
    searchProps: { // 搜索输入框占位字符配置
      type: Object, default: () => ({ leftPlaceholder: '一级名称', rightPlaceholder: '二级名称' })
    },
    searchBttonProps: { // 搜索按钮配置
      type: Object, default: () => ({ type: 'primary', buttonText: '搜索' })
    },
    listData: { // 多选列表表格数据
      type: Array, default: () => []
    },
    sourceData: { // 右列表源数据
      type: Array, default: () => []
    },
    handleBttonProps: { // 选择按钮配置
      type: Object, default: () => ({ type: 'primary', icon: 'el-icon-plus', buttonText: '选择' })
    },
    listProps: { // 选择列表列的配置
      type: Object, default: () => ({
        leftCheckAllText: '全选', // 左侧列表选择列表头名称
        leftKey: 'id', // 左侧列表选择列的唯一key
        leftLabel: 'name', // 左侧列表选择列的名称
        left2RightSelections: 'selections', // 左侧列表用于右侧列表选择的数据源列
        rightCheckAllText: '全选', // 右侧列表选择列表头名称
        rightKey: 'id', // 右侧列表选择列的唯一key
        rightLabel: 'name', // 右侧列表选择列的名称
        selectedValue: 'selected' // 已选择的标识属性
      })
    },
    selectProps: { // 用于选择的配置项
      type: Object, default: () => ({
        leftValue: 'checked', // 左侧列表选择列的值
        rightValue: 'checked' // 右侧列表选择列的值
      })
    },
    leftTableCols: { // 左侧列表表格列配置
      type: Array, default: () => []
    },
    rightTableCols: { // 右侧列表表格列配置
      type: Array, default: () => []
    },
    showType: { // 数据显示类型,all:显示所有;selected:显示已选择的;unselected:显示未选择的
      type: String, default: 'all'
    },
    resetAfterChecked: { // 选择后是否重置checkbox的勾选状态
      type: Boolean, default: true
    }
  },
  data() {
    return {
      // currentValue: this.value, // 绑定值当前的值
      activeLeft: null, // 左侧列表当前的选择行
      activeLeftSearch: null, // 当前左侧搜索条件
      activeRightSearch: null, // 当前右侧搜索条件
      // leftData: this.listData, // 左侧列表数据
      // leftData: [], // 左侧列表数据
      // rightData: [], // 右侧列表数据
      leftSearch: null, // 左侧搜索条件
      rightSearch: null, // 右侧搜索条件
      rightLoading: false, // 右侧列表加载动画
      dataInit: false // 数据是否已初始化
    }
  },
  computed: {
    activeRightData: { // 选择左侧行后右侧表格数据
      get() {
        // 过滤二级搜索栏条件，返回过滤后的数据
        if (!isNullOrUndefined(this.activeLeft)) {
          const filterData = this.activeLeft[this.listProps.left2RightSelections].filter(s => this.showData(s))
          return filterData
        } else {
          return []
        }
      }
    },
    activeLeftData: { // 左侧表格实时数据
      get() {
        this.initListData(this.listData) // 先初始化数据源
        // 过滤一级搜索栏条件，返回过滤后的数据
        let filterLeft = this.listData
        // 过滤左侧列表搜索数据
        if (!isNullOrUndefined(this.activeLeftSearch)) {
          filterLeft = this.listData.filter(data => data[this.listProps.leftLabel].indexOf(this.activeLeftSearch) !== -1)
        }
        filterLeft = filterLeft.filter(data => {
          return data[this.listProps.left2RightSelections].filter(s => this.showData(s)).length > 0
        })
        return filterLeft
      }
    },
    rigthTotalCount: { // 右侧数据总数
      get() {
        // let count = 0
        // this.activeLeftData.forEach(data => {
        //   count = count + this.rigthCount(data)
        // })
        // return count
        return this.sourceData.filter(s => this.showData(s)).length
      }
    },
    leftIndeterminate: { // 左侧列表不确定状态，用于实现全选的效果
      get() {
        // 选择数量大于0并且小于总数的，返回true
        if (!isNullOrUndefined(this.activeLeftData) && this.activeLeftData.length > 0) {
          const checkedCount = this.activeLeftData.filter(data => data[this.selectProps.leftValue]).length
          return checkedCount > 0 && checkedCount < this.activeLeftData.length
        }
        return false
      }
    },
    rightIndeterminate: { // 右侧列表不确定状态，用于实现全选的效果
      get() {
        // 选择数量大于0并且小于总数的，返回true
        if (!isNullOrUndefined(this.activeRightData) && this.activeRightData.length > 0) {
          const checkedCount = this.activeRightData.filter(data => data[this.selectProps.rightValue]).length
          return checkedCount > 0 && checkedCount < this.activeRightData.length
        }
        return false
      }
    },
    leftCheckAll: { // 左侧列表是否全选
      get() {
        // 选择数量等于总数的，返回true
        if (!isNullOrUndefined(this.activeLeftData) && this.activeLeftData.length > 0) {
          const checkedCount = this.activeLeftData.filter(data => data[this.selectProps.leftValue]).length
          return checkedCount === this.activeLeftData.length
        }
        return false
      },
      set(val) {
        // 执行全选状态处理
        this.handleLeftCheckAllChange(val)
      }
    },
    rightCheckAll: { // 右侧列表是否全选
      get() {
        // 选择数量等于总数的，返回true
        if (!isNullOrUndefined(this.activeRightData) && this.activeRightData.length > 0) {
          const checkedCount = this.activeRightData.filter(data => data[this.selectProps.rightValue]).length
          return checkedCount === this.activeRightData.length
        }
        return false
      },
      set(val) {
        // 执行全选状态处理
        this.handlerightCheckAllChange(val)
      }
    }
  },
  watch: {
    // currentValue: function(val) { // 绑定值当前值变化时处理函数
    //   this.$emit('input', val)
    //   this.$emit('on-change', val)
    // },
    // value: function(val) { // 绑定值变化时处理函数
    //   this.updateValue(val)
    // },
    listData: {
      handler: function(val) {
      // 为了在数据变化之后等待 Vue 完成更新 DOM，可以在数据变化之后立即使用 Vue.nextTick(callback)。这样回调函数将在 DOM 更新完成后被调用。
      // 使用this.$nextTick是为了在数据更新完成后才执行设置当前行,保证视图上的数据显示是最新了,如不使用,有可能视图上的数据还是上一次的,如:计算属性rigthTotalCount
        this.$nextTick(() => {
          this.updateListData(val)
        })
      },
      deep: true
    }
  },
  mounted() {
    // this.updateValue(this.value)
    this.updateListData(this.listData)
    // this.handleLeftCurrentChange(this.activeLeft)
    // console.log('选择第一行')
  },
  methods: {
    // /*
    // 功能：更新绑定值当前值方法
    // 参数：
    //   val：绑定值
    // */
    // updateValue(val) {
    //   this.currentValue = val
    //   // console.log(val)
    // },
    /*
    功能：初始化控件数据源
    参数：
      val：数据源
    */
    initListData(val) {
      if (this.dataInit === false) { // 未进行数据初始化处理的,先进行数据初始化
        // Vue 不允许在已经创建的实例上动态添加新的根级响应式属性 (root-level reactive property)。
        // 然而它可以使用 Vue.set(object, key, value) 方法将响应属性添加到嵌套的对象上
        // 添加对象属性 this.$set(this.data,"obj",value)

        // 如果没有指定用于选择的属性，默认创建checked属性用于绑定checkbox的选择
        if (isNullOrUndefined(this.selectProps.leftValue)) {
          this.$set(this.selectProps, 'leftValue', 'checked')
        }
        if (isNullOrUndefined(this.selectProps.rightValue)) {
          this.$set(this.selectProps, 'rightValue', 'checked')
        }
        // 如果没有指定用于标识已选择选择的属性，默认创建selected属性用于记录已选择的数据
        if (isNullOrUndefined(this.listProps.selectedValue)) {
          this.$set(this.listProps, 'selectedValue', 'selected')
        }
        // 检查是否有用于选择的属性，如没有则添加
        val.forEach(data => {
        // 左列表
          if (isNullOrUndefined(data[this.selectProps.leftValue])) {
            this.$set(data, this.selectProps.leftValue, false)
          }
          // 右列表
          data[this.listProps.left2RightSelections].forEach(s => {
            if (isNullOrUndefined(s[this.selectProps.rightValue])) {
              this.$set(s, this.selectProps.rightValue, false)
            }
            if (isNullOrUndefined(s[this.listProps.selectedValue])) {
              this.$set(s, this.listProps.selectedValue, false)
            }
          })
        })

        this.dataInit = true
      }
    },
    /*
    功能：更新控件数据源
    参数：
      val：数据源
    */
    updateListData(val) {
      this.dataInit = false // 重新设置初始化数据
      this.handleLeftCurrentChange(this.activeLeft)
      // console.log('选择第一行')
      // console.log(val)
      // this.activeLeftData = val
    },
    /*
    功能：判断是否显示数据项
    参数：
      data：判断数据
    */
    showData(data) {
      let show = true // 默认全显示
      if (!isNullOrUndefined(data[this.listProps.selectedValue])) {
        if (this.showType === 'selected') { // 只显示已选择数据
          show = data[this.listProps.selectedValue] === true
        } else if (this.showType === 'unselected') { // 只显示未选择数据
          show = data[this.listProps.selectedValue] === false
        }
        if (show) { // 如果显示,过滤右侧列表搜索数据
          // 过滤右侧列表搜索数据
          if (!isNullOrUndefined(this.activeRightSearch)) {
            show = data[this.listProps.rightLabel].indexOf(this.activeRightSearch) !== -1
          }
        }
      }
      return show // 默认全显示
    },
    /*
    功能：计算行的右侧列表数量
    参数：
      row：绑定值
    */
    rigthCount(row) {
      // 过滤二级搜索条件后返回数量
      return row[this.listProps.left2RightSelections].filter(s => this.showData(s)).length
    },
    /*
    功能：搜索按钮点击处理方法
    参数：
    */
    handleSearch() {
      this.activeLeftSearch = this.leftSearch
      this.activeRightSearch = this.rightSearch
      // let filterLeft = this.listData
      // // 过滤左侧列表搜索数据
      // if (!isNullOrUndefined(this.activeLeftSearch)) {
      //   filterLeft = this.listData.filter(data => data[this.listProps.leftLabel].indexOf(this.activeLeftSearch) !== -1)
      //   this.activeLeftData = filterLeft
      // }
      // // 过滤右侧列表搜索数据
      // if (!isNullOrUndefined(this.activeRightSearch)) {
      //   filterLeft = filterLeft.filter(data => {
      //     return data[this.listProps.left2RightSelections].filter(s => s[this.listProps.rightLabel].indexOf(this.activeRightSearch) !== -1).length > 0
      //   })
      //   this.activeLeftData = filterLeft
      // }
      // 左侧列表当前选择行
      let activeIndex = -1
      if (!isNullOrUndefined(this.activeLeft)) {
        activeIndex = this.activeLeftData.indexOf(this.activeLeft)
      }
      if (activeIndex === -1 && this.activeLeftData.length > 0) { // 如果当前选择行不在筛选后的数据中
        activeIndex = 0 // 默认显示第一个搜索到的左侧列表行
      }
      // this.activeRightData = this.activeRightData
      // 设置左侧表格的当前行
      this.$refs.leftTable.setCurrentRow(activeIndex !== -1 ? this.activeLeftData[activeIndex] : null)
    },
    /*
    功能：左侧列表当前行变化处理方法
    参数：
      row：当前行
      oldRow：旧的当前行
    */
    handleLeftCurrentChange(row, oldRow) {
      this.activeLeft = row
      if (isNullOrUndefined(this.activeLeft)) { // 如果当前行为空,判断左列表是否有数据,默认显示第一行
        if (this.activeLeftData.length > 0) {
          this.$refs.leftTable.setCurrentRow(this.activeLeftData[0]) // 默认显示第一个搜索到的左侧列表行
        }
      }
      // this.rightLoading = true
      // this.activeRightData = this.activeRightData
      // this.rightLoading = false
    },
    /*
    功能：左列表全选处理方法
    参数：
      val:选择值
    */
    handleLeftCheckAllChange(val) {
      if (!isNullOrUndefined(this.activeLeftData)) {
        this.activeLeftData.forEach(data => {
          data[this.selectProps.leftValue] = val
          data[this.listProps.left2RightSelections].forEach(s => {
            // 只处理右则筛选出来的数据
            if (isNullOrUndefined(this.activeRightSearch) || s[this.listProps.rightLabel].indexOf(this.activeRightSearch) !== -1) {
              if (this.showType === 'selected') { // 只显示已选择的
                if (s[this.listProps.selectedValue]) { // 只选择已选择的
                  s[this.selectProps.rightValue] = val
                }
              } else if (this.showType === 'unselected') { // 只显示未选择的
                if (s[this.listProps.selectedValue] === false) { // 只选择未选择的
                  s[this.selectProps.rightValue] = val
                }
              } else { // 显示所属有的,选择所有
                s[this.selectProps.rightValue] = val
              }
              // s[this.selectProps.rightValue] = val
            }
          })
        })
      }
    },
    /*
    功能：右列表全选处理方法
    参数：
      val:选择值
    */
    handlerightCheckAllChange(val) {
      if (!isNullOrUndefined(this.activeRightData)) {
        this.activeRightData.forEach(s => {
          s[this.selectProps.rightValue] = val
        })
        // 调用右列表选择处理方法，判断左侧列表当前行是否需要勾选
        this.handleRightCheckChange(val)
      }
    },
    /*
    功能：左列表选择处理方法
    参数：
      val:选择值
      row:checkbox所在行
    */
    handleLeftCheckChange(val, row) {
      row[this.listProps.left2RightSelections].forEach(s => {
        if (isNullOrUndefined(this.activeRightSearch) || s[this.listProps.rightLabel].indexOf(this.activeRightSearch) !== -1) {
          if (this.showType === 'selected') { // 只显示已选择的
            if (s[this.listProps.selectedValue]) { // 只选择已选择的
              s[this.selectProps.rightValue] = val
            }
          } else if (this.showType === 'unselected') { // 只显示未选择的
            if (s[this.listProps.selectedValue] === false) { // 只选择未选择的
              s[this.selectProps.rightValue] = val
            }
          } else { // 显示所属有的,选择所有
            s[this.selectProps.rightValue] = val
          }

          // s[this.selectProps.rightValue] = val
        }
      })
    },
    /*
    功能：右列表选择处理方法
    参数：
      val:选择值
      row:checkbox所在行
    */
    handleRightCheckChange(val) {
      if (!isNullOrUndefined(this.activeLeft)) {
        let checkedCount = 0
        let count = 0
        this.activeLeft[this.listProps.left2RightSelections].forEach(s => {
          if (this.showType === 'selected') { // 只显示已选择的
            if (s[this.listProps.selectedValue]) { // 只统计已选择的
              count = count + 1
            }
          } else if (this.showType === 'unselected') { // 只显示未选择的
            if (s[this.listProps.selectedValue] === false) { // 只统计未选择的
              count = count + 1
            }
          } else { // 显示所属有的,统计所有
            count = count + 1
          }
          // count = count + 1
          if (s[this.selectProps.rightValue]) {
            checkedCount = checkedCount + 1
          }
        })
        this.activeLeft[this.selectProps.leftValue] = checkedCount === count
      }
    },
    /*
    功能：左侧行不确定状态，用于实现全选的效果
    参数：
      row：行
    */
    leftRowIndeterminate(row) {
      if (!isNullOrUndefined(row) && row[this.listProps.left2RightSelections].length > 0) {
        const checkedCount = row[this.listProps.left2RightSelections].filter(data => data[this.selectProps.rightValue]).length
        let totalCount = 0
        if (this.showType === 'selected') { // 只显示已选择的，统计已选择的
          totalCount = row[this.listProps.left2RightSelections].filter(data => data[this.listProps.selectedValue]).length
        } else if (this.showType === 'unselected') { // 只显示未选择的，统计未选择的
          totalCount = row[this.listProps.left2RightSelections].filter(data => data[this.listProps.selectedValue] === false).length
        } else { // 显示所属有的,统计所有的
          totalCount = row[this.listProps.left2RightSelections].length
        }
        return checkedCount > 0 && checkedCount < totalCount
      }
      return false
    },
    /*
    功能：选择按钮点击处理方法
    参数：
    */
    handleSeleted() {
      // Vue 不允许在已经创建的实例上动态添加新的根级响应式属性 (root-level reactive property)。
      // 然而它可以使用 Vue.set(object, key, value) 方法将响应属性添加到嵌套的对象上
      // 添加对象属性 this.$set(this.data,"obj",value)
      // 删除对象属性 this.$delete(this.data,"obj")
      this.listData.forEach(data => {
        if (this.resetAfterChecked) {
          // 重置checked属性为false
          this.$set(data, this.selectProps.leftValue, false)
        }
        data[this.listProps.left2RightSelections].forEach(s => {
          if (isNullOrUndefined(s[this.listProps.selectedValue])) { // 如没有已选择标识属性,默认设置为未选择
            this.$set(s, this.listProps.selectedValue, false)
          }
          if (this.showType === 'selected') { // 只显示已选择的
            if (s[this.listProps.selectedValue]) { // 重置已选择数据的已选择标识属性,属性值与checked相反
              this.$set(s, this.listProps.selectedValue, s[this.selectProps.rightValue] !== true)
            }
          } else if (this.showType === 'unselected') { // 只显示未选择的
            if (s[this.listProps.selectedValue] === false) { // 重置未选择数据的已选择标识属性,属性值与checked一致
              this.$set(s, this.listProps.selectedValue, s[this.selectProps.rightValue] === true)
            }
          } else { // 显示所属有的,重置已选择标识属性,属性值与checked一致
            this.$set(s, this.listProps.selectedValue, s[this.selectProps.rightValue] === true)
          }
          if (this.resetAfterChecked) {
            // 重置checked属性为false
            this.$set(s, this.selectProps.rightValue, false)
          }
        })
      })
      console.log(this.listData)
      this.$emit('seleted')
    }
  }
}
</script>
<style lang='scss' scoped>
//   .el-row {
//     margin-bottom: 10px;
//     &:last-child {
//       margin-bottom: 0;
//     }
//   }
  .el-table__row>td{//去掉表格边框
	border: none;
}
  .el-table::before {//去掉最下面的那一条线
	height: 0px;
}
  th.gutter { // 设置左侧滚动条表头部分与左侧表头底色一致
  background: rgb(210, 228, 255);
  border-bottom: 1px solid #EBEEF5;
}
  .el-table__header{ // 设置右侧滚动条表头部分与左侧表头底色一致
  background: rgb(210, 228, 255);
  border-bottom: 1px solid #EBEEF5;
}
  .leftTableStyle{
  background-color: #F6F6F6;
}
#leftTable  .el-table__body tr.current-row>td {
  background-color: #FFFFFF !important;
}
#leftTable  .el-table--enable-row-hover .el-table__body tr:hover>td {
  // background-color: #ecf5ff;
  background-color: #FFFFFF;
}
#leftTable  .el-table__fixed-body-wrapper { // 修改指定元素leftTable的全局样式.el-table__fixed-body-wrapper
  background-color: #F6F6F6;
}
</style>
