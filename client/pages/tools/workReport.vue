<template>
    <div>
        <v-row justify="center" aligh-content="center">
            <v-col cols=12 sm=8 md=8 lg=5 xl=12 >
        <v-card>
            <v-toolbar color="accent">
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
                    <v-textarea
                    v-model="report"
                    :hint="divisionFormat.hint"
                    label="メモ">
                    </v-textarea>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="submit">送信</v-btn>
            </v-card-actions>
                </v-form>
                </v-card-text>
        </v-card>
        </v-col>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    data() {
        return {
            name:'',
            selectedDivision:{},
            division:[
                { text:"新規", value:"新規"},
                { text:"交面", value:"交面"}
                ],
            report:''
        }
    },
    methods:{
            routerPush(path){
                this.$router.push(path)
            },
            submit(){
                    if(this.name == '' || this.selectedDivision === undefined){
                        alert('名前もしくは所属が空です。')
                    }else{
                const result = window.confirm(this.selectedDivision + '宛です。\n本当に送信しますか？')
                if(result){
                let body = "[info][title]" + this.name + "[/title]"
                    body = body + this.report + "[/info]"
                    axios.post('http://localhost:3000/api/cw/send',{
                        content: body,
                        division:this.selectedDivision
                    }).then((response) =>{
                        let strings = ''
                        response.data.forEach(element => {
                            console.log(element)
                            strings = strings + element.message_id + '\n'
                        });
                        if(strings){strings = '送信成功\n'+ 'message_ids\n' + strings}
                        alert(strings)
                    }).catch((error)=>{
                        console.log('error:')
                        console.log(error)
                        alert(error)
                    }).then(console.log('submit:Done!'))
                    }
                }
            }
        },
        computed:{
            divisionFormat(){
                let format = ''
                let hint =''
                switch(this.selectedDivision){
                    case '新規':
                        format = '受電：　　件\n成約：　　件\n[hr]業務報告'
                        hint = '吉澤さんに送信されます'
                        break;
                    case '交面':
                        format = '交面架電：　　件\n交面実績：　　件\n意思確認：　　件\n[hr]業務報告\n'
                        hint = '交面全員に送信されます'
                        break;
                }
                this.report = format
                return {format:format,hint:hint}
            }
        }
    }
</script>