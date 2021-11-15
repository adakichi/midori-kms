<template>
    <div>
        <v-row justify="center" aligh-content="center">
            <v-col cols=12 sm=8 md=8 lg=4>
        <v-card>
            <v-toolbar color="primary">
            <v-toolbar-title>業務報告書</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="routerPush('/tools/tools_index')">戻る</v-btn>
            </v-toolbar>
            <v-card-title>
                <v-select 
                filled
                :items="division"
                label="所属"
                v-model="selectedDivision"></v-select>
                </v-card-title>
            <v-card-text>
                <v-form ref="form" @submit.prevent>
                    <v-text-field
                    v-model="name"
                    :counter="10"
                    label="名前"
                    ></v-text-field>
                    <v-textarea v-model="report"
                    label="メモ">
                    </v-textarea>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="submit">送信</v-btn>
            </v-card-actions>
                </v-form>
                </v-card-text>
        </v-card>
        <v-card><p>name:{{name}}</p>
        <p>division:{{division}}</p>
        <p>selectedDivision:{{selectedDivision}}
        <p>report:{{report}}</p></v-card>
        </v-col>
        </v-row>
        <v-btn @click="test">test</v-btn>
    </div>
</template>

<script>
import axios from 'axios'
import {chatworkConf} from '/midori-kms/midori-kms/midori-kms_config'
// const room = require('/midori-kms/midori-kms/midori-kms_config')
export default {
    data() {
        return {
            name:"",
            selectedDivision:{},
            division:[
                { text:"新規", value:"新規"},
                { text:"交面", value:"交面"}
                ],
            report:""
        }
    },
    methods:{
            routerPush(path){
                this.$router.push(path)
            },
            submit(){
                const result = window.confirm('本当に送信しますか？')
                if(result){
                let body = "[info][title]" + this.name + "[/title]"
                    body = body + this.report + "[/info]"
                    axios.get(chatworkConf.baseUrl + '/me')
                        .then(response =>{console.log('response!')})
                    console.log('confirm:yes')
                }
            },
            test(){
                console.log(chatworkConf)
            }
    }
}
</script>