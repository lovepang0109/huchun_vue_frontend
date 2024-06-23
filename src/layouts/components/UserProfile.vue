<template>
  <VBadge dot location="bottom right" offset-x="3" offset-y="3" bordered color="success">
    <VAvatar class="cursor-pointer" color="primary" variant="tonal">      
      <VIcon icon="tabler-user" size="32" />
      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="14px" v-model="menu">
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge dot location="bottom right" offset-x="3" offset-y="3" color="success">
                  <VAvatar color="primary" variant="tonal">
                    <VIcon icon="tabler-user" size="64" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ getUserEmail() }}
            </VListItemTitle>
            <VListItemSubtitle>{{ getAuthName() ? getAuthName() : getUserEmail() }}</VListItemSubtitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Change Password -->
          <VListItem>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ props }">
                <VIcon class="me-2 cursor-pointer" icon="tabler-key" size="22" />
                <span v-bind="props" class="cursor-pointer">Change Password</span>
              </template>

              <v-card>
                <v-card-title>
                  <span class="text-h6 mt-4">Change Password</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
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
                          :rules="[rules.required, rules.confirmPassword]"
                          :error-messages="errors.rePassErr"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-textarea label="Note" color="warning" no-resize rows="5" readonly variant="outlined"
                          :focused="true" :model-value=tips></v-textarea>
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
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem link @click="logoutAction">
            <template #prepend>
              <VIcon class="me-2" icon="tabler-logout" size="22" />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
<script>
import { UpdateUserPassword } from '@/api/ConfigManager';
import { initialAbility } from '@/plugins/casl/ability';
import { useAppAbility } from '@/plugins/casl/useAppAbility';
import { notify } from '@/utils';
import { getAuthName, getToken, getUserEmail } from '@/utils/auth';
const { mapGetters, mapActions } = createNamespacedHelpers('user');
const passPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{8,20}|(?=.*[a-zA-Z])(?=.*\d).{10,20}$/;

export default {
  components() {
    getAuthName,
    getUserEmail,
    useAppAbility,
    initialAbility
  },
  data() {
    return {
      getAuthName: getAuthName,
      getUserEmail: getUserEmail,
      ability: useAppAbility(),
      isPasswordVisible: false,
      initialAbility: initialAbility,
      dialog: false,
      menu: false,
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
      errors: {
      },
      userId: getToken(),
      tips: "Password rules: At least eight characters with mixed-case alphabetic characters,numberals and special characters,or at least ten characters with combinations of mixed-case alphabetic characters and either numerals or special characters.",
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
    searchRole(val) {
      // val && val !== this.selectRole && this.queryRoleSelections(val)
    },
  },
  methods: {
    ...mapActions(['logout',]),
    logoutAction() {
      this.logout();

      // Remove "userData" from localStorage
      localStorage.removeItem('userData')

      // Remove "accessToken" from localStorage
      localStorage.removeItem('accessToken')

      this.$router.push('/login').then(() => {
        // Remove "userAbilities" from localStorage
        localStorage.removeItem('userAbilities')

        // Reset ability to initial ability
        this.ability.update(this.initialAbility);
      });
      location.reload();
    },
    close() {
      this.dialog = false
      this.menu = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    async save() {

      if (!this.editedItem.oldPassword ||
        !this.editedItem.newPassword ||
        !this.editedItem.repassword ||
        (this.editedItem.repassword != this.editedItem.newPassword)) {

        if (!passPattern.test(this.editedItem.newPassword))
          this.errors.passErr = 'Invalid new password.'

        if (this.editedItem.newPassword != this.editedItem.repassword)
          this.errors.rePassErr = 'Password does not match.'

        if (!this.editedItem.oldPassword)
          this.errors.oldPassErr = 'Invalid old password'


        setTimeout(() => {
          this.errors = { passErr: '', rePassErr: '', oldPassErr: '' }
        }, 6000);

        return;

      } else {
        if (!passPattern.test(this.editedItem.newPassword)) return;

        const res = await UpdateUserPassword(this.editedItem.oldPassword, this.editedItem.newPassword, this.userId)
        if (res.result.isSuccess) {
          notify('Login password modified successfully')
          this.editedItem.oldPassword = ''
          this.editedItem.newPassword = ''
          this.$emit('close', true)
          this.close()
        } else {
          // Message.warning(res.result.msg);
          notify(res.result.msg, 'error')
        }


      }

    },
  }
}
</script>