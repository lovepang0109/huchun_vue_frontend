import { notify } from '@/utils'
import { dashboard, reportCountry, reportMccMnc, reportProvider, reportCustomer, reportMccMncList, reportSender, lastMessage, mobileIncident, connectCustomer, connectProvider } from '@/api/dashboard';
import { getAuthName, getAuthPass } from '@/utils/auth';

const state = {  
    warningList: [],
    dashData: {}, 
    reportCountryData: {},
    reportProviderData: {},
    reportCustomerData: {},
    reportMccMncListData: {},
    reportSenderData: {},
    lastMessageData: {},
    mobileIncidentData: {},
    connectCustomerData: {},
    connectProviderData: {},

    reportMccMncData: [],
    loading: true, 
}

const getters = {
    GetDashData: state => state.dashData,       
    IsLoading: state => state.loading,     
    GetReportCountries: state => state.reportCountryData,
    GetReportProviders: state => state.reportProviderData,
    GetReportCustomers: state => state.reportCustomerData,
    GetReportMccMncList: state => state.reportMccMncListData,
    GetReportSenders: state => state.reportSenderData,
    GetReportMccMnc: state => state.reportMccMncData,
    GetLastMessage: state => state.lastMessageData,
    GetMobileIncident: state => state.mobileIncidentData,
    GetConnectCustomerData: state => state.connectCustomerData,
    GetConnectProviderData: state => state.connectProviderData,
}

const actions = {

    fetchDashData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            dashboard({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){
                    
                    commit('DASHBOARD_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Dashoard API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },    

    fetchReportCountryData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            reportCountry({
                username:       getAuthName(),
                password:       getAuthPass(), 
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,
                cPaises:        data?.cPaises,
                iIDCliente:     data?.iIDCliente,
                iIDProveedor:   data?.iIDProveedor,
                iIDTipoRuta:    data?.iIDTipoRuta,
                cMccMnc:        data?.cMccMnc,
             }).then( response => {
                
                if(response.status){
                    
                    commit('REPORT_COUNTRY_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchReportProviderData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            reportProvider({
                username:       getAuthName(),
                password:       getAuthPass(), 
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,
                cPaises:        data?.cPaises,
                iIDCliente:     data?.iIDCliente,
                iIDProveedor:   data?.iIDProveedor,
                iIDTipoRuta:    data?.iIDTipoRuta,
                cMccMnc:        data?.cMccMnc,
             }).then( response => {
                
                if(response.status){
                    
                    commit('REPORT_PROVIDER_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

    fetchReportCustomerData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            reportCustomer({
                username:       getAuthName(),
                password:       getAuthPass(), 
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,
                cPaises:        data?.cPaises,
                iIDCliente:     data?.iIDCliente,
                iIDProveedor:   data?.iIDProveedor,
                iIDTipoRuta:    data?.iIDTipoRuta,
                cMccMnc:        data?.cMccMnc,
             }).then( response => {
                
                if(response.status){
                    
                    commit('REPORT_CUSTOMER_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

    fetchReportMccMncListData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            reportMccMncList({
                username:       getAuthName(),
                password:       getAuthPass(), 
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,
                cPaises:        data?.cPaises,
                iIDCliente:     data?.iIDCliente,
                iIDProveedor:   data?.iIDProveedor,
                iIDTipoRuta:    data?.iIDTipoRuta,
                cMccMnc:        data?.cMccMnc,
             }).then( response => {
                
                if(response.status){
                    
                    commit('REPORT_MCCMNCLIST_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },
    
    fetchReportSenderData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            reportSender({
                username:       getAuthName(),
                password:       getAuthPass(), 
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,
                cPaises:        data?.cPaises,
                iIDCliente:     data?.iIDCliente,
                iIDProveedor:   data?.iIDProveedor,
                iIDTipoRuta:    data?.iIDTipoRuta,
                cMccMnc:        data?.cMccMnc,
             }).then( response => {
                
                if(response.status){
                    
                    commit('REPORT_SENDER_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },
    
    fetchMccMncData({ commit }, data){
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            reportMccMnc({                
                code: data?.codes,
             }).then( response => {
                
                if(response.status){
                    
                    commit('REPORT_MCCMNC_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`MccMnc Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchLastMessageData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            lastMessage({
                username:       getAuthName(),
                password:       getAuthPass(), 
                cPaises:        data?.cPaises,
                iIDCliente:     data?.iIDCliente,
                iIDProveedor:   data?.iIDProveedor,
                iIDTipoRuta:    data?.iIDTipoRuta,
                cMccMnc:        data?.cMccMnc,
             }).then( response => {
                
                if(response.status){
                    
                    commit('LAST_MESSAGE_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchMobileIncidentData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            mobileIncident({
                username:       getAuthName(),
                password:       getAuthPass(), 
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,
                cMovil:         data?.cMovil,
                cRutaMsgID:     data?.cRutaMsgID,
                cMsgID:         data?.cMsgID,
                iPagina:        data?.iPagina,
             }).then( response => {
                
                if(response.status){
                    
                    commit('MOBILE_INCIDENT_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConnectCustomerData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            connectCustomer({
                username:       getAuthName(),
                password:       getAuthPass(), 
                iIDMasterProvider:   data?.iIDMasterProvider,
                iIDCliente:          data?.iIDCliente,
                iIDTipoBulk:         data?.iIDTipoBulk,
             }).then( response => {
                
                if(response.status){                    
                    commit('CONNECT_CUSTOMER_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConnectProviderData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            connectProvider({
                username:       getAuthName(),
                password:       getAuthPass(), 
                iIDMasterProvider:  data?.iIDMasterProvider,
                iIDProveedor:       data?.iIDProveedor,
                iIDTipoBulk:        data?.iIDTipoBulk,
                cRuta:              data?.cRuta,
             }).then( response => {
                
                if(response.status){                    
                    commit('CONNECT_PROVIDER_DATA', response.message);
                    commit('IS_LOADING', false);

                    resolve();
                }else{

                    reject(`Service Fetch API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },
       
}

const mutations = {
    WARNING_LIST(state, data) {
        state.warningList = data
    },
    DASHBOARD_DATA(state, data){
        state.dashData = data;
    },    
    REPORT_COUNTRY_DATA(state, data){
        state.reportCountryData = data;
    },
    REPORT_PROVIDER_DATA(state, data){
        state.reportProviderData = data;
    },
    REPORT_CUSTOMER_DATA(state, data){
        state.reportCustomerData = data;
    },
    REPORT_MCCMNCLIST_DATA(state, data){
        state.reportMccMncListData = data;
    },
    REPORT_MCCMNC_DATA(state, data){
        state.reportMccMncData = data;
    },
    REPORT_SENDER_DATA(state, data){
        state.reportSenderData = data;
    },
    LAST_MESSAGE_DATA(state, data){
        state.lastMessageData = data;
    },
    MOBILE_INCIDENT_DATA(state, data){
        state.mobileIncidentData = data;
    },
    CONNECT_CUSTOMER_DATA(state, data){
        state.connectCustomerData = data;
    },
    CONNECT_PROVIDER_DATA(state, data){
        state.connectProviderData = data;
    },
    IS_LOADING(state, data){
        state.loading = data;
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}