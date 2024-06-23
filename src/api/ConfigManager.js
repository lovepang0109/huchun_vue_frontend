import request from '@/utils/request'
// import qs from 'qs'
import objects from '@/utils/objects'
import { mergeObjects } from '@/utils/index'

// 修改登陆密码
export function UpdateUserPassword(oldPassword, newPassword, userId) {
  return request({
    url: '/ModifyUserPasswordService/UpdateUserPassword',
    method: 'put',
    params: { oldPassword, newPassword, userId }
  })
}
// #endregion
