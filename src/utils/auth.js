import Cookies from 'js-cookie'

const AuthPass = 'AuthPass'

const AuthName = 'AuthName' // 密码修改者，如果密码不是本人修改，登录之后会自动弹出‘修改密码’界面

const TokenKey = 'TokenKey' // 登陆用户token(用户ID)

const UserEmail = 'UserEmail'

const UserPhone = "UserPhone"


export function getToken() {
    return Cookies.get(TokenKey)
}

export function setToken(token) {
    return Cookies.set(TokenKey, token)
}

export function removeToken() {
    return Cookies.remove(TokenKey)
}

export function getUserEmail() {
    return Cookies.get(UserEmail)
}

export function setUserEmail(userEmail) {
    return Cookies.set(UserEmail, userEmail)
}

export function removeUserEmail() {
    return Cookies.remove(UserEmail)
}

export function getUserPhone() {
    return Cookies.get(UserPhone)
}

export function setUserPhone(phone) {
    return Cookies.set(UserPhone, phone)
}

export function removeUserPhone() {
    return Cookies.remove(UserPhone)
}

export function getAuthName() {
    return Cookies.get(AuthName)
}

export function setAuthPass(password) {    
    return Cookies.set(AuthPass, password)
}

export function getAuthPass() {
    return Cookies.get(AuthPass)
}

export function removeAuthPass() {
    return Cookies.remove(AuthPass)
}

export function setAuthName(authName) {
    return Cookies.set(AuthName, authName)
}

export function removeAuthName() {
    return Cookies.remove(AuthName)
}