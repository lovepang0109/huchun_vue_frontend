import request from '@/utils/request';

export function billingDefaults(data) {
  return request({
    url: '/billing-defaults',
    method: 'post',
    data
  })
}

export function billingDefaultsItem(data) {
  return request({
    url: '/billing-defaults-item',
    method: 'post',
    data
  })
}

export function billingCustomerDate(data) {
  return request({
    url: '/billing-customer-date',
    method: 'post',
    data
  })
}

export function billingCustomerMccMnc(data) {
  return request({
    url: '/billing-customer-mccmnc',
    method: 'post',
    data
  })
}

export function billingProviderDate(data) {
  return request({
    url: '/billing-provider-date',
    method: 'post',
    data
  })
}

export function billingProviderMccMnc(data) {
  return request({
    url: '/billing-provider-mccmnc',
    method: 'post',
    data
  })
}

export function billingDetails(data) {
  return request({
    url: '/billing-details',
    method: 'post',
    data
  })
}
