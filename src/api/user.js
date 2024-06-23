import request from '@/utils/request';

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function lockUser(data) {
  return request({
    url: '/LockUser',
    method: 'post',
    data
  })
}
