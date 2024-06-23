<!--表格组件 -->
<template>
  <div id="table-container" class="table-container">
    <!-- 搜索框 -->
    <section v-if="isSearchHandle" ref="searchSetion" class="table-header-padding" style="display:{isHideSearchPanel}">
      <el-form id="searchForm" :size="searchFormSize" inline :label-width="searchFormLabelWidth">
        <el-form-item v-for="item in searchFormItems" :key="item.prop" :label="item.label" :label-width="searchFormLabelWidth">
          <!-- 输入框 -->
          <el-input
            v-if="item.type==='Input'"
            v-model="searchData[item.prop]"
            :size="item.size"
            :placeholder="item.placeholder"
            :prefix-icon="item.prefixicon"
            :class="item.class"
            :style="item.style"
            :type="item.inputType"
            :min="item.min"
            @blur="item.blur && item.blur(that)"
            @focus="item.focus && item.focus(that)"
          />
          
          <el-select
            v-if="item.type==='Select'"
            v-model="searchData[item.prop]"
            clearable
            filterable
            :placeholder="item.placeholder"
            :size="item.size"
            :class="item.class"
            :style="item.style"
          >
            <el-option v-for="op in item.options" :key="op.value" :label="op.label" :value="op.value" />
          </el-select>
          <!-- 单选 -->
          <el-radio-group
            v-if="item.type==='Radio'"
            v-model="searchData[item.prop]"
            :class="item.class"
            :style="item.style"
          >
            <el-radio v-for="ra in item.radios" :key="ra.value" :label="ra.value">{{ ra.label }}</el-radio>
          </el-radio-group>
          <!-- 单选按钮 -->
          <el-radio-group
            v-if="item.type==='RadioButton'"
            v-model="searchData[item.prop]"
            :class="item.class"
            :style="item.style"
            @change="item.change && item.change(that,searchData[item.prop])"
          >
            <el-radio-button v-for="ra in item.radios" :key="ra.value" :label="ra.value">{{ ra.label }}</el-radio-button>
          </el-radio-group>
          <!-- 复选框 -->
          <el-checkbox
            v-if="item.type==='Checkbox'"
            v-model="searchData[item.prop]"
            :class="item.class"
            :style="item.style"
            @change="item.change && item.change(that,searchData[item.prop])"
          >
            {{ item.checkboxLabel }}
          </el-checkbox>
          <!-- 复选框组 -->
          <el-checkbox-group
            v-if="item.type==='CheckboxGroup'"
            v-model="searchData[item.prop]"
            :class="item.class"
            :style="item.style"
            @change="item.change && item.change(that,searchData[item.prop])"
          >
            <el-checkbox v-for="ch in item.checkboxs" :key="ch.value" :label="ch.value">{{ ch.label }}</el-checkbox>
          </el-checkbox-group>
          <!-- 日期 -->
          <el-date-picker
            v-if="item.type==='Date'"
            v-model="searchData[item.prop]"
            :class="item.class"
            :style="item.style"
          />
          <!-- 时间 -->
          <el-time-select
            v-if="item.type==='Time'"
            v-model="searchData[item.prop]"
            type=""
            :class="item.class"
            :style="item.style"
          />
          <!-- 日期时间 -->
          <el-date-picker
            v-if="item.type==='DateTime'"
            v-model="searchData[item.prop]"
            type="datetime"
            :disabled="item.disable && item.disable(that,searchData[item.prop])"
            :class="item.class"
            :style="item.style"
          />
          <!-- 滑块 -->
          <!-- <el-slider v-if="item.type==='Slider'" v-model="searchData[item.prop]"></el-slider> -->
          <!-- 开关 -->
          <el-switch
            v-if="item.type==='Switch'"
            v-model="searchData[item.prop]"
            :class="item.class"
            :style="item.style"
          />
        </el-form-item>
        <el-form-item v-for="item in searchHandle" :key="item.label">
          <el-button
            :id="item.id"
            :type="item.type"
            :icon="item.icon"
            :size="item.size || searchFormSize"
            :style="item.style"
            :class="item.class"
            :disabled="item.isReadOnly"
            @click="handleButtonClick(that,item)"
          >{{ item.label }}</el-button>
        </el-form-item>
      </el-form>
    </section>
    <!-- 数据表格 -->
    <section>
      <el-table
        ref="cesTable"
        v-loading="loading"
        highlight-current-row
        :style="tableStyle"
        :height="tableHeight"
        :header-cell-style="{background:'#D2E4FF',color:'#606266',fontSize:'16px'}"

        :data="tableData"
        :size="tableSize"
        :border="isBorder"
        :default-selections="defaultSelections"
        :row-key="(!tableAttributes || !tableAttributes.rowKey) ? '' : tableAttributes.rowKey"
        :lazy="(!tableAttributes || !tableAttributes.lazy) ? false : tableAttributes.lazy"
        :load="(!tableAttributes || !tableAttributes.load) ? null : (row, treeNode, resolve) => tableAttributes.load(that, row, treeNode, resolve)"
        :tree-props="(!tableAttributes || !tableAttributes.treeProps) ? { hasChildren: 'hasChildren', children: 'children' } : tableAttributes.treeProps"
        :row-class-name="(!tableAttributes || !tableAttributes.rowClassName) ? null : ({row, rowIndex}) => tableAttributes.rowClassName({row, rowIndex})"
        @select="select"
        @select-all="selectAll"
        @row-click="rowClick"
        @row-dbclick="rowDoubleClick"
      >
        <!-- 复选框Checkbox -->
        <el-table-column
          v-if="selectionCol!==null"
          v-show="showSelection"
          type="selection"
          :label="selectionCol.label"
          :align="selectionCol.align"
          :width="selectionCol.width"
          :selectable="!selectionCol.rowSelectAble?null:(row, rowIndex) => selectionCol.rowSelectAble(that,row, rowIndex)"
          :render-header="isRenderHeader ? renderHeader : null"
        />
        <!-- 索引列 -->
        <el-table-column
          v-if="indexCol!==null"
          v-show="showIndex"
          type="index"
          :label="indexCol.label"
          :align="indexCol.align"
          :width="indexCol.width"
          :render-header="isRenderHeader ? renderHeader : null"
        />
        <!-- 数据栏 -->
        <el-table-column
          v-for="item in visibleTableCols"
          :key="item.id"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :align="item.align"
          :render-header="isRenderHeader ? renderHeader : null"
          :fixed="item.fixed"
          :show-overflow-tooltip="item.showOverflowTooltip"
        >
          <template slot-scope="scope">
            <!-- html -->
            <span v-if="item.type==='html'" v-html="item.html(that,scope.row)" />
            <!-- 按钮 -->
            <span v-if="item.type==='button'">
              <span
                v-for="(btn,i) in item.btnList"
                :key="i"
              >
                <i
                  v-if="btn.isUseIcon"
                  v-show="(scope.row[btn.prop]===null && btn.style.includes('pointer')) || (scope.row[btn.prop]==='disabled' && btn.style.includes('not-allowed'))"
                  :style="btn.style"
                  :class="btn.iconClass"
                  :title="btn.label"
                  @click="handleRowButtonClick(that,scope.row,btn)"
                />
                <el-button
                  v-else
                  v-show="!btn.show || btn.show(that,scope.row)"
                  :disabled="scope.row[btn.prop]"
                  :type="btn.type || 'text'"
                  :size="btn.size || tableSize"
                  :icon="btn.icon"
                  :style="btn.style"
                  :class="btn.class"
                  @click="handleRowButtonClick(that,scope.row,btn)"
                >{{ btn.label }}</el-button>
                <span
                  v-show="(scope.row[btn.prop]===null && btn.style.includes('pointer') && (i < item.btnList.length-3)) || (scope.row[btn.prop]==='disabled' && btn.style.includes('not-allowed') && (i < item.btnList.length-3))"
                  style="margin-left:5px;margin-right:5px;"
                >|</span>
                <!-- <span
                  v-show="(!btn.show || btn.show(that,scope.row)) && (btn.type===undefined || btn.type==='text') && (i < item.btnList.length-1)"
                  style="margin-left:5px;margin-right:5px;"
                >|</span> -->
              </span>
            </span>
            <!-- 输入框 -->
            <el-input
              v-if="item.type==='input'"
              v-model="scope.row[item.prop]"
              :size="tableSize || btn.size"
              :disabled="item.isDisabled && item.isDisabled(that,scope.row)"
              @focus="item.focus && item.focus(that,scope.row)"
            />
            <!-- 下拉框 -->
            <el-select
              v-if="item.type==='select'"
              v-model="scope.row[item.prop]"
              :size="tableSize || btn.size"
              :props="item.props"
              :disabled="item.isDisabled && item.isDisabled(that,scope.row)"
              @change="item.change && item.change(that,scope.row)"
            >
              <el-option v-for="op in item.options" :key="op.value" :label="op.label" :value="op.value" />
            </el-select>
            <!-- 单选 -->
            <el-radio-group
              v-if="item.type==='radio'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(that,scope.row)"
              :size="tableSize || btn.size"
              @change="item.change && item.change(that,scope.row)"
            >
              <el-radio v-for="ra in item.radios" :key="ra.value" :label="ra.value">{{ ra.label }}</el-radio>
            </el-radio-group>
            <!-- 复选框 -->
            <el-checkbox-group
              v-if="item.type==='checkbox'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(that,scope.row)"
              :size="tableSize || btn.size"
              @change="item.change && item.change(that,scope.row)"
            >
              <el-checkbox v-for="ra in item.checkboxs" :key="ra.value" :label="ra.value">{{ ra.label }}</el-checkbox>
            </el-checkbox-group>
            <!-- 评价 -->
            <el-rate
              v-if="item.type==='rate'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(that,scope.row)"
              :size="tableSize || btn.size"
              @change="item.change && item.change(that,scope.row)"
            />
            <!-- 开关 -->
            <el-switch
              v-if="item.type==='switch'"
              v-model="scope.row[item.prop]"
              :size="tableSize || btn.size"
              :active-value="item.values&&item.values[0]"
              :inactive-value="item.values&&item.values[1]"
              :disabled="item.isDisabled && item.isDisabled(that,scope.row)"
              @change="item.change && item.change(that,scope.row)"
            />
            <!-- 图像 -->
            <el-image
              v-if="item.type==='image'"
              :style="item.style"
              :class="item.class"
              :src="item.prop ? scope.row[item.prop] : item.src && item.src(that,scope.row)"
              :fit="item.fit"
              :preview-src-list="item.preview && item.preview(that,scope.row)"
              :z-index="item.zIndex ? item.zIndex : 3001"
              @click="item.handle && item.handle(that,scope.row)"
            >
              <div
                v-if="!item.placeholder"
                slot="placeholder"
                class="image-slot"
              >
                {{ item.placeholder }}<span class="dot">...</span>
              </div>
              <div
                v-if="!item.error"
                slot="error"
                class="image-slot"
                style="height:100%;font-size: 30px;display: flex;align-items: center;justify-content: center;"
              >
                <i class="el-icon-picture-outline" />
              </div>
            </el-image>
            <!-- 滑块 -->
            <el-slider
              v-if="item.type==='slider'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(that,scope.row)"
              :size="tableSize || btn.size"
              @change="item.change && item.change(that,scope.row)"
            />
            <!-- svg-icon -->
            <span
              v-if="item.type==='icon'"
            >
              <span
                v-if="!item.showIconLabel"
              >
                <svg-icon
                  v-for="icon in (item.getIcons? item.getIcons(that,scope.row):item.icons) "
                  :key="icon.label"
                  :icon-class="icon.iconClass"
                  :class="icon.class"
                  :style="icon.style"
                />
              </span>
              <span
                v-if="item.showIconLabel"
              >
                <span
                  v-for="(icon,i) in (item.getIcons? item.getIcons(that,scope.row):item.icons) "
                  :key="icon.label"
                  :icon-class="icon.iconClass"
                  :class="icon.class"
                  :style="icon.style"
                >
                  <span
                    v-show="i>0"
                    style="margin-left:5px;margin-right:5px;"
                  >|</span>
                  {{ icon.label }}
                </span>
              </span>
            </span>
            <!-- 默认 -->
            <span
              v-if="!item.type || item.formatter"
              :style="item.itemStyle && item.itemStyle(that,scope.row)"
              :size="tableSize || btn.size"
              :class="item.itemClass && item.item.itemClass(that,scope.row)"
            >{{ (item.formatter && item.formatter(that,scope.row)) || scope.row[item.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <!-- 表格操作按钮 -->
    <section v-if="isHandle" ref="btnSetion" class="table-main-padding">
      <el-button
        v-for="item in tableHandles"
        :key="item.label"
        :size="tableSize || item.size"
        :type="item.type"
        :icon="item.icon"
        :disabled="isReadOnly"
        :style="item.style"
        :class="item.class"
        @click="handleButtonClick(that,item)"
      >{{ item.label }}</el-button>
    </section>
    <!-- 分页 -->
    <section v-if="isPagination" ref="pageSetion" class="table-footer-padding">
      <el-pagination
        style="display: flex;justify-content: flex-end;height: 100%;align-items: flex-end;margin-top: 10px;margin-right: 10px;"
        layout="total,sizes ,prev, pager, next,jumper"
        background
        :page-size="tablePage.pageSize"
        :page-sizes="tablePage.sizes"
        :current-page="tablePage.pageNum"
        :total="tablePage.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </section>
  </div>
</template>

<script>
debugger
// import waves from '@/directive/waves'
// import { Message, MessageBox } from 'element-ui'
import { isNullOrUndefined } from '@core/utils/index'

export default {
  // directives: { waves },
  props: {
    // 控件相关属性
    that: { type: Object, default: this }, // 组件父组件对象
    // 搜索框相关属性
    isSearchHandle: { type: Boolean, default: true }, // 是否显示搜索框
    searchFormSize: { type: String, default: 'medium' }, // 搜索框大小型号：mini,medium,small
    searchFormLabelWidth: { type: String, default: '110px' }, // 表单域标签的宽度
    searchFormItems: { type: Array, default: () => [] }, // 搜索框输入配置项
    searchHandle: { type: Array, default: () => [] }, // 搜索框按钮配置项
    searchData: { type: Object, default: () => {} }, // 搜索框数据
    // 表格相关属性
    tableData: { type: Array, default: () => [] }, // 表格数据
    defaultSelections: { type: [Array, Object], default: () => null }, // 默认选择数据
    tableCols: { type: Array, default: () => [] }, // 表格列配置
    showSelection: { type: Boolean, default: true }, // 是否显示表格复选框
    selectionCol: { type: Object, default: () => null }, // 表格复选框列
    showIndex: { type: Boolean, default: true }, // 是否显示表格索引列
    indexCol: { type: Object, default: () => null }, // 表格索引列
    // indexLabel: { type: String, default: '序号' }, // 表格索引列名称
    isBorder: { type: Boolean, default: true }, // 表格是否显示边框
    loading: { type: Boolean, default: false }, // 表格是否显示加载数据动画
    tableSize: { type: String, default: 'medium' }, // 表格大小型号：mini,medium,small
    tableStyle: { type: String, default: '' }, // 表格样式
    // rowKey: { type: String, default: ' ' }, // 表格行数据的 Key
    // lazy: { type: Boolean, default: false }, // 表格是否懒加载子节点数据
    // load: { type: Function, default: () => null }, // 加载子节点数据的函数
    // treeProps: { type: Object, default: () => ({ hasChildren: 'hasChildren', children: 'children' }) }, // 表格渲染嵌套数据的配置选项
    tableAttributes: { type: Object, default: () => null }, // 表格属性设置
    tableHeightOffset: { type: Number, default: 122 }, // 表格高度补偿，表格实际高度会减去该补偿
    // 表格操作相关属性
    isHandle: { type: Boolean, default: false }, // 是否显示表格操作框
    tableHandles: { type: Array, default: () => [] }, // 操作框配置项
    isReadOnly: { type: Boolean, default: false }, // 菜单权限是否只读
    // 分页栏相关属性
    isPagination: { type: Boolean, default: true }, // 是否显示分页
    tablePage: { type: Object, default: () => ({ pageSize: 20, sizes: [10, 20, 30, 40, 50, 100], pageNum: 1, total: 0 }) }, // 分页数据
    isHideSearchPanel: { type: String, default: '' }, // 是否隐藏搜索框
    isRenderHeader: { type: Boolean, default: false }, // 是否让表的内容不转行，比如设备管理界面，字段比较多，通过设置isRenderHeader为true,加宽列宽度，使内容不转行，但会出现横滚动条
    isEditDisabled: { type: String, default: '' }, // 编辑按钮是否可用
    isDeleteDisabled: { type: String, default: '' } // 删除按钮是否可用
  },
  data() {
    return {
      tableHeight: 0
    }
  },
  computed: {
    visibleTableCols: { // 显示的表格列
      get() {
        var a = this.tableCols.filter(c => isNullOrUndefined(c.visible) || c.visible === true || ((typeof c.visible) === 'function' && c.visible(this.that)))
        if (this.isRenderHeader) {
          const columns = calcColumnsWidth(a, this.tableData)
          a = columns
        }
        return a
      }
    },
    isReadOnlyResult: {
      get() {
        if (this.isEditDisabled === 'disabled' || this.isDeleteDisabled === 'disabled') {
          return true
        } else {
          return false
        }
      }
    }
  },
  watch: {
    // 监听defaultSelections属性变化的处理函数
    'defaultSelections'(val) {
      this.$nextTick(function() { // this.$nextTick表示在defaultSelections属性变化后执行
        if (Array.isArray(val)) {
          val.forEach(row => {
            this.$refs.cesTable.toggleRowSelection(row)
          })
        } else {
          this.$refs.cesTable.toggleRowSelection(val)
        }
      })
    },
    // 监听分页的总记录数
    'tablePage.total': function(val) {
      // console.log(`总记录数:${val}`)
      this.$nextTick(function() {
        // console.log(this.tablePage.pageNum)
        // console.log((this.tablePage.pageNum - 1) * this.tablePage.pageSize)
        // 如果当前页码大于1，并且总记录数少于（当前页码-1）*每页数量，说明当前页码有误，重新设置当前页码为1后再刷新数据
        if (this.tablePage.pageNum > 1 && (val <= (this.tablePage.pageNum - 1) * this.tablePage.pageSize)) {
          // console.log('重新设置当前页码为1')
          this.tablePage.pageNum = 1
          if (val > 0) { // 如果总记录数大于0 重新刷新数据
            // console.log('重新刷新数据')
            this.$emit('refresh') // 触发控件自定义事件refresh
          }
        }
      })
    }
  },
  created() {
    window.onresize = () => {
      this.setTableHeight()
    }
    this.setTableHeight()
  },
  methods: {
    // 表头部重新渲染
    renderHeader(h, { column, $index }) {
      // 新建一个 span
      const span = document.createElement('span')
      // 设置表头名称
      span.innerText = column.label
      // 临时插入 document
      document.body.appendChild(span)
      // 重点：获取 span 最小宽度，设置当前列，注意这里加了 20，字段较多时还是有挤压，且渲染后的 div 内左右 padding 都是 10，所以 +20 。（可能还有边距/边框等值，需要根据实际情况加上）
      column.minWidth = span.getBoundingClientRect().width + 35
      // 移除 document 中临时的 span
      document.body.removeChild(span)
      return h('span', column.label)
    },
    // 设置表格高度
    setTableHeight() {
      this.$nextTick(function() {
        var searchSetionHeight = 0 // 搜索栏高度
        var btnSetionHeight = 0 // 操作按钮高度
        var pageSetionHeight = 0 // 分页高度
        if (!isNullOrUndefined(this.$refs.searchSetion)) {
          searchSetionHeight = this.$refs.searchSetion.offsetHeight
        }
        if (!isNullOrUndefined(this.$refs.btnSetion)) {
          btnSetionHeight = this.$refs.btnSetion.offsetHeight
        }
        if (!isNullOrUndefined(this.$refs.pageSetion)) {
          pageSetionHeight = this.$refs.pageSetion.offsetHeight
        }
        this.tableHeight = window.innerHeight - searchSetionHeight - btnSetionHeight - pageSetionHeight - this.tableHeightOffset
        this.setTableWapperHeight()
      })
    },
    // 设置表格内容框高度，用于解决隐藏显示切换表格时表格会有留白的Bug（el-table__body-wrapper变小）
    setTableWapperHeight() {
      // 通过原生方法，获取dom节点的高度------获取element-ui table表格body的元素
      const wapper = window.document.getElementsByClassName('el-table__body-wrapper')
      // 通过原生方法，获取dom节点的高度------获取element-ui table表格header的元素
      const header = window.document.getElementsByClassName('el-table__header-wrapper')
      // 必须加延时，要不然赋不上去值
      setTimeout(() => {
        // 通过上边计算得到的table高度的value值，减去table表格的header高度，剩下的通过dom节点直接强行赋给table表格的body
        if (wapper.length > 0) {
          wapper[0].style.height = (this.tableHeight - header[0].clientHeight) + 'px'
        }
        // console.log(wapper[0].style.height)
      }, 10)
    },
    // 表格相关事件处理方法
    select(selection, row) { // 表格勾选处理方法
      this.$emit('rowSelect', selection, row) // 触发控件自定义事件rowSelect
    },
    selectAll(selection) { // 表格全选处理方法
      this.$emit('rowSelectAll', selection) // 触发控件自定义事件rowSelectAll
    },
    rowClick(row) { // 表格单击处理方法
      this.$emit('rowClick', row) // 触发控件自定义事件rowClick
    },
    rowClassName({ row, rowIndex }) {
      this.$emit('rowClassName', { row, rowIndex })
      // if (rowIndex === 1) {
      //   return 'warning-row'
      // } else if (rowIndex === 3) {
      //   return 'success-row'
      // }
      // return ''
    },
    rowDoubleClick(row) { // 表格双击处理方法
      this.$emit('rowDoubleClick', row) // 触发控件自定义事件rowDoubleClick
    },
    // 分页栏相关事件处理方法
    handleCurrentChange(val) { // 分页栏当前页码变化处理方法
      this.tablePage.pageNum = val
      this.$emit('refresh') // 触发控件自定义事件refresh
    },
    handleSizeChange(val) { // 分页栏每页数据数量变化处理方法
      this.tablePage.pageSize = val
      this.$emit('refresh') // 触发控件自定义事件refresh
    },
    // renderHeader(h, obj) { // 列标题 Label 区域渲染使用的 Function
    //   return h('span', { class: 'ces-table-require' }, obj.column.label)
    // },
    handleRowButtonClick(that, row, btn) { // 行按钮点击事件处理方法
      if (btn.style.includes('not-allowed')) {
        return
      }
      if (btn.needConfirmDel === true) { // 判断按钮是否需要确认删除
        const delName = isNullOrUndefined(btn.confirmProp) ? '该条记录' : '【' + row[btn.confirmProp] + '】'
        MessageBox.confirm('此操作将永久删除' + delName + ', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // Message.success('确定删除')
          btn.handle(that, row)
        }).catch(() => {
          // Message.info('取消删除')
        })
      } else if (btn.needConfirm === true) { // 判断按钮是否需要确认
        MessageBox.confirm(isNullOrUndefined(btn.confirmText) ? '是否执行该操作？' : btn.confirmText, isNullOrUndefined(btn.confirmTitle) ? '提示' : btn.confirmTitle, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          btn.handle(that, row)
        }).catch(() => {
        })
      } else {
        btn.handle(that, row)
      }
    },
    handleButtonClick(that, btn) { // 按钮点击事件处理方法
      if (btn.needSelect === true) { // 判断按钮是否需要选择行记录
        const rows = this.$refs.cesTable.selection
        if (rows === null || rows.length === 0) {
          Message.error('Please select some rows！')
        } else {
          if (btn.needConfirmDel === true) { // 判断按钮是否需要确认删除
            MessageBox.confirm('This operation will delete the records, Do you want to continue?', 'Tips', {
              confirmButtonText: 'Comfirm',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              btn.handle(that, rows)
            }).catch(() => {
            })
          } else if (btn.needConfirm === true) { // 判断按钮操作是否需要确认
            MessageBox.confirm(isNullOrUndefined(btn.confirmText) ? 'Whether to execute this operation？' : btn.confirmText, isNullOrUndefined(btn.confirmTitle) ? 'Tips' : btn.confirmTitle, {
              confirmButtonText: 'Comfirm',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              btn.handle(that, rows)
            }).catch(() => {
            })
          } else {
            btn.handle(that, rows)
          }
        }
      } else {
        btn.handle(that)
      }
    },
    /**
     * @author: Hayden
     * @Date: 2020-02-13 14:56:54
     * @function: 取消表格的行选择
     * @description:
     * @param {type}
     * @return:
     */
    clearSelection() {
      this.$refs.cesTable.clearSelection()
    }
  }
}

function calcColumnsWidth(columns, tableArr) {
  columns.forEach((item) => {
    if (item.label === 'Operation') {
      item.width = 15 * window.screen.availWidth / 110
    } else {
      if (item.minWidth.length === 2) {
        item.width = item.minWidth.substr(0, 1) * window.screen.availWidth / 107
      } else {
        item.width = item.minWidth.substr(0, 2) * window.screen.availWidth / 107
      }
    }
  })
  return columns
}
</script>

<style lang='scss' scoped>
  .table-container{
    background:rgba(255,255,255,1);
    opacity:1;
    border-radius:10px 10px 10px 10px;
    padding-bottom: 10px;
    width: 100%;
  }
  .table-header-padding{
    padding-top: 18px;
    // padding-left: 10px;
    // padding-right: 10px;
  }
  .table-main-padding{
    padding-left: 10px;
    padding-right: 10px;
  }
  .table-footer-padding{
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
  }
</style>
