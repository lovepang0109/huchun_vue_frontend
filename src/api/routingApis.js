import request from '@/utils/request';

export function generalCountries(data) {
  return request({
    url: '/route-general-countries',
    method: 'post',
    data
  })
}

export function generalCustomers(data) {
  return request({
    url: '/route-general-customers',
    method: 'post',
    data
  })
}

export function generalMccMnc(data) {
  return request({
    url: '/route-general-mccmnc',
    method: 'post',
    data
  })
}

export function generalMccMncCustomers(data) {
  return request({
    url: '/route-general-mccmnc-customers',
    method: 'post',
    data
  })
}

export function senderCountries(data) {
  return request({
    url: '/route-sender-countries',
    method: 'post',
    data
  })
}

export function senderCustomers(data) {
  return request({
    url: '/route-sender-customers',
    method: 'post',
    data
  })
}

export function senderRestrictedOperators(data) {
  return request({
    url: '/route-sender-restricted-operators',
    method: 'post',
    data
  })
}

export function blacklistCountries(data) {
  return request({
    url: '/route-blacklist-countries',
    method: 'post',
    data
  })
}

export function blacklistCustomers(data) {
  return request({
    url: '/route-blacklist-customers',
    method: 'post',
    data
  })
}

export function backupCountries(data) {
  return request({
    url: '/route-backup-countries',
    method: 'post',
    data
  })
}

export function backupMccMnc(data) {
  return request({
    url: '/route-backup-mccmnc',
    method: 'post',
    data
  })
}

export function backupCustomers(data) {
  return request({
    url: '/route-backup-customers',
    method: 'post',
    data
  })
}

export function backupRoutes(data) {
  return request({
    url: '/route-backup-routes',
    method: 'post',
    data
  })
}