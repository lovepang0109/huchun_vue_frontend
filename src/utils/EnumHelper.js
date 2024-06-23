/**
 * 枚举类
 * Hayden
 * 20191028
 */
export class Enum {
  /**
   * 添加枚举字段
   * field: 枚举字段
   * label: 界面显示
   * value: 枚举值
   */
  add(field, label, value) {
    this[field] = { label, value }
    return this
  }

  /**
   * 根据枚举label获取其value
   */
  getLabelByValue(value) {
    // 字段不存在返回‘’
    if (value === undefined || value === null) {
      return ''
    }
    for (const i in this) {
      const e = this[i]
      if (e && e.value === value) {
        return e.label
      }
    }

    return ''
  }

  /**
   * 根据枚举字段Field获取其label
   */
  getLabelByField(field) {
    // 字段不存在返回‘’
    if (field === undefined || field === null) {
      return ''
    }
    for (const i in this) {
      const e = this[i]
      if (e && i === field) {
        return e.label
      }
    }

    return ''
  }

  /**
   * 根据枚举value（即枚举值）获取其field（即枚举字段名称）
   */
  getFieldByValue(value) {
    // 字段不存在返回‘’
    if (value === undefined || value === null) {
      return ''
    }
    for (const i in this) {
      const e = this[i]
      if (e && e.value === value) {
        return i
      }
    }

    return ''
  }

  /**
   * @author: Hayden
   * @Date: 2019-12-25 17:53:08
   * @function: 返回所有过滤函数为true的枚举字段集合，当func为空时，返回所有枚举字段集合
   * @description:
   * @param {func:过滤函数}
   * @return:
   */
  filter(func) {
    const arr = []
    for (const i in this) {
      const e = this[i]
      if (e && (func === undefined || func === null || func(e))) {
        arr.push(e)
      }
    }
    return arr
  }
}
