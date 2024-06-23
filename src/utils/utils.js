/**
 * 用于递归判断两个对象是否一致，以区分是否修改
 * @param {*} oldObj
 * @param {*} newObj
 * 返回false：不相等
 */
export function objsDiffer(oldObj, newObj) {
  const aProps = Object.getOwnPropertyNames(oldObj)
  const bProps = Object.getOwnPropertyNames(newObj)

  if (aProps.length !== bProps.length) {
    return false
  }
  // return 时for中断
  for (var i = 0; i < aProps.length; i++) {
    const propName = aProps[i]
    const propA = oldObj[propName]
    const propB = newObj[propName]
    if (propA !== propB) {
      return false
    }
    // if (propA === propB) {
    //   if (propA instanceof Object) {
    //     if (!objsDiffer(propA, propB)) {
    //       return false
    //     }
    //   } else if (propA instanceof Array && propB instanceof Array) {
    //     if (propA.length !== propB.length) {
    //       return false
    //     }
    //     const tem = arrDiffer(propA, propB)
    //     if (!tem) return false
    //   }
    // } else {
    //   return false
    // }
  }
  return true
}
/**
 * 返回false 表示不相等
 */
export function arrDiffer(oldObj, newObj) {
  const aProps = Object.getOwnPropertyNames(oldObj)
  for (var i = 0; i < oldObj.length; i++) {
    const propName = aProps[i]
    const propA = oldObj[propName]
    const propB = newObj[propName]
    if (propA === propB) {
      if (propA instanceof Object) {
        if (!objsDiffer(propA, propB)) {
          return false
        }
      } else if (propA instanceof Array && propB instanceof Array) {
        if (propA.length !== propB.length) {
          return false
        }
        const temp = arrDiffer(propA, propB)
        if (!temp) return false
      }
    } else {
      return false
    }
  }
  return true
}

