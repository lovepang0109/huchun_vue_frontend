import { notify } from '@/utils'
import { pricingCountries, pricingProviders, pricingCustomers, pricingDefaults } from '@/api/pricingApis';
import { getAuthName, getAuthPass } from '@/utils/auth';

const state = {  
    pricingCountriesData: {},
    pricingProvidersData: {},
    pricingCustomersData: {},
    pricingDefaultsData: {},
    
    loading: true, 
    errorData: null,
}

const getters = {
    IsLoading: state => state.loading, 
    GetPricingCountriesData:    state => state.pricingCountriesData,    
    GetPricingProvidersData:    state => state.pricingProvidersData,    
    GetPricingCustomersData:    state => state.pricingCustomersData,    
    GetPricingDefaultsData:     state => state.pricingDefaultsData, 
    GetError:                   state => state.errorData,   
}

const actions = {
    fetchPricingCountriesData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            pricingCountries({
                username:       getAuthName(), 
                password:       getAuthPass(), 
                cPaisDestino:   data?.cPaisDestino,
                iIDTipoBulk:    data?.iIDTipoBulk,
                iIDMasterBulk:  data?.iIDMasterBulk,
            }).then( response => {
                if(response.status){                    
                    commit('PRICING_COUNTRIES_DATA', response.message);
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

    fetchPricingProvidersData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            pricingProviders({
                username: getAuthName(), 
                password: getAuthPass()
            }).then( response => {

                if(response.status){                    
                    commit('PRICING_PROVIDERS_DATA', response.message);
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

    fetchPricingCustomersData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            pricingCustomers({
                username: getAuthName(), 
                password: getAuthPass()
            }).then( response => {

                if(response.status){                    
                    commit('PRICING_CUSTOMERS_DATA', response.message);
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

    fetchPricingDefaultsData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            pricingDefaults({
                username: getAuthName(), 
                password: getAuthPass()
            }).then( response => {

                if(response.status){                    
                    commit('PRICING_DEFAULTS_DATA', response.message);
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
    PRICING_COUNTRIES_DATA(state, data){
        state.pricingCountriesData = data;
    },
    PRICING_PROVIDERS_DATA(state, data){
        state.pricingProvidersData = data;
    },    
    PRICING_CUSTOMERS_DATA(state, data){
        state.pricingCustomersData = data;
    },    
    PRICING_DEFAULTS_DATA(state, data){
        state.pricingDefaultsData = data;
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