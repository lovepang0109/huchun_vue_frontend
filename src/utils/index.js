/**
 * Created by wen on 19/10/16.
 */

// import { isNullOrUndefined } from 'util'
import enums from '@/utils/enums';
import moment from 'moment';
import { toast } from 'vue3-toastify';
// 生成随机 GUID 数
export function guid() {
  var guid = ''
  for (var i = 1; i <= 32; i++) {
    var n = Math.floor(Math.random() * 16.0).toString(16)
    guid += n
    if ((i === 8) || (i === 12) || (i === 16) || (i === 20)) { guid += '-' }
  }
  return guid
}
// 判断字符是否为空的方法
export function isEmpty(obj) {
  if (typeof obj === 'undefined' || obj === null || obj === '') {
    return true
  } else {
    return false
  }
}
// 格式化时间格式(用于导出)
export function formatDateTime(dateData) {
  if (dateData === undefined || dateData === null || dateData === '') {
    return ''
  }
  return moment(dateData).format('YYYY-MM-DD HH:mm:ss')
}
// 格式化时间格式(用于导出)
export function formatDate(dateData) {
  if (dateData === undefined || dateData === null || dateData === '') {
    return ''
  }
  return moment(dateData).format('YYYY-MM-DD')
}
// 获取当前时间
export function getCurrentTime() {
  var date = new Date()
  var result = new Date(+date + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
  return result
}
// 处理时区
export function cancelTimeZone(date) {
  var result = new Date(+date + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
  return result
}
/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
}
/** 对象转换为Options选择数据
 * @param {Object} data
 * @param {string} lable
 * @param {string} value
 * @returns {Array}
 */
export function obj2Options(data, lable, value) {
  var arr = []
  if (data) {
    var len = data.length
    for (var i = 0; i < len; i++) {
      arr[i] = [] // js中二维数组必须进行重复的声明，否则会undefind
      arr[i]['label'] = data[i][lable]
      arr[i]['value'] = data[i][value]
    }
  }
  return arr
}

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(',')
  var mime = arr[0].match(/:(.*?);/)[1]
  var bstr = atob(arr[1])
  var n = bstr.length
  var u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function imgToBase64(url) {
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  var img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = url
  canvas.height = img.height
  canvas.width = img.width
  ctx.drawImage(img, 0, 0)
  var dataURL = canvas.toDataURL('image/png')
  canvas = null
  return dataURL
}

/**
 * @author: Hayden
 * @Date: 2020-02-05 16:43:55
 * @function: 将file对象转换成base64
 * @description:
 * @param {file：文件对象
 * callback：回调方法}
 * @return:
 */
export function fileToBase64(file, callback) {
  var reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = function() {
    callback(reader.result) // 获取到base64格式图片
  }
}
/**
 * @author: Hayden
 * @Date: 2020-02-05 17:22:30
 * @function: 将blob流转换成base64
 * @description:
 * @param {blob：blob流
 * callback：回调方法}
 * @return:
 */
export function blobToBase64(blob, callback) {
  var reader = new FileReader()
  reader.readAsDataURL(blob)
  reader.onload = function(e) {
    callback(e.target.result)// 获取到base64格式图片
  }
}

/**
 * @author: Hayden
 * @Date: 2020-01-09 20:19:49
 * @function: 将对象合并后返回一个包括所有对象属性的新对象
 * @description:
 * @param {type}
 * @return:
 */
export function mergeObjects(objs) {
  var returnObject = {}
  objs.forEach(obj => {
    Object.keys(obj).forEach(key => {
      returnObject[key] = obj[key]
    })
  })
  return returnObject
}

/**
 * @author: Hayden
 * @Date: 2020-01-10 14:51:01
 * @function: 根据字典字段值获取对应的显示名称
 * @description:
 * @param {type}
 * @return:
 */
export function getDictionaryItemDisplayName(items, value) {
  
  const item = items.find(s => s.value === String(value))
  // return isNullOrUndefined(item) ? value : item.displayName
  return item ? value : item.displayName
}
/**
 * @author: Wen
 * @Date: 2020-05-15 14:51:01
 * @function: showDerviceIcon
 * @description:根据设备类型，设备状态动态生成图标
 * @param {state：设备状态值 derviceType：设备类型}
 * @return:返回设备状态图标IconName
 */
export function showDerviceIcon(state, derviceType) {
  var IconName = 'dashboard'
  switch (derviceType) {
    case enums.deviceTypeEnum.Controller.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain.value)) {
        IconName = 'ncu_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'ncu_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'ncu_open'
      } else {
        IconName = 'ncu_open'
      }
      break
    case enums.deviceTypeEnum.LocalController.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain.value)) {
        IconName = 'cp_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'cp_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'cp_open'
      } else {
        IconName = 'cp_open'
      }
      break
    case enums.deviceTypeEnum.FireInput.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain.value)) {
        IconName = 'fai_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'fai_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.DoorState.value)) {
        IconName = 'fai_open'
      } else if (!Contains(state, enums.deviceStatesEnum.DoorState.value)) {
        IconName = 'fai_close'
      } else {
        IconName = 'fai_close'
      }
      break
    case enums.deviceTypeEnum.AuxiliaryInput.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain)) {
        IconName = 'ai_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'ai_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.DoorState.value)) {
        IconName = 'ai_open'
      } else if (!Contains(state, enums.deviceStatesEnum.DoorState.value)) {
        IconName = 'ai_close'
      } else {
        IconName = 'ai_close'
      }
      break
    case enums.deviceTypeEnum.AuxiliaryOutput.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain)) {
        IconName = 'ao_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'ao_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.DoorState.value)) {
        IconName = 'ao_open'
      } else if (!Contains(state, enums.deviceStatesEnum.DoorState.value)) {
        IconName = 'ao_close'
      } else {
        IconName = 'ao_close'
      }
      break
    case enums.deviceTypeEnum.Door.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain.value)) {
        IconName = 'door_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'door_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.DoorState.value) || Contains(state, enums.deviceStatesEnum.StayOpen.value)) {
        IconName = 'door_open'
      } else if (!Contains(state, enums.deviceStatesEnum.DoorState.value) || Contains(state, enums.deviceStatesEnum.StayClose.value)) {
        IconName = 'door_close'
      } else {
        IconName = 'door_close'
      }
      break
    case enums.deviceTypeEnum.Reader.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain.value)) {
        IconName = 'card_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'card_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'card_open'
      } else {
        IconName = 'card_open'
      }
      break
    case enums.deviceTypeEnum.FaceDevice.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain.value)) {
        IconName = 'face_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'face_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'face_open'
      } else {
        IconName = 'face_open'
      }
      break
    case enums.deviceTypeEnum.FingerprintDevice.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain.value)) {
        IconName = 'finger_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'finger_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'finger_open'
      } else {
        IconName = 'finger_open'
      }
      break
    case enums.deviceTypeEnum.RecogniseDevice.value:
      if (Contains(state, enums.deviceStatesEnum.Maintain.value)) {
        IconName = 'face_repair'
      } else if (!Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'face_offline'
      } else if (Contains(state, enums.deviceStatesEnum.Alarm.value)) {
        IconName = 'alarm'
      } else if (Contains(state, enums.deviceStatesEnum.Communication.value)) {
        IconName = 'face_open'
      } else {
        IconName = 'face_open'
      }
      break
  }
  return IconName
}
// 判断是否包含状态
export function Contains(state, enums) {
  return (state & enums) === enums
}

/**
  * @author: Hayden
  * @Date: 2020-05-27 19:54:04
  * @function: 判断枚举的值是否包括位标识枚举值
  * @description:
  * @param {type}
  * @return:
  */
export function containBitFlag(enumValue, flag) {
  if (enumValue === undefined || enumValue === null) {
    return false
  }
  return (enumValue & flag) === flag
}
/**
 * @author: Hayden
 * @Date: 2020-05-27 19:54:19
 * @function: 枚举的值增加位标识枚举值
 * @description:
 * @param {type}
 * @return:
 */
export function addBitFlag(enumValue, flag) {
  return enumValue | flag
}

/**
 * Toast alert
 */
export function notify(msg = '', type="success", time=3000){

  switch(type){

    case 'success':
      return toast.success(msg, {
              autoClose: time,
              position: toast.POSITION.TOP_RIGHT,
              hideProgressBar: true
            });

    case 'error':
      return toast.error(msg, {
              autoClose: time,
              position: toast.POSITION.TOP_RIGHT,
              hideProgressBar: true
            });

    case 'warning':
      return toast.warning(msg, {
              autoClose: time,
              position: toast.POSITION.TOP_RIGHT,
              hideProgressBar: true
            });

    case 'info':
      return toast.info(msg, {
              autoClose: time,
              position: toast.POSITION.TOP_RIGHT,
              hideProgressBar: true
            });
  }
  
}

export const toArray = arr => {
  if (Array.isArray(arr)) {
    return arr;
  } else if (arr) {
    return [arr];
  }
  return [];
}

export function exportTableToExcelHtmlFormat(idTable, filename) {      
  var table = document.getElementById(idTable);
  var htmlContent = table.outerHTML; 

  var header = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  header += '<head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>table {mso-displayed-decimal-separator:"\."; mso-displayed-thousand-separator:"\,";} br {mso-data-placement: same-cell;}</style></head><body>';
  var footer = '</body></html>';
  var content = header + htmlContent.replace(/<pre[^>]*>(.*?)<\/pre>/gs, "$1") + footer;

  var buttonCells = table.querySelectorAll('.not-export');  
  buttonCells.forEach(function(cell) {
    content = content.replace(cell.outerHTML, "");
  });

  var blob = new Blob([content], { type: 'application/vnd.ms-excel' });
            
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
}

export function exportTableToExcel(idTable, filename) {  
  const dateRegex = /([0-9]{2})\/([0-9]{2})\/([0-9]{2})/;
  // Acquire Data (reference to the HTML table)  
  var table_elt = document.getElementById(idTable).cloneNode(true);
  Array.from(table_elt.querySelectorAll('td')).forEach(cell => {
    let value = cell.textContent;
    let date = value.match(dateRegex);
    if (date) {
      cell.textContent =  `20${date[3]}-${date[2]}-${date[1]}`;
    }
  });

  // Extract Data (create a workbook object from the table)
  var workbook = XLSX.utils.table_to_book(table_elt, {
    dateNF: "dd/mm/yy",
    cellDates: true,
    UTC: true
  });


  // Package and Release Data (`writeFile` tries to write and save an XLSB file)
  XLSX.writeFile(workbook, filename, { bookType: "xlsx"});
  
}

export function saveCustomers(currentCustomerId, customersList) {
  localStorage.setItem("customers_" + currentCustomerId, JSON.stringify(customersList));
}

export function loadCustomers(currentCustomerId) {
  let customers = localStorage.getItem("customers_" + currentCustomerId);
  if (customers) {
      customers = JSON.parse(customers);
  }
  return customers || [];
}

export function getCustomersFilter(currentCustomerId, allCustomersList) {
  let customerFilter = [];
  let customers = loadCustomers(currentCustomerId) ;
  let customersList = allCustomersList.map((customer) => customer.value);      
  customerFilter = customers.filter((customer) => {
    return customersList.includes(customer);
  });
  if (!customerFilter || customerFilter.length == 0) {
    let defaultCustomer = allCustomersList.find((c) => c.value == currentCustomerId);
    customerFilter = [defaultCustomer.value];
  }  
  return customerFilter;
}
