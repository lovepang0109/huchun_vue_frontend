import { notify } from '@/utils'
import { clearingMccMnc, clearingDate, clearingProviderMccMnc, clearingProviderDate } from '@/api/clearingApis';
import { reportMccMnc } from '@/api/dashboard';
import { getAuthName, getAuthPass } from '@/utils/auth';

const state = {  
    clearingMccMncData: {},
    clearingDateData: {},
    clearingProviderMccMncData: {},
    clearingProviderDateData: {},

    reportMccMncData: [],
    loading: true, 
    errorData: null,
}

const getters = {
    IsLoading: state => state.loading, 
    GetError:                     state => state.errorData,   
    GetClearingMccMncData:        state => state.clearingMccMncData,    
    GetClearingDateData:          state => state.clearingDateData,    
    GetClearingProviderMccMncData:  state => state.clearingProviderMccMncData,    
    GetClearingProviderDateData:    state => state.clearingProviderDateData,    
    
    
    GetReportMccMnc: state => state.reportMccMncData,      
}

const actions = {
    fetchClearingMccMncData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            clearingMccMnc({
                username:       getAuthName(), 
                password:       getAuthPass(), 
                iIDMasterBulk:  data?.iIDMasterBulk,
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,                
            }).then( response => {
                if(response.status){                    
                    commit('CLEARING_MCCMNC_DATA', response.message);
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

    fetchClearingDateData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            clearingDate({
                username:       getAuthName(), 
                password:       getAuthPass(), 
                iIDMasterBulk:  data?.iIDMasterBulk,
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,                
            }).then( response => {
                if(response.status){                    
                    commit('CLEARING_DATE_DATA', response.message);
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
    
    fetchClearingProviderMccMncData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            clearingProviderMccMnc({
                username:       getAuthName(), 
                password:       getAuthPass(), 
                iIDMasterBulk:  data?.iIDMasterBulk,
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,                
            }).then( response => {
                if(response.status){                    
                    commit('CLEARING_PROVIDER_MCCMNC_DATA', response.message);
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

    fetchClearingProviderDateData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            clearingProviderDate({
                username:       getAuthName(), 
                password:       getAuthPass(), 
                iIDMasterBulk:  data?.iIDMasterBulk,
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,                
            }).then( response => {
                if(response.status){                    
                    commit('CLEARING_PROVIDER_DATE_DATA', response.message);
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
    CLEARING_MCCMNC_DATA(state, data){
        state.clearingMccMncData = data;
    },    
    CLEARING_DATE_DATA(state, data){
        state.clearingDateData = data;
    },  
    CLEARING_PROVIDER_MCCMNC_DATA(state, data){
        state.clearingProviderMccMncData = data;
    },  
    CLEARING_PROVIDER_DATE_DATA(state, data){
        state.clearingProviderDateData = data;
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