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
export default getters
