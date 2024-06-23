import request from '@/utils/request';

export function pricingCountries(data) {
  return request({
    url: '/pricing-countries',
    method: 'post',
    data
  })
}

export function pricingProviders(data) {
  return request({
    url: '/pricing-providers',
    method: 'post',
    data
  })
}

export function pricingCustomers(data) {
  return request({
    url: '/pricing-customers',
    method: 'post',
    data
  })
}

export function pricingDefaults(data) {
  return request({
    url: '/pricing-defaults',
    method: 'post',
    data
  })
}

