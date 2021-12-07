<template>
<v-container>
    <v-row justify="center" aligh-content="center">
        <v-col col=9 xs=9 sm=9 md=6 lg=6>
            <v-card>
              <v-card-title>
                新規ユーザー登録
                </v-card-title>
                <v-form ref="form" @submit.prevent="">
                <v-card-text>
                    <v-text-field
                      v-model="user.userId"
                      :counter="5"
                      label="ID"
                      clearable
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="user.name"
                      :counter="20"
                      label="Name"
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
                    <v-btn @click="createUser">登録</v-btn>
                    </v-card-text>
                </v-form>
            </v-card>
        </v-col>
    </v-row>
</v-container>
</template>

<script>
import axios from 'axios'
  export default {
    data(){
      return {
        user:{
          name:'',
          userId:'',
          password:''
        },
        showpass:false
      }
    },
    methods:{
      createUser(){
        console.log('--post create user---')
        const data = {name:this.user.name,userId:this.user.userId, password:this.user.password}
        axios.post('http://localhost:3000/api/auth/register/', data)
        .then((res)=>{
          if(res.data.message){alert(res.data.message)}
            this.$auth.loginWith('local',{data:this.user})
        })
      }
    }
  }
</script>