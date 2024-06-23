<template>
  <VRow no-gutters class="auth-wrapper" :style="`background: url(${AppBackgroundImg})`">
    <VCol cols="12" lg="12" class="d-flex align-center justify-center" :class="isMobile ? 'px-3' : ''">
      <VCard flat :min-width="isMobile ? 350 : 500" :max-width="500" class="mt-12 mt-sm-0 pa-4 border"
        :class="isMobile ? 'px-0' : ''">
        <VCardText>          
          <VCol>
            <div class="d-flex justify-center align-center">
              <img class="" src="@/assets/images/panel-sms-logo.png" >              
            </div>
          </VCol>
          <hr class="hr mb-4" />
        </VCardText>        

        <VCardText>
          <VForm ref="refVForm" @submit.prevent="onSubmit">
            <VRow>
              <!-- email -->
              <VCol cols="12 pb-4">
                <VTextField v-model="userName" label="User Name" type="username" :rules="[requiredValidator]"
                  :error-messages="errors.email" class="mb-4" />
              </VCol>

              <!-- password -->
              <VCol cols="12 pb-4">
                <VTextField v-model="password" label="Password" :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible" :error-messages="errors.password"
                  class="pb-4 mb-4" />

                <p class="text-center">
                  <span class="text-error">{{ errors.msg }}</span>
                </p>

                <VBtn v-if="!loading" block type="submit">Login</VBtn>
                <div v-else class="text-center">
                  <v-progress-circular :size="30" color="primary" indeterminate></v-progress-circular>
                </div>
              </VCol>
              <VCol cols="12 pb-4"></VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
      <!-- Reset Passs form >>  -->
      <v-dialog
        v-model="dialog"
        max-width="500px"
      >                
        <template v-slot:activator="{ props }">
        </template>
        <v-card>
          <v-card-title class="bg-primary">
            <span class="text-h6 mt-4 text-white">Change Password</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="12" class="text-primary font-weitght-bold">
                  You need to update your password because this is the first time your are signing in,or because your
                  password has expired.
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="editedItem.oldPassword" label="Current Password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible" :rules="[rules.required]"
                    :error-messages="errors.oldPassErr"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="editedItem.newPassword" label="New Password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    :rules="[rules.required, rules.checkpass]" :error-messages="errors.passErr"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field v-model="editedItem.repassword" label="Re-enter Password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    :rules="[rules.required, rules.confirmPassword]" :error-messages="errors.rePassErr"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-textarea label="Note" color="warning" no-resize rows="5" readonly variant="outlined" :focused="true"
                    :model-value=config.passTips></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="close">
              Cancel
            </v-btn>
            <v-btn color="blue-darken-1" variant="text" @click="save">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </VCol>
  </VRow>
</template>

<script setup>
import AppBackgroundImg from '@/assets/images/pages/bg.jpg'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { config } from '@layouts/config'
import { themeConfig } from '@themeConfig'
import { alphaValidator, requiredValidator } from '@validators'
import { isMobile } from 'mobile-device-detect'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from "vuex";
import { UpdateUserPassword } from '@/api/ConfigManager';
import { getToken } from '@/utils/auth';
import { notify } from '@/utils';
const passPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{8,20}|(?=.*[a-zA-Z])(?=.*\d).{10,20}$/;

const ability = useAppAbility()
const router = useRouter();
const route = useRoute();
const store = useStore();
const isPasswordVisible = ref(false)
const refVForm = ref()
// const userName = ref('lilysms')
// const password = ref('mobilegr')
const userName = ref('')
const password = ref('')
const loading = ref(false)
const currentName = ref('') // current login user 
const loginFailCount = ref(0) // login fail count for same account 
const redirect = ref('')
/* ######################### Reset Pass ################################### */
const dialog = ref(false);
const editedItem = ref({status: 'E'})
const errors = ref({email: undefined, password: undefined, msg: undefined});
const rules = ref({
  required: value => !!value || 'This field is required',
  checkpass: (value) => {
    return passPattern.test(value) || 'Invalid password';
  },
  confirmPassword: () => {
    return (editedItem.value.newPassword === editedItem.value.repassword) || 'Password does not match'
  },
});

function loginProcess() {  
  loading.value = true;
  store.dispatch('user/auth', { username: userName.value, password: password.value })
    .then((response) => {

      console.log(response);
      
      let userAbilities = [{ "action": "manage", "subject": "all" }];
      localStorage.setItem('userAbilities', JSON.stringify(userAbilities));
      ability.update(userAbilities)
      router.push({ path: redirect.value || '/' })
      loading.value = false

      // Redirect to `to` query if exist or redirect to index route
      router.replace(route.query.to ? String(route.query.to) : '/')

    }).catch((err) => {
      
      errors.value = { email: '', password: '', msg: err }

      loading.value = false;

    })
}

const onSubmit = () => {
  errors.value = { email: '', password: '', msg: '' }
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      loginProcess()
    }
  })
}

const close = () => {
 
  errors.value = {  email: '', password: '', msg: '', passErr: '', rePassErr: '', oldPassErr: '' }

  dialog.value = false;

  editedItem.value.oldPassword = ''
  editedItem.value.newPassword = ''
  Object.assign({}, editedItem);
};

const save = async () => {   
     
    if( !editedItem.value.oldPassword || 
        !editedItem.value.newPassword || 
        !editedItem.value.repassword || 
        (editedItem.value.repassword != editedItem.value.newPassword) ){

    if (!passPattern.test(editedItem.value.newPassword))
      errors.value.passErr = 'Invalid new password.'

    if (editedItem.value.newPassword != editedItem.value.repassword)
      errors.value.rePassErr = 'Password does not match.'

    if (!this.editedItem.oldPassword)
      errors.value.oldPassErr = 'Invalid old password'


    setTimeout(() => {
      errors.value = { passErr: '', rePassErr: '', oldPassErr: '' }
    }, 6000);

    return;

  } else {
    if (!passPattern.test(editedItem.value.newPassword)) return;

    const userId = getToken();
    const res = await UpdateUserPassword(editedItem.value.oldPassword, editedItem.value.newPassword, userId);

        if (res.result.isSuccess) {
          notify('Login password modified successfully')
          editedItem.value.oldPassword = ''
          editedItem.value.newPassword = ''
          
          close()
        } else {
          notify(res.result.msg, 'error')
        }
    }

};
</script>
<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  redirectIfLoggedIn: true
</route>
