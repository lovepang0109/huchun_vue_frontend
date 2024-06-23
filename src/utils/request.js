import store from '@/store'
import { getToken, } from '@/utils/auth'
import { config } from '@layouts/config'
import axios from 'axios'
// const https = require('https')

axios.defaults.timeout = 15000
// create an axios instance
const service = axios.create({
    baseURL: window.configData.VUE_APP_BASE_API, // url = base url + request url
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent
        if (store.getters.token) {
            // please modify it according to the actual situation
            config.headers['X-Token'] = getToken()            
        }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data
        return res
    },
    error => {
        console.log('err-' + error) // for debug    
        return { result: false, msg: error.message }
    }
)

export default service