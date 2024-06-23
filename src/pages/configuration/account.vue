<template>  
    <VCol cols="12" md="12" lg="12">
        <VCard class="text-center" title="USER DATA">
            <div class="px-4 pb-4" style="min-height: 200px;"> 
                <VRow class="align-center">
                    <VCol cols="12" md="4" sm="6">
                        <VTextField v-model="authName" label="Login" type="text"/>
                    </VCol>
                    <VCol cols="12" md="4" sm="6">
                        <VTextField v-model="authEmail" label="Email" type="email"/>
                    </VCol>
                    <VCol cols="12" md="4" sm="6">
                        <VTextField v-model="authMobile"label="Mobile" type="mobile"/>
                    </VCol>
                </VRow>               
                <VRow class="align-center">
                    <v-col cols="12" md="4" sm="6">
                        <v-text-field
                        v-model="editedItem.newPassword"
                        label="New Password" 
                        :type="isPasswordVisible ? 'text' : 'password'"
                        :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                        @click:append-inner="isPasswordVisible = !isPasswordVisible"                                                      
                        :error-messages="errors.passErr"
                        ></v-text-field>
                        <!-- :rules="[rules.checkpass]"  -->
                    </v-col>
                    <v-col cols="12" md="4" sm="6">
                        <v-text-field
                        v-model="editedItem.repassword"
                        label="Re-enter Password"
                        :type="isPasswordVisible ? 'text' : 'password'"
                        :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                        @click:append-inner="isPasswordVisible = !isPasswordVisible"
                        :rules="[rules.confirmPassword]"
                        :error-messages="errors.rePassErr"                                
                        ></v-text-field>
                    </v-col>
                    <VCol cols="12" md="4" sm="6" class="text-right">
                        <v-btn @click="updateUser" color="info" dark class="btn border" size="small" prepend-icon="tabler-device-floppy">
                            Update User
                        </v-btn>
                    </VCol>
                </VRow>               
            </div>
        </VCard>

        <VCard class="text-center my-4">
            <v-divider></v-divider>
            <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate style="min-height: 400px;"></v-progress-circular>
            <div v-else class="px-4 py-4" style="min-height: 400px;">
            <VCol cols="12" md="4" sm="6" class="text-left">
                <!-- <v-btn @click="addNewUser" color="primary" dark class="btn border" size="small" prepend-icon="tabler-plus"> -->
                <v-btn @click="newDialog = true" color="primary" dark class="btn border" size="small" prepend-icon="tabler-plus">
                    Add New User
                </v-btn>
            </VCol>
            <v-data-table   class="elevation-1 px-4"
                            :headers="headers" 
                            :items="connectionData" 
                            style="min-height: 450px; font-size: 11pt;"
                            :sort-by="[{ key: 'calories', order: 'asc' }]" >                
                <template v-slot:item="{ item, index }">
                <tr class="text-left">              
                    <td>{{ item.Login }}</td>    
                    <td>{{ item.Email }}</td>
                    <td>{{ item.Movil }}</td>
                    <td>
                        <VIcon :icon="!item.Estado ? 'tabler-circle-check' : 'tabler-x'" :color="!item.Estado ? 'success': 'warning'" />
                    </td>              
                    <td>
                        <VIcon :icon="!item.Banned ? 'tabler-circle-check' : 'tabler-x'" :color="!item.Banned ? 'success': 'warning'" />
                    </td>              
                    <td>{{ item.master }}</td>
                    <td>All</td>               
                    <td class="d-flex justify-center align-center">
                        <div v-for="(value, key) in Array.from(item.Permisos)" :key="key" class="pr-2">
                            <VIcon v-if="key == 0" icon="tabler-users"          :color="value == 0 ? 'warning' : value == 1 ? 'primary' : 'success'" @click="dialog = true; userData = item"/>
                            <VIcon v-if="key == 1" icon="tabler-chart-bar"      :color="value == 0 ? 'warning' : value == 1 ? 'primary' : 'success'" @click="dialog = true; userData = item"/>
                            <VIcon v-if="key == 2" icon="tabler-bug-filled"     :color="value == 0 ? 'warning' : value == 1 ? 'primary' : 'success'" @click="dialog = true; userData = item"/>
                            <VIcon v-if="key == 3" icon="tabler-server"         :color="value == 0 ? 'warning' : value == 1 ? 'primary' : 'success'" @click="dialog = true; userData = item"/>
                            <VIcon v-if="key == 4" icon="tabler-road"           :color="value == 0 ? 'warning' : value == 1 ? 'primary' : 'success'" @click="dialog = true; userData = item"/>
                            <VIcon v-if="key == 5" icon="tabler-currency-euro"  :color="value == 0 ? 'warning' : value == 1 ? 'primary' : 'success'" @click="dialog = true; userData = item"/>
                            <VIcon v-if="key == 6" icon="tabler-folder-open"    :color="value == 0 ? 'warning' : value == 1 ? 'primary' : 'success'" @click="dialog = true; userData = item"/>
                            <VIcon v-if="key == 7" icon="tabler-deselect"       :color="value == 0 ? 'warning' : value == 1 ? 'primary' : 'success'" @click="dialog = true; userData = item"/>
                        </div>
                    </td>               
                </tr>
                </template>
            </v-data-table>
            </div>
        </VCard>

        <!-- Update Window -->            
        <VDialog v-model="dialog" :width="$vuetify.display.smAndDown ? 'auto' : 700">
            <VCard class="pa-1">
            <VCardItem class="text-center">
                <VCardTitle class="text-h5">
                Edit User Information
                </VCardTitle>                  
            </VCardItem>

            <VCardText>
                <VForm class="mt-6" @submit.prevent="onFormSubmit">
                <VRow class="border mb-4">                    
                    <VCol cols="12">
                        <span>User Data</span>
                    </VCol>
                    <VCol cols="12" md="6">
                        <VTextField label="Login" v-model="userData.Login"/>
                    </VCol>

                    <VCol cols="12" md="6">
                        <VTextField label="Email" v-model="userData.Email"/>
                    </VCol>

                    <VCol cols="12" md="6">
                        <VTextField label="Mobile" v-model="userData.Movil"/>
                    </VCol>

                    <VCol cols="12" md="6">
                        <VSelect                        
                            label="Master"
                            :items="getMasterList"
                            v-model="userData.master"
                        />
                    </VCol>

                    <VCol cols="12" md="6">
                        <VSelect                            
                            label="Reports"
                            :items="reportTypes"
                            v-model="reportTypes[userData.report]"
                        />
                    </VCol>
                </VRow>

                <VRow class="border">
                    <VCol cols="12">
                        <span>User Permissions</span>
                    </VCol>
                    <VCol cols="12" md="6">                        
                        <VSelect
                            prepend-icon="mdi-users"
                            :items="getPermissionType"
                            v-model="uPerm0"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-chart-bar"
                            :items="getPermissionType"
                            v-model="uPerm1"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-bug"
                            :items="getPermissionType"                            
                            v-model="uPerm2"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                        
                        <VSelect                            
                            prepend-icon="mdi-server"
                            :items="getPermissionType"
                            v-model="uPerm3"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-road"
                            :items="getPermissionType"
                            v-model="uPerm4"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-euro"
                            :items="getPermissionType"
                            v-model="uPerm5"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-folder-open"
                            :items="getPermissionType"
                            v-model="uPerm6"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                        
                        <VSelect                            
                            prepend-icon="mdi-select"
                            :items="getPermissionType"
                            v-model="uPerm7"
                        />
                    </VCol>
                </VRow>
                <VCol cols="12" class="d-flex flex-wrap justify-center">                    
                    <v-progress-circular v-if="IsLoading" :size="45" color="primary" indeterminate></v-progress-circular>
                    <div v-else class="d-flex flex-wrap justify-center gap-4 mt-4 pt-4">
                        <VBtn type="submit" >Update</VBtn>
                        <VBtn @click="onUserPassReset">Reset Password</VBtn>
                        <VBtn @click="onUserBlock">Block</VBtn>
                        <VBtn color="secondary" variant="tonal" @click="onFormReset">Cancel</VBtn>
                    </div>
                </VCol>
                </VForm>
            </VCardText>
            </VCard>
        </VDialog>
        <!-- Add New User Window -->            
        <VDialog v-model="newDialog" :width="$vuetify.display.smAndDown ? 'auto' : 700">
            <VCard class="pa-1">
            <VCardItem class="text-center">
                <VCardTitle class="text-h5">
                Add New User
                </VCardTitle>                  
            </VCardItem>

            <VCardText>
                <VForm class="mt-6" @submit.prevent="onFormSubmitNewUser">
                <VRow class="border mb-4">
                    <VCol cols="12">
                        <span>User Data</span>
                    </VCol>
                    <VCol cols="12" md="6">
                        <VTextField label="Login" v-model="newUserData.Login"/>
                    </VCol>

                    <VCol cols="12" md="6">
                        <VTextField label="Email" v-model="newUserData.Email"/>
                    </VCol>

                    <VCol cols="12" md="6">
                        <VTextField label="Mobile" v-model="newUserData.Mobile"/>
                    </VCol>

                    <VCol cols="12" md="6">
                        <VSelect  label="Master" :items="getMasterList" v-model="newUserData.master" />
                    </VCol>

                    <VCol cols="12" md="6">
                        <VSelect label="Reports" :items="reportTypes" v-model="reportTypes[newUserData.report]"/>
                    </VCol>
                </VRow>

                <VRow class="border">
                    <VCol cols="12">
                        <span>User Permissions</span>
                    </VCol>
                    <VCol cols="12" md="6">                        
                        <VSelect
                            prepend-icon="mdi-users"
                            :items="getPermissionType"
                            v-model="nUPerm0"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-chart-bar"
                            :items="getPermissionType"
                            v-model="nUPerm1"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-bug"
                            :items="getPermissionType"                            
                            v-model="nUPerm2"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                        
                        <VSelect                            
                            prepend-icon="mdi-server"
                            :items="getPermissionType"
                            v-model="nUPerm3"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-road"
                            :items="getPermissionType"
                            v-model="nUPerm4"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-euro"
                            :items="getPermissionType"
                            v-model="nUPerm5"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                    
                        <VSelect                            
                            prepend-icon="mdi-folder-open"
                            :items="getPermissionType"
                            v-model="nUPerm6"
                        />
                    </VCol>
                    <VCol cols="12" md="6">                        
                        <VSelect                            
                            prepend-icon="mdi-select"
                            :items="getPermissionType"
                            v-model="nUPerm7"
                        />
                    </VCol>
                </VRow>
                <VCol cols="12" class="d-flex flex-wrap justify-center">                    
                    <v-progress-circular v-if="IsLoading" :size="45" color="primary" indeterminate></v-progress-circular>
                    <div v-else class="d-flex flex-wrap justify-center gap-4 mt-4 pt-4">
                        <VBtn type="submit" >Create</VBtn>                        
                        <VBtn color="secondary" variant="tonal" @click="onFormReset">Cancel</VBtn>
                    </div>
                </VCol>
                </VForm>
            </VCardText>
            </VCard>
        </VDialog>
    </VCol>    
  </template>
<script>
import { createNamespacedHelpers } from 'vuex';
import { notify } from '@/utils';
import { getAuthName, getUserPhone, getUserEmail } from '@/utils/auth';
import UserInfoEditDialog from '@/@core/components/UserInfoEditDialog.vue';

const passPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{8,20}|(?=.*[a-zA-Z])(?=.*\d).{10,20}$/;

const { mapGetters, mapActions, mapState } = createNamespacedHelpers('configuration');
export default {  
components: {  
    UserInfoEditDialog  
},
data() {    
    return {
        authName: getAuthName(),
        authEmail: getUserEmail(),
        authMobile: getUserPhone(),        
        serverUrl: window.configData.APP_BASE_URL,
        headers: [
            { title: 'Username',            align: 'start', key: 'Login', },
            { title: 'Email',               align: 'start', key: 'Email', },
            { title: 'Mobile Number',       align: 'start', key: 'Movil', },
            { title: 'Banned',              align: 'start', key: 'Estado', },
            { title: 'User Locked (Pass)',  align: 'start', key: 'Banned' },
            { title: 'Master',              align: 'start', key: 'master', },          
            { title: 'Reports',             align: 'start', key: 'AlcanceTxt', },          
            { title: 'Permissions',         align: 'start', key: 'Permisos', },          
        ],     
        connectionData: [], 
        //
        editedItem: {
            status: 'E'
        },
        rules: {
            required: value => !!value || 'This field is required',  
            checkpass: (value) => {
                return passPattern.test(value) || 'Invalid password';
            },
            confirmPassword: () => {
                return (this.editedItem.newPassword === this.editedItem.repassword) || 'Password does not match'
            },        
        },
        isPasswordVisible: false,
        errors: {},
        dialog: false,
        newDialog: false,
        userData: null,
        permissionTypes: {
            0: 'No readable',
            1: 'Readable but not modifiable',
            3: 'Readable & modifiable'
        },
        reportTypes: ['All', 'Master', 'User'],
        uPerm0: null, uPerm1: null, uPerm2: null, uPerm3: null, 
        uPerm4: null, uPerm5: null, uPerm6: null, uPerm7: null, 
        //
        newUserData: {Login: null, Email: null, Movil: null, master: null, report: null},
        nUPerm0: 'No readable', nUPerm1: 'No readable', nUPerm2: 'No readable', nUPerm3: 'No readable', 
        nUPerm4: 'No readable', nUPerm5: 'No readable', nUPerm6: 'No readable', nUPerm7: 'No readable', 
    }
},
computed: {
    ...mapGetters(['GetConfigurationAccountData', 'IsLoading', 'GetError']),   
    getMasterList(){
        return this.GetConfigurationAccountData?.masterList?.map( item => `${item.NOMBRE} [${item.ID_MASTER}]`);
    },
    getPermissionType(){
        return Object.values(this.permissionTypes);
    },    
},
mounted() {
    this.fetchConfigurationAccountData({            
        iIDMasterBulk: 1,        
    }).then(() => {
        this.connectionData = this.GetConfigurationAccountData?.data;        
    });     
},
methods: {
    ...mapActions([ 'fetchConfigurationAccountData', 'fetchConfigurationAccountUserDataUpdate', 'fetchConfigurationAccountUserPassReset', 
                    'fetchConfigurationAccountUserBlock', 'fetchConfigurationAccountMineUpdate', 'fetchConfigurationAccountAddNewUser']),
    getNumList(array){
        return Array.isArray(array) ? array.map(str => parseInt(str.match(/\d+/)[0])).join(',') : array;
    },
    async updateUser() {    
        if( !this.editedItem.newPassword || !this.editedItem.repassword || 
            (this.editedItem.repassword != this.editedItem.newPassword) ){

            if(this.editedItem.newPassword != this.editedItem.repassword)
                this.errors.rePassErr = 'Password does not match.'       

            if(!this.editedItem.repassword){
                this.errors.passErr = 'Please type password.';
                this.errors.rePassErr   = 'Please type password.';
            }

            setTimeout(()=> {
                this.errors = {passErr: '', rePassErr: '', oldPassErr: ''}
            }, 6000);

            return;

        }else{
            
            this.fetchConfigurationAccountMineUpdate({
                email:     this.authEmail,
                mobile:    this.authMobile,
                password:  this.editedItem?.repassword
            });        
        }
    },    
    onFormReset(){
        this.dialog     = false;        
        this.newDialog  = false;        
    },
    getKeyCode(targetValue){
        return Object.keys(this.permissionTypes).find(key => this.permissionTypes[key] == targetValue);
    },
    onFormSubmit(){
        let uPermission = "";
        for(let ii = 0; ii < 8; ii++){
            uPermission = uPermission + this.getKeyCode(eval(`this.uPerm${ii}`));
        }                
        this.fetchConfigurationAccountUserDataUpdate({
            iIDUsuario:     this.userData?.IDUsuario,
            cLoginNuevo:    this.userData?.Login,
            cEmail:         this.userData?.Email,
            cMovil:         this.userData?.Movil,
            cPermisos:      uPermission,            
            iIDMasterBulk:  this.userData?.master.match(/\[(\d+)\]/) ? 
                            parseInt( this.userData?.master.match(/\[(\d+)\]/)[1] ) : 
                            this.userData?.IDMasterBulk,
        });
    },
    onFormSubmitNewUser(){
        let uPermission = "";
        for(let ii = 0; ii < 8; ii++){
            uPermission = uPermission + this.getKeyCode(eval(`this.nUPerm${ii}`));
        }                
        this.fetchConfigurationAccountAddNewUser({            
            Login:          this.newUserData?.Login,
            Email:          this.newUserData?.Email,
            Mobile:         this.newUserData?.Mobile,
            Permission:     uPermission,            
        });
    },
    onUserPassReset(){
        this.fetchConfigurationAccountUserPassReset({
            iIDUsuario:     this.userData?.IDUsuario,
            cLoginNuevo:    this.userData?.Login,
            cEmail:         this.userData?.Email,
            cMovil:         this.userData?.Movil,
            cPermisos:      -1,
            iIDMasterBulk:  'REC',  
        });
    },
    onUserBlock(){
        this.fetchConfigurationAccountUserBlock({
            iIDUsuario:     this.userData?.IDUsuario,
        });
    }
},
watch: {     
    GetError(value){
        if(value != null){
            notify(value, 'error');        
        }
    }, 
    userData(uData){
        if(uData.Permisos){
            this.uPerm0 = this.permissionTypes[uData.Permisos[0]];
            this.uPerm1 = this.permissionTypes[uData.Permisos[1]];
            this.uPerm2 = this.permissionTypes[uData.Permisos[2]];
            this.uPerm3 = this.permissionTypes[uData.Permisos[3]];
            this.uPerm4 = this.permissionTypes[uData.Permisos[4]];
            this.uPerm5 = this.permissionTypes[uData.Permisos[5]];
            this.uPerm6 = this.permissionTypes[uData.Permisos[6]];
            this.uPerm7 = this.permissionTypes[uData.Permisos[7]];
        }
    },   
    newUserData(uData){
        if(uData.Permisos){
            this.nUPerm0 = this.permissionTypes[uData.Permisos[0]];
            this.nUPerm1 = this.permissionTypes[uData.Permisos[1]];
            this.nUPerm2 = this.permissionTypes[uData.Permisos[2]];
            this.nUPerm3 = this.permissionTypes[uData.Permisos[3]];
            this.nUPerm4 = this.permissionTypes[uData.Permisos[4]];
            this.nUPerm5 = this.permissionTypes[uData.Permisos[5]];
            this.nUPerm6 = this.permissionTypes[uData.Permisos[6]];
            this.nUPerm7 = this.permissionTypes[uData.Permisos[7]];
        }
    },   
}
}
</script>