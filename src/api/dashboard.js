import request from '@/utils/request';

export function dashboard(data) {
  return request({
    url: '/dashboard',
    method: 'post',
    data
  })
}

export function reportCountry(data) {
  return request({
    url: '/report-countries',
    method: 'post',
    data
  })
}

export function reportProvider(data) {
  return request({
    url: '/report-providers',
    method: 'post',
    data
  })
}

export function reportCustomer(data) {
  return request({
    url: '/report-customers',
    method: 'post',
    data
  })
}

export function reportMccMncList(data) {
  return request({
    url: '/report-mccmnc',
    method: 'post',
    data
  })
}

export function reportSender(data) {
  return request({
    url: '/report-senders',
    method: 'post',
    data
  })
}

export function reportMccMnc(data) {
  return request({
    url: '/getMccMnc',
    method: 'post',
    data
  })
}

export function lastMessage(data) {
  return request({
    url: '/last-messages',
    method: 'post',
    data
  })
}

export function mobileIncident(data) {
  return request({
    url: '/mobile-incident',
    method: 'post',
    data
  })
}

export function connectCustomer(data) {
  return request({
    url: '/connection-client',
    method: 'post',
    data
  })
}

export function connectProvider(data) {
  return request({
    url: '/connection-provider',
    method: 'post',
    data
  })
}

