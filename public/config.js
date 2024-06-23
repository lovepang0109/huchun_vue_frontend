var configData = {
    /* 开发配置 */
    //VUE_APP_BASE_API: 'https://panel.nvia.com/api/v1',
    //APP_BASE_URL:     "https://panel.nvia.com/",
    //  VUE_APP_BASE_API: 'http://localhost:8000/api/v1',
    //  APP_BASE_URL:     "http://localhost:8000",

     VUE_APP_BASE_API: 'https://huchun-task.vercel.app/api/api/v1',
     APP_BASE_URL:     "https://huchun-task.vercel.app/",

    SystemName: 'PanelSMS',
    AccountOverDays: 180,
    SessionTimeout: 15, // session有效时间,单位：分钟
    LibraryCode: 'null', // 如果是'null',机构下拉框不进行LibraryCode过滤，否则要进行LibraryCode过滤
};
window.configData = configData;