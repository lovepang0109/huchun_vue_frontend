const defaultSettings = {

  title: 'PanelSMS',

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: false,
  /**
   * @type {boolean} true | false
   * @description 是否显示全局全文搜索弹出框
   */
  globalSearch: false,
  /**
 * @type {boolean} true | false
 * @description 是否显示密码修改弹出框
 */
  updatePassword: false,
  // isShowAccessGroupParent为权限组管理编辑界面是否显示“父权限组”控件标识
  serverGlobalSetting: { isShowAccessGroupParent: false }
}

export default defaultSettings