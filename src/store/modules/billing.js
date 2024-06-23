import { notify } from '@/utils'
import { billingDefaults, billingDefaultsItem,  billingCustomerDate, billingCustomerMccMnc, billingProviderDate, billingProviderMccMnc, billingDetails} from '@/api/billingApis';
import { reportMccMnc } from '@/api/dashboard';
import { getAuthName, getAuthPass } from '@/utils/auth';

const state = {  
    billingDefaultsData: {},
    billingDefaultsItem:{},
    billingCustomerDateData: {},
    billingCustomerMccMncData: {},
    billingProviderDateData: {},
    billingProviderMccMncData: {},
    billingDetailsData: {},
    

    reportMccMncData: [],
    loading: true, 
    errorData: null,
}

const getters = {
    IsLoading: state => state.loading, 
    GetError:                     state => state.errorData,   
    GetBillingDefaultData:        state => state.billingDefaultsData,    
    GetBillingDefaultsItemData:   state => state.billingDefaultsItemData,
    GetBillingCustomerDateData:   state => state.billingCustomerDateData, 
    GetBillingCustomerMccMncData: state => state.billingCustomerMccMncData, 
    GetBillingProviderDateData:   state => state.billingProviderDateData, 
    GetBillingProviderMccMncData: state => state.billingProviderMccMncData, 
    GetBillingDetailsData:        state => state.billingDetailsData, 
    
    GetReportMccMnc: state => state.reportMccMncData,      
}

const actions = {
    fetchBillingDefaultsData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            billingDefaults({
                username:       getAuthName(), 
                password:       getAuthPass(), 
                iIDMasterBulk:  data?.iIDMasterBulk,
                iAnyo:          data?.iAnyo,
                iMes:           data?.iMes,
                iIDEstado:      data?.iIDEstado,
                iTipoCobro:     data?.iTipoCobro,
            }).then( response => {
                if(response.status){                    
                    commit('BILLING_DEFAULT_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Pricing API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },
    
    fetchBillingDefaultsItemData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            billingDefaultsItem({
                username:            getAuthName(), 
                password:            getAuthPass(), 
                iIDMasterBulk:       data?.iIDMasterBulk, 
                iIDCliente:          data?.iIDCliente, 
                iAnyoFacturacion:    data?.iAnyoFacturacion, 
                iIDFactura:          data?.iIDFactura, 
            }).then( response => {
                if(response.status){                    
                    commit('BILLING_DEFAULT_ITEM_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Pricing API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchBillingCustomerDateData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            billingCustomerDate({
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
                    commit('BILLING_CUSTOMER_DATE_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Pricing API has error ${response.msg}`);
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
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`MccMnc Fetch API has error ${response.msg}`);                    
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchBillingCustomerMccMncData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            billingCustomerMccMnc({
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
                    commit('BILLING_CUSTOMER_MCCMNC_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Pricing API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchBillingProviderDateData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            billingProviderDate({
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
                    commit('BILLING_PROVIDER_DATE_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Pricing API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchBillingProviderMccMncData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            billingProviderMccMnc({
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
                    commit('BILLING_PROVIDER_MCCMNC_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Pricing API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchBillingDetailsData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            billingDetails({
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
                    commit('BILLING_DETAILS_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Pricing API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },
}

const mutations = {   
    BILLING_DEFAULT_DATA(state, data){
        state.billingDefaultsData = data;
    },    
    BILLING_DEFAULT_ITEM_DATA(state, data){
        state.billingDefaultsItemData = data;
    },
    BILLING_CUSTOMER_DATE_DATA(state, data){
        state.billingCustomerDateData = data;
    }, 
    BILLING_CUSTOMER_MCCMNC_DATA(state, data){
        state.billingCustomerMccMncData = data;
    },  
    BILLING_PROVIDER_DATE_DATA(state, data){
        state.billingProviderDateData = data;
    },  
    BILLING_PROVIDER_MCCMNC_DATA(state, data){
        state.billingProviderMccMncData = data;
    },  
    BILLING_DETAILS_DATA(state, data){
        state.billingDetailsData = data;
    },  
      
    REPORT_MCCMNC_DATA(state, data){
        state.reportMccMncData = data;
    },
    setError(state, data){
        state.errorData = data;
    },
    clearError(state) {
        state.errorData = null;
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