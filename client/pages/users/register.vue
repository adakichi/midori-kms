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
                    <v-select
                      v-model="user.division"
                      :items='divisions'
                      :counter="20"
                      label="所属"
                      required
                    ></v-select>
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
    auth:false,
    data(){
      return {
        user:{
          name:'',
          userId:'',
          password:'',
          division:'無所属'
        },
        showpass:false,
        divisions:['新規 (過払い)','新規 (WEB・相続)','調査','中決','交面','破産','交渉','完了','カスタマー','債務整理','相続','札幌','名古屋','岡山','広島','松山','高知','熊本','無所属'],
      }
    },
    methods:{
      createUser(){
        console.log('--post create user---')
        const data = {name:this.user.name,userId:this.user.userId, password:this.user.password,division:this.user.division}
        axios.post('/api/auth/register/', data)
        .then((res)=>{
          if(res.data.message){alert(res.data.message)}
            this.$auth.loginWith('local',{data:this.user})
        })
      }
    }
  }
</script>