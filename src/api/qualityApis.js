import request from '@/utils/request';

export function qualityMap(data) {
  return request({
    url: '/quality-map',
    method: 'post',
    data
  })
}

export function qualityCountry(data) {
  return request({
    url: '/quality-country',
    method: 'post',
    data
  })
}

export function qualityMccMnc(data) {
  return request({
    url: '/quality-mccmnc',
    method: 'post',
    data
  })
}