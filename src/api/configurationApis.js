import request from '@/utils/request';

export function configAccount(data) {
  return request({
    url: '/config-account',
    method: 'post',
    data
  })
}

export function configAccountUserUpdate(data) {
  return request({
    url: '/config-account-user-update',
    method: 'post',
    data
  })
}

export function configAccountUserPassReset(data) {
  return request({
    url: '/config-account-user-password-reset',
    method: 'post',
    data
  })
}

export function configAccountUserBlock(data) {
  return request({
    url: '/config-account-user-block',
    method: 'post',
    data
  })
}

export function configAccountMineUpdate(data) {
  return request({
    url: '/config-account-mine-update',
    method: 'post',
    data
  })
}

export function configAccountAddNewUser(data) {
  return request({
    url: '/config-account-add-new-user',
    method: 'post',
    data
  })
}

export function configCustomers(data) {
  return request({
    url: '/config-customers',
    method: 'post',
    data
  })
}

export function configCustomerUpdate(data) {
  return request({
    url: '/config-customer-update',
    method: 'post',
    data
  })
}

export function configCustomerAddNew(data) {
  return request({
    url: '/config-customer-add-new',
    method: 'post',
    data
  })
}
