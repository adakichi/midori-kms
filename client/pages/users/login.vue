<template>
<v-container>
    <v-row justify="center" aligh-content="center">
        <v-col col=9 xs=9 sm=9 md=6 lg=6>
            <v-card>
              <v-card-title>
                ログインフォーム
                </v-card-title>
                <v-form ref="form" @submit.prevent="">
                <v-card-text>
                    <v-text-field
                      v-model="user.userId"
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
                    <v-btn @click="login">送信</v-btn>
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
    auth:false,
    data(){
      return {
        user:{
          userId:'',
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
      login(){
        this.$auth.loginWith('local',{
          data:this.user
        }).then((res)=>{
          if(res.data.message){
            alert(res.data.message)
            } else {
              this.$router.push('/')
            }
        })
      },
      // login(){
      //   console.log('--get-->')
      //   const data = {userId:this.user.userId,password:this.user.password}
      //   axios.post('/api/auth/login', data)
      //     .then((res)=>{
      //       if(res.data.message){alert(res.data.message)}
      //       console.log(res.data)
      //     })
      // },
      createUser(){
        console.log('--post create user---')
        const data = {name:this.name,password:this.password}
        axios.post('/api/auth/register/', data)
        .then((res)=>{
          if(res.data.message){alert(res.data.message)}
          console.log(res)
        })
      }
    }
  }
</script>