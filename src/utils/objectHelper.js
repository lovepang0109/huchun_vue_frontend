/*
 * @Description:
 * @version:
 * @Author: Hayden
 * @Date: 2019-12-23 10:35:28
 * @LastEditors: Hayden
 * @LastEditTime: 2019-12-23 10:46:52
 */

import { deepClone } from '@/assets/js/deepClone'

export class ObjectClass {
  /**
   * 添加对象字段
   * field: 对象字段
   * value: 字段值
   */
  /**
   * @author: Hayden
   * @Date: 2019-12-23 10:44:08
   * @function: 添加对象字段
   * @description:
   * @param {
   * field: 对象字段
   * value: 字段值
   * }
   * @return:
   */
  add(field, value) {
    this[field] = value
    return this
  }

  /**
   * @author: Hayden
   * @Date: 2019-12-23 10:41:52
   * @function: 根据对象字段field获取对象字段value
   * @description:
   * @param {field: 对象值}
   * @return:
   */
  /**
   * 根据对象字段field获取对象字段value
   */
  getValueByField(field) {
    // 字段不存在返回‘’
    if (field === undefined || field === null) {
      return ''
    }
    for (const i in this) {
      const e = this[i]
      if (e && e.field === field) {
        return e.value
      }
    }

    return ''
  }

  /**
   * @author: Hayden
   * @Date: 2019-12-23 10:46:18
   * @function: 获取对象的克隆对象
   * @description:
   * @param {type}
   * @return:
   */
  getClone() {
    return deepClone(this)
  }
}
