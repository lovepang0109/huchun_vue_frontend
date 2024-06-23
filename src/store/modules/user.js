import { lockUser, login } from '@/api/user'
import { constantRoutes } from '@/router'
import { notify } from '@/utils'
import {
    getToken,
    removeAuthName,
    removeAuthPass,
    removeUserPhone,
    removeToken,
    removeUserEmail,
    setUserEmail,
    setUserPhone,
    setToken,
    setAuthName,
    setAuthPass,
} from '@/utils/auth'

const state = {
    token: getToken(),
    avatar: '',
    addRoutes: '',
    routes: '',
    tempRouters: '',
    constantRoutes: constantRoutes,
    roles: '',
    id: ''
}

const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    event: state => state.app.event,
    alarm: state => state.app.alarm,
    alarmDevice: state => state.app.alarmDevice,
    releaseAlarmType: state => state.app.releaseAlarmType,
    token: state => state.user.token,
    avatar: state => state.user.avatar,
    name: state => state.user.name,
    id: state => state.user.id,
    addRoutes: state => state.user.addRoutes,
    routes: state => state.user.routes,
    getterToken: state => state.user.token
}

const mutations = {
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_NAME: (state, name) => {
        state.name = name
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    },
    SET_ADDROUTES: (state, addRoutes) => {
        state.addRoutes = addRoutes
        state.routes = constantRoutes.concat(addRoutes)
        state.tempRouters = state.routes
    },
    SET_ROLES: (state, roles) => {
        state.roles = roles
    },
    SET_ID: (state, id) => {
        state.id = id
    }
}

const actions = {
    // user login
    auth({ commit }, userInfo) {
        
        const { username, password } = userInfo
        return new Promise((resolve, reject) => {
            
            login({ username: username.trim(), password: password }).then(response => {
                
                const data = response.message;
                console.log(data);
                
                if (response.status) {
                    setAuthName(username);
                    setAuthPass(password);
                    setUserEmail(data.cEmail)
                    setUserPhone(data.cMovil)

                    commit('SET_TOKEN', data.IDCliente)
                    setToken(data.IDCliente)
                    resolve();
                } else {
                    console.log('ddddd');
                    reject('Invalid login or password.')
                }
            }).catch(error => {
                
                reject(error)
            })
        });
    },

    // user logout
    logout({ commit, state }) {
        return new Promise((resolve, reject) => {
            commit('SET_TOKEN', '')
            commit('SET_NAME', '')
            removeToken()
            removeUserPhone()
            removeAuthName()
            removeAuthPass()
            removeUserEmail()
            state.name = null // 将用户名去掉，如果不去掉，退出登陆后，再重新登陆的情况下，将不再执行getInfo
            resolve()
        })
    },

    // remove token
    resetToken({ commit }) {
        return new Promise(resolve => {
            commit('SET_TOKEN', '')
            removeToken()
            resolve()
        })
    },

    // user lock
    lockUser({ commit, state }, userInfo) {
        const { username, password } = userInfo
        return new Promise((resolve, reject) => {
            lockUser({ username: username.trim(), password: password }).then(response => {
                const data = response.result
                if (data !== null) {
                    resolve('Your account has been locked due to 5 failed attempts.Please contact support to unlock your account.')
                } else {
                    reject('Invalid login or password.')
                }
            }).catch(error => {
                reject(error)
            })
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}