import { notify } from '@/utils'
import { qualityMap, qualityCountry, qualityMccMnc } from '@/api/qualityApis';
import { reportMccMnc } from '@/api/dashboard';
import { getAuthName, getAuthPass } from '@/utils/auth';

const state = {  
    qualityMapData: {},    
    qualityCountryData: {},    
    qualityMccMncData: {},    

    reportMccMncData: [],
    loading: true, 
    errorData: null,
}

const getters = {
    IsLoading: state => state.loading, 
    GetError:          state => state.errorData,   
    GetQualityMapData: state => state.qualityMapData,        
    GetQualityCountryData: state => state.qualityCountryData, 
    GetQualityMccMncData: state => state.qualityMccMncData, 
    
    GetReportMccMnc: state => state.reportMccMncData,      
}

const actions = {
    fetchQualityMapData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            qualityMap({
                username:      getAuthName(), 
                password:      getAuthPass(),                 
            }).then( response => {
                if(response.status){                    
                    commit('QUALITY_MAP_DATA', response.message);
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

    fetchQualityCountryData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            qualityCountry({
                username:       getAuthName(), 
                password:       getAuthPass(),   
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,
                cPaises:        data?.cPaises,       
            }).then( response => {
                if(response.status){                    
                    commit('QUALITY_COUNTRY_DATA', response.message);
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

    fetchQualityMccMncData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            qualityMccMnc({
                username:       getAuthName(), 
                password:       getAuthPass(),   
                cFechaInicio:   data?.cFechaInicio,
                cFechaFin:      data?.cFechaFin,
                cPaises:        data?.cPaises,       
                cMccMnc:        data?.cMccMnc,       
            }).then( response => {
                if(response.status){                    
                    commit('QUALITY_MCCMNC_DATA', response.message);
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
    
}

const mutations = {   
    QUALITY_MAP_DATA(state, data){
        state.qualityMapData = data;
    },      
    QUALITY_COUNTRY_DATA(state, data){
        state.qualityCountryData = data;
    },
    QUALITY_MCCMNC_DATA(state, data){
        state.qualityMccMncData = data;
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