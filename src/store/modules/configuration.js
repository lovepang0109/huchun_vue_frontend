import { notify } from '@/utils'
import { configAccount, configAccountUserUpdate, configAccountUserPassReset, configAccountUserBlock, configAccountMineUpdate, 
         configAccountAddNewUser, configCustomers, configCustomerUpdate, configCustomerAddNew} from '@/api/configurationApis';
import { getAuthName, getAuthPass } from '@/utils/auth';

const state = {  
    configurationAccountData: {},
    configurationCustomersData: {},
    
    loading: true, 
    errorData: null,    
}

const getters = {
    IsLoading:                    state => state.loading, 
    GetError:                     state => state.errorData,       

    GetConfigurationAccountData:   state => state.configurationAccountData,
    GetConfigurationCustomersData: state => state.configurationCustomersData,
}

const actions = {

    fetchConfigurationAccountData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {   
            configAccount({
                username:       getAuthName(), 
                password:       getAuthPass(),                 
            }).then( response => {
                if(response.status){                    
                    commit('CONFIGURATION_ACCOUNT_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConfigurationAccountUserDataUpdate({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    
        
        return new Promise((resolve, reject) => {               
            configAccountUserUpdate({
                username:       getAuthName(), 
                password:       getAuthPass(),    
                iIDUsuario:     data?.iIDUsuario,
                cLoginNuevo:    data?.cLoginNuevo,
                cEmail:         data?.cEmail,
                cMovil:         data?.cMovil,
                cPermisos:      data?.cPermisos,
                iIDMasterBulk:  data?.iIDMasterBulk,            
            }).then( response => {
                if(response.status){                    
                    commit('CONFIGURATION_ACCOUNT_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();   
                    notify('User Info Updated!', 'success');                 
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConfigurationAccountUserPassReset({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {               
            configAccountUserPassReset({
                username:       getAuthName(), 
                password:       getAuthPass(),    
                iIDUsuario:     data?.iIDUsuario, 
                cLoginNuevo:    data?.cLoginNuevo,
                cEmail:         data?.cEmail,
                cMovil:         data?.cMovil,
                cPermisos:      data?.cPermisos,               
                iIDMasterBulk:  data?.iIDMasterBulk,            
            }).then( response => {
                if(response.status){                    
                    commit('CONFIGURATION_ACCOUNT_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                    notify('Resettled Password!', 'success');
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConfigurationAccountUserBlock({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {               
            configAccountUserBlock({
                username:       getAuthName(), 
                password:       getAuthPass(),    
                iIDUsuario:     data?.iIDUsuario,                 
            }).then( response => {
                if(response.status){                    
                    commit('CONFIGURATION_ACCOUNT_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                    notify('Blocked User!', 'success');
                }else{
                    commit("setError", response.msg);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConfigurationAccountMineUpdate({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {               
            configAccountMineUpdate({
                username:       getAuthName(), 
                password:       getAuthPass(),    
                cEmail:         data?.email,
                cMovil:         data?.mobile,
                cPasswordNuevo: data?.password,
            }).then( response => {
                if(response.status){                    
                    // commit('CONFIGURATION_ACCOUNT_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                    notify('Updated User Successfully!', 'success');
                }else{
                    commit("setError", response.message);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.message}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConfigurationAccountAddNewUser({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {               
            configAccountAddNewUser({
                username:       getAuthName(), 
                password:       getAuthPass(),    
                Login:          data?.Login,                 
                Email:          data?.Email,
                Mobile:         data?.Mobile,
                Permission:     data?.Permission,                
            }).then( response => {
                if(response.status){                    
                    commit('CONFIGURATION_ACCOUNT_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();
                    notify('Added New User!', 'success');
                }else{
                    commit("setError", response.msg || response.message);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConfigurationCustomersData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    

        return new Promise((resolve, reject) => {               
            configCustomers({
                username:       getAuthName(), 
                password:       getAuthPass(),                    
            }).then( response => {
                if(response.status){                    
                    commit('CONFIGURATION_CUSTOMERS_DATA', response.message);
                    commit('IS_LOADING', false);
                    resolve();                    
                }else{
                    commit("setError", response.msg || response.message);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConfigurationCustomerUpdateData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    
        
        return new Promise((resolve, reject) => {               
            configCustomerUpdate({
                username:       getAuthName(), 
                password:       getAuthPass(), 
                iIDCliente: data?.iIDCliente,
                iIDMasterCliente: data?.iIDMasterCliente,
                cEmpresa: data?.cEmpresa,
                cFirmante: data?.cFirmante,
                cCif: data?.cCif,
                cIva: data?.cIva,
                cDireccion: data?.cDireccion,
                cPais: data?.cPais,
                cEmail_Admin: data?.cEmail_Admin,
                cEmail_Comercial: data?.cEmail_Comercial,
                cEmail_Routing: data?.cEmail_Routing,
                cEmail_Tecnico: data?.cEmail_Tecnico, 
            }).then( response => {
                if(response.status){                    
                    commit('CONFIGURATION_CUSTOMERS_DATA', response.message);
                    commit('IS_LOADING', false);
                    notify('Successfully Updated Customer', 'success');
                    resolve();                    
                }else{
                    commit("setError", response.msg || response.message);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

    fetchConfigurationCustomerAddNewData({ commit }, data) {
        commit('clearError');
        commit('IS_LOADING', true);    
        
        return new Promise((resolve, reject) => {               
            configCustomerAddNew({
                username:       getAuthName(), 
                password:       getAuthPass(), 
                iIDCliente: data?.iIDCliente,
                iIDMasterCliente: data?.iIDMasterCliente,
                cEmpresa: data?.cEmpresa,
                cFirmante: data?.cFirmante,
                cCif: data?.cCif,
                cIva: data?.cIva,
                cDireccion: data?.cDireccion,
                cPais: data?.cPais,
                cEmail_Admin: data?.cEmail_Admin,
                cEmail_Comercial: data?.cEmail_Comercial,
                cEmail_Routing: data?.cEmail_Routing,
                cEmail_Tecnico: data?.cEmail_Tecnico, 
            }).then( response => {
                if(response.status){                    
                    commit('CONFIGURATION_CUSTOMERS_DATA', response.message);
                    commit('IS_LOADING', false);
                    notify('Successfully Added New Customer!', 'success');
                    resolve();                    
                }else{
                    commit("setError", response.msg || response.message);
                    commit('IS_LOADING', false);
                    reject(`Configuration API has error ${response.msg}`);
                }
                
            }).catch(error => {
                reject(error);
            });
        });
    },

}

const mutations = {   
    CONFIGURATION_ACCOUNT_DATA(state, data){
        state.configurationAccountData = data;
    }, 
    CONFIGURATION_CUSTOMERS_DATA(state, data){
        state.configurationCustomersData = data;
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