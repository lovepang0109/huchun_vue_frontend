//子组件
<template>
  <div />
</template>

<script>
export default {
  methods: {
    importExcel(res) {
      const that = this
      this.file = res.file
      var rABS = false // 是否将文件读取为二进制字符串
      var f = this.file
      var reader = new FileReader()
      FileReader.prototype.readAsBinaryString = function(f) {
        var binary = ''
        var rABS = false // 是否将文件读取为二进制字符串
        var wb // 读取完成的数据
        var outdata
        var reader = new FileReader()
        reader.onload = function() {
          var bytes = new Uint8Array(reader.result)
          var length = bytes.byteLength
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          var XLSX = require('xlsx')
          if (rABS) {
            wb = XLSX.read(btoa(fixdata(binary)), { type: 'base64' }) // 手动转化
          } else {
            wb = XLSX.read(binary, { type: 'binary' })
          }
          outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
          const arr = []
          outdata.map(v => {
            const obj = {}
            for (var i = 0; i < res.tHeader.length; i++) {
              obj[ res.filterVal[i] ] = v[ res.tHeader[i] ]
            }
            arr.push(obj)
          })
          that.$emit('importRequest', arr) // 将处理好的json表格数据传给父组件
        }
        reader.readAsArrayBuffer(f)
      }
      if (rABS) {
        reader.readAsArrayBuffer(f)
      } else {
        reader.readAsBinaryString(f)
      }
    },
    exportExcel(res, isFormat) {
      require.ensure([], () => {
        const { export_json_to_excel } = require('@/vendor/Export2Excel')// 引入文件
        let data = res.data
        if (isFormat === false) {
          data = this.formatJson(res.filterVal, res.data) // 想要导出的数据
        }
        export_json_to_excel(res.tHeader, data, res.title)
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }
  }
}
function fixdata(data) { // 文件流转BinaryString
  var o = ''
  var l = 0
  var w = 10240
  for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
  o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
  return o
}
</script>
