import { notify } from '@/utils'
import { generalCountries, generalCustomers, generalMccMnc, generalMccMncCustomers, senderCountries, senderCustomers, senderRestrictedOperators, blacklistCountries, blacklistCustomers, backupCountries, 
    backupCustomers, backupMccMnc,backupRoutes
    } from '@/api/routingApis';
import { getAuthName, getAuthPass } from '@/utils/auth';

const state = {  
    generalCountriesData: {},
    generalCustomersData: {},
    generalMccMncData: {},
    generalMccMncCustomersData: {},
    senderCountriesData: {},
    senderCustomersData: {},
    senderRestrictedOperatorsData: {},
    blacklistCountriesData: {},
    blacklistCustomersData: {},
    backupCountriesData: {},
    backupCustomersData: {},
    backupMccMncData: {},
    backupRoutesData: {},
    loading: true, 
}

const getters = {
    IsLoading: state => state.loading, 
    GetRoutingGeneralCountriesData:         state => state.generalCountriesData,
    GetRoutingGeneralCustomersData:         state => state.generalCustomersData,
    GetRoutingGeneralMccMncData:            state => state.generalMccMncData,
    GetRoutingGeneralMccMncCustomersData:   state => state.generalMccMncCustomersData,
    GetRoutingSenderCountriesData:          state => state.senderCountriesData,
    GetRoutingSenderCustomersData:          state => state.senderCustomersData,
    GetRoutingRestrictedOperatorsData:      state => state.senderRestrictedOperatorsData,
    GetRoutingBlacklistCountriesData:       state => state.blacklistCountriesData,
    GetRoutingBlacklistCustomersData:       state => state.blacklistCustomersData,
    GetRoutingBackupCountriesData:          state => state.backupCountriesData,
    GetRoutingBackupCustomersData:          state => state.backupCustomersData,
    GetRoutingBackupMccMncData:             state => state.backupMccMncData,
    GetRoutingBackupRoutesData:             state => state.backupRoutesData,
}

const actions = {
    fetchRoutingGeneralCountryData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            generalCountries({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('GENERAL_COUNTRIES_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{

                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

    fetchRoutingGeneralCustomerData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            generalCustomers({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('GENERAL_CUSTOMERS_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 
    
    fetchRoutingGeneralMccMncData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            generalMccMnc({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('GENERAL_MCCMNC_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchRoutingGeneralMccMncCustomersData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            generalMccMncCustomers({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('GENERAL_MCCMNC_CUSTOMERS_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchRoutingSenderCountriesData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            senderCountries({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('GENERAL_SENDER_COUNTRIES_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

    fetchRoutingSenderCustomersData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            senderCustomers({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('SENDER_CUSTOMERS_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchRoutingRestrictedOperatorsData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            senderRestrictedOperators({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('SENDER_RESTRICTED_OPERATORS_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchRoutingBlacklistCountriesData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            blacklistCountries({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('BLACKLIST_COUNTRIES_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

    fetchRoutingBlacklistCustomersData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            blacklistCustomers({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('BLACKLIST_CUSTOMERS_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchRoutingBackupCountriesData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            backupCountries({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('BACKUP_COUNTRIRES_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

    fetchRoutingBackupCustomersData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            backupCustomers({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('BACKUP_CUSTOMERS_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

    fetchRoutingBackupMccMncData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            backupMccMnc({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('BACKUP_MCCMNC_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

    fetchRoutingBackupRoutesData({ commit }, data) {
        commit('IS_LOADING', true);    
        return new Promise((resolve, reject) => {
            
            backupRoutes({username: getAuthName(), password: getAuthPass()}).then( response => {
                if(response.status){                    
                    commit('BACKUP_ROUTES_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    reject(`Routing API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    }, 

}

const mutations = {   
    GENERAL_COUNTRIES_DATA(state, data){
        state.generalCountriesData = data;
    },
    GENERAL_CUSTOMERS_DATA(state, data){
        state.generalCustomersData = data;
    },
    GENERAL_MCCMNC_DATA(state, data){
        state.generalMccMncData = data;
    },
    GENERAL_MCCMNC_CUSTOMERS_DATA(state, data){
        state.generalMccMncCustomersData = data;
    },
    GENERAL_SENDER_COUNTRIES_DATA(state, data){
        state.senderCountriesData = data;
    },
    SENDER_CUSTOMERS_DATA(state, data){
        state.senderCustomersData = data;
    },
    SENDER_RESTRICTED_OPERATORS_DATA(state, data){
        state.senderRestrictedOperatorsData = data;
    },
    BLACKLIST_COUNTRIES_DATA(state, data){
        state.blacklistCountriesData = data;
    },
    BLACKLIST_CUSTOMERS_DATA(state, data){
        state.blacklistCustomersData = data;
    },
    BACKUP_COUNTRIRES_DATA(state, data){
        state.backupCountriesData = data;
    },
    BACKUP_CUSTOMERS_DATA(state, data){
        state.backupCustomersData = data;
    },
    BACKUP_MCCMNC_DATA(state, data){
        state.backupMccMncData = data;
    },
    BACKUP_ROUTES_DATA(state, data){
        state.backupRoutesData = data;
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