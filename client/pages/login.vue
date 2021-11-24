<template>
<v-container>
    <v-row justify="center" aligh-content="center">
        <v-col col=9 xs=9 sm=9 md=6 lg=6>
            <v-card>
              <v-card-title>
                ログインフォーム
                </v-card-title>
                <v-form ref="form" v-model="valid">
                <v-card-text>
                    <v-text-field
                      v-model="user.id"
                      :counter="20"
                      label="ID"
                      clearable
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="user.password"
                      :append-icon="showpass ? 'mdi-eye' : 'mdi-eye-off' "
                      :type=" showpass ? 'text' : 'password' "
                      label="PASSWORD"
                      required
                      @click:append="showpass = !showpass"
                    ></v-text-field>
                    <v-btn @click="submit">送信</v-btn>
                    </v-card-text>
                </v-form>
            </v-card>
        </v-col>
    </v-row>
</v-container>
</template>

<script>
  export default {
    data(){
      return {
        user:{
          id:'',
          password:''
        },
        showpass:false
      }
    },
    methods:{
      submit(){
        alert('id:' + this.user.id + '\npassword:' + this.user.password)
      //   this.$auth.loginWith('local',{
      //     data:this.user
      // })
      },
    }
  }
</script>