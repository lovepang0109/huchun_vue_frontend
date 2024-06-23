/**
 * 通用工具类
 * Youngber
 * 20200415
 */
class Common {
  /**
 * 格式化时间
 *@param{*}datatime 包含时间信息的对象
 *@return {*} 返回yyyy-MM-dd HH:mm:ss格式的时间
*/
  static formatDateTime(datatime) {
    if (datatime === undefined || datatime === null) {
      return ''
    }
    var stamp = Date.parse(datatime)
    var newDate = new Date(stamp)
    var year = newDate.getFullYear()
    var month = newDate.getMonth() + 1
    var date = newDate.getDate()
    var h = newDate.getHours()
    var m = newDate.getMinutes()
    var s = newDate.getSeconds()
    var formatMonth = month
    if (month < 10) {
      formatMonth = '0' + month
    }
    var formatDate = date
    if (date < 10) {
      formatDate = '0' + date
    }
    var formatHour = h
    if (h < 10) {
      formatHour = '0' + h
    }
    var formatMinute = m
    if (m < 10) {
      formatMinute = '0' + m
    }
    var formatSecond = s
    if (s < 10) {
      formatSecond = '0' + s
    }
    var result = year + '-' + formatMonth + '-' + formatDate + ' ' + formatHour + ':' + formatMinute + ':' + formatSecond
    return result
  }
}

export default Common
