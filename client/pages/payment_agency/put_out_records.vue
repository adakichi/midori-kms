<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>出金予定：Put Out record</v-app-bar-title>
                </v-app-bar>
                <v-app-bar flat>
                    <v-checkbox v-model="isPaidDate" label="出金済のみ"></v-checkbox>
                    <v-checkbox v-model="isExpectedDate" label="仮出金のみ"></v-checkbox>
                    <v-spacer></v-spacer>
                    <div>
                    <v-menu
                     ref="menu"
                     v-model="menu"
                     :close-on-content-click="false"
                     :return-value.sync="dateRange"
                     transition="scale-transition"
                     offset-y
                     left
                     min-width="auto"
                    >
                        <template v-slot:activator="{on, attrs}">
                            <v-text-field
                             v-model="dateRange"
                             label="範囲を選択してください"
                             prepend-icon="mdi-calendar"
                             readonly
                             v-bind="attrs"
                             v-on="on"
                             ></v-text-field>
                        </template>
                    <v-date-picker
                     v-model="dateRange"
                     range
                    >
                    <v-spacer></v-spacer>
                    <v-btn
                     text
                     color="primary"
                     @click="$refs.menu.save(dateRange)"
                     >OK
                    </v-btn>
                    </v-date-picker>
                    </v-menu>
                    </div>
                    <v-btn @click="searchRecords">検索</v-btn>
                </v-app-bar>
                <v-app-bar>
                    <v-spacer></v-spacer>
                    <v-btn @click="downloadCsv">CSV出力<v-icon>mdi-download</v-icon></v-btn>
                    <v-btn @click="deleteExpectedDate">仮出金解除</v-btn>
                    <v-btn @click="confirmPayments">出金確定</v-btn>
                    <v-btn v-show="isAdmin" color="warning" @click="cancelConfirmPayments">出金確定取り消し</v-btn>
                </v-app-bar>
                <v-data-table
                :headers="headers"
                :items="paymentSchedules"
                :items-per-page="50"
                item-key="payment_schedule_id"
                show-select
                show-group-by
                v-model="selected"
                >
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
// methods:DounloadCsv用の関数色々
  //selectedの配列の支払い総額を計算
function totalAmount (arr){
    let total = 0
    arr.forEach((obj) =>{
        total = total + obj.amount
    })
    return total
}

  //口座種別を数字に変換
const kindTextToNum = (text)=>{
    switch(text){
        case '普通':
            return 1
        case '当座':
            return 2
        case '貯蓄':
            return 4
    }
}

  // CSVに変換する際の関数
function convToOne(item){
    const kind = kindTextToNum(item.kind)
    return {
        payment_schedule_id:1,
        bankcode:item.bankcode,
        branchcode:item.branchcode,
        kind: kind ,
        account_number: item.account_number,
        account_holder:item.account_holder,
        amount:item.amount,
        name:item.name
    }
}

//Download用のaタグ作成用関数
import {createDownloadATag} from '/midori-kms/client/plugins/util.js'

  //selectedからIDを取り出して配列にする
function getIds(selected){
    return selected.map(item=>{
        return item.payment_schedule_id
    })
}

  //今日の日付をフォーマットして出力(String)
function todayString(){
    const today = new Date()
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
}

const {Parser} = require('json2csv')
export default {
    layout : 'pa',
    data(){
        return{
            isPaidDate:false,
            isExpectedDate:false,
            menu:false,
            dateRange:[],
            selected:[],
            isAdmin:false,
            headers:[
                {text:'名前',   value:'name'},
                {text:'債権者', value:'creditor_name'},
                {text:'日付',   value:'date'},
                {text:'金額',   value:'amount',  groupable:false},
                {text:'確定',   value:'paid_date'},
                {text:'予定',   value:'expected_date'}
            ]
        }
    },
    computed:{
        paymentSchedules(){
            return this.arr = this.$store.getters['pa/getPaymentSchedules']
        }
    },
    methods:{
        isAdmin(){
            if(this.$auth.user){
                return this.$auth.isAdmin
            }
            return false
        },
        searchRecords(){
            const option = {
                id:0,
                from:this.dateRange[0],
                until:this.dateRange[1],
                isPaidDate:this.isPaidDate,
                isExpectedDate:this.isExpectedDate
            }
            this.$store.dispatch('pa/getDbPaymentSchedules',option)
        },
        downloadCsv(){
            const total = totalAmount(this.selected)
            const fields = ['payment_schedule_id', 'bankcode', 'branchcode', 'kind', 'account_number', 'account_holder', 'amount','name']
            const json2csvParser = new Parser({fields:fields,header:false,withBOM:true})
            let exportText = json2csvParser.parse(this.selected)
            exportText = exportText + '\n"2",,,,,' + this.selected.length + ',' + total + ',' 
            const link = createDownloadATag(exportText)
            link.click()
            //ダウンロードしたら仮で出金したことにする必要がある。
            const ids = getIds(this.selected)
            const today = todayString()
            console.log(ids)
            console.log(today)
            this.$axios.put('/api/payment_agency/payment_schedules',{ids:ids,date:today})
            .then(() =>{
                this.searchRecords()
                this.selected = []
                })
        },
        deleteExpectedDate(){
            const ids = getIds(this.selected)
            this.$axios.put('/api/payment_agency/payment_schedules',{ids:ids,date:null})
            .then(() =>{
                this.searchRecords()
                this.selected = []
                })
        },
        confirmPayments(){
            const ids = getIds(this.selected)
            const today = todayString()
            console.log('confirm')
            this.$axios.put('/api/payment_agency/confirm_payment_schedules',{ids:ids,date:today})
            .then(() =>{
                this.searchRecords()
                this.selected = []
                })
        },
        cancelConfirmPayments(){
            const ids = getIds(this.selected)
            this.$axios.put('/api/payment_agency/confirm_payment_schedules',{ids:ids,date:null})
            .then(() =>{
                this.searchRecords()
                this.selected = []
                })
        }
    },
    created(){
        this.$store.commit('pa/updatePaymentSchedules',[])
    }
}
</script>