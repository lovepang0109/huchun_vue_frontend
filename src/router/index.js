import { getToken } from '@/utils/auth'
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const whiteList = ['/', '/login'] // no redirect whitelist

/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

var map = new Map()

var mapHidden = new Map()
mapHidden.set('AutomaticFiling', 'hidden')
mapHidden.set('ManualFiling', 'hidden')
mapHidden.set('addSoftwareLog', 'hidden')
mapHidden.set('addHardwareLog', 'hidden')
mapHidden.set('dictionaryManage', 'hidden')
mapHidden.set('SecretKeySetting', 'hidden')

// 演示时隐藏
mapHidden.set('dataProfiling', 'hidden')
mapHidden.set('softwareLicense', 'hidden')
mapHidden.set('upgradeLog', 'hidden')

/**
* constantRoutes
* a base page that does not have permission requirements
* all roles can be accessed
*/

export const constantRoutes = [
  {
    path: '/login',
    redirect: to => { return { name: 'login' } }
  },  
  {
    path: '/',
    redirect: to => {
      if ( getToken() )
        return { name: 'reports-dashboard' }
      else
        return { name: 'login', query: to.query }
    },
  },  
  ...setupLayouts(routes), 
]

export default function (store) {
  
  const router = createRouter({ 
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: constantRoutes
  })

  router.beforeEach(async(to, from, next) => {

    // determine whether the user has logged in
    const hasToken = getToken()
    if (hasToken) {

      if (to.path === '/login') {
        
        next({ path: '/' })
        
      } else {
        
        next()
      }
    } else {
      /* has no token*/  
      if (whiteList.indexOf(to.path) !== -1) {
        // in the free login whitelist, go directly
        next()
      } else {      
        next(`/login?redirect=${to.path}`)
      }
    }
  })

  return router
}
