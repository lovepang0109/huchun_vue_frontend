const sessionutil = {
  setSession(key, value, maxAge) { // key=userInfo value=2 maxAge='' || 可自行设置
    const maxAgeTime = new Date().getTime() + 1000 * 60 * window.configData.SessionTimeout
    try {
      const data = { value, maxAge: maxAge || maxAgeTime }
      sessionStorage.setItem(typeof key === 'string' ? key : JSON.stringify(key), JSON.stringify(data))
    } catch (err) {
      // err
    }
  },
  getSession(key) {
    try {
      const maxAgeTime = new Date().getTime() + 1000 * 60 * window.configData.SessionTimeout
      const date = new Date().getTime() // 当前时间
      const session = JSON.parse(sessionStorage.getItem(typeof key === 'string' ? key : JSON.stringify(key)))
      if (session && session.maxAge != null && session.maxAge - date > 0 && session.maxAge <= maxAgeTime) {
        // this.setSession(key, session.value)
        return session.value
      } else {
        return null
      }
    } catch (err) {
      // err
    }
  }
}
export default sessionutil
