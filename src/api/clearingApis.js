import request from '@/utils/request';

export function clearingMccMnc(data) {
  return request({
    url: '/clearing-mccmnc',
    method: 'post',
    data
  })
}

export function clearingDate(data) {
  return request({
    url: '/clearing-date',
    method: 'post',
    data
  })
}

export function clearingProviderMccMnc(data) {
  return request({
    url: '/clearing-provider-mccmnc',
    method: 'post',
    data
  })
}

export function clearingProviderDate(data) {
  return request({
    url: '/clearing-provider-date',
    method: 'post',
    data
  })
}


