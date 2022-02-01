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
                    <v-btn @click="judgementPaid">判定<v-icon></v-icon></v-btn>
                    <v-btn @click="downloadCsv">CSV出力<v-icon>mdi-download</v-icon></v-btn>
                    <v-btn v-show="isMatched ? false : true " @click="deleteExpected">仮出金解除</v-btn>
                    <v-btn @click="confirmPayments">出金確定</v-btn>
                    <v-btn v-show="isAdmin" color="warning" @click="cancelConfirmPayments">出金確定取り消し</v-btn>
                </v-app-bar>
                <v-tabs v-model="tabs">
                    <v-tab>通常</v-tab>
                    <v-tab>判定後</v-tab>
                    <v-tab>OK</v-tab>
                    <v-tab>NG</v-tab>
                    <v-tab>人毎</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tabs">

                <!-- 通常タブ -->
                <v-tab-item>

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
                </v-tab-item>

                <!-- 判定後タブ -->
                <v-tab-item>
                    <v-data-table
                    :headers="headersJudgedSelectedArray"
                    :items="judgedSelectedArray"
                    :items-per-page="50"
                    item-key="payment_schedule_id"
                    show-select
                    show-group-by
                    v-model="selected"
                    >
                    </v-data-table>
                </v-tab-item>
                <!-- OKタブ -->
                <v-tab-item>
                    <v-data-table
                    :headers="headersOkArray"
                    :items="okArray"
                    :items-per-page="50"
                    item-key="payment_schedule_id"
                    show-select
                    show-group-by
                    v-model="selected"
                    >
                    </v-data-table>
                </v-tab-item>

                <!-- NGタブ -->
                <v-tab-item>
                    <v-data-table
                    :headers="headersNgArray"
                    :items="ngArray"
                    :items-per-page="50"
                    item-key="payment_schedule_id"
                    show-select
                    show-group-by
                    v-model="selected"
                    >
                    </v-data-table>
                </v-tab-item>

                <!-- 人毎タブ -->
                <v-tab-item>
                    <v-data-table
                    :headers="headersEditedCustomersArray"
                    :items="editedCustomersArray"
                    :items-per-page="50"
                    item-key="customer_id"
                    show-select
                    show-group-by
                    v-model="selected"
                    >
                    </v-data-table>
                </v-tab-item>

                </v-tabs-items>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { getIdsFromPaymentSchedules } from '/midori-kms/client/plugins/util.js'
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

//deleteExpected用　関数
function turnPositiveIntoNegative(selecteds){
    return selecteds.map((itemObject)=>{
        itemObject.amount = -(itemObject.amount)
        itemObject.commision = -(itemObject.commision)
        itemObject.advisory_fee = -(itemObject.advisory_fee)
        return itemObject
    })
}

  //今日の日付をフォーマットして出力(String)
function todayString(){
    const today = new Date()
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
}

import {getNextWeek,judgePay} from '/midori-kms/client/plugins/util.js'
const {Parser} = require('json2csv')
export default {
    layout : 'pa',
    data(){
        return{
            isPaidDate:false,
            isExpectedDate:false,
            menu:false,
            isMatched:false,    //マッチ済みかどうかのスイッチ。これで仮出金解除等のボタンの表示のON/OFFを切り替える。

            //メインのDataTable用 配列
            paymentSchedules:[],
            judgedSelectedArray:[],
            editedCustomersArray:[],
            okArray:[],
            ngArray:[],
            dateRange:[],
            selected:[],
            tabs:null,
            headers:[
                {text:'名前',   value:'name'},
                {text:'債権者', value:'creditor_name'},
                {text:'日付',   value:'date'},
                {text:'金額',   value:'amount',  groupable:false},
                {text:'確定',   value:'paid_date'},
                {text:'予定',   value:'expected_date'}
            ],
            headersJudgedSelectedArray:[
                {text:'判定結果',value:'isCanPay'},
                {text:'名前',   value:'name'},
                {text:'債権者', value:'creditor_name'},
                {text:'日付',   value:'date'},
                {text:'金額',   value:'amount',  groupable:false},
                {text:'確定',   value:'paid_date'},
                {text:'予定',   value:'expected_date'}
            ],
            headersOkArray:[
                {text:'判定結果',value:'isCanPay'},
                {text:'名前',   value:'name'},
                {text:'債権者', value:'creditor_name'},
                {text:'日付',   value:'date'},
                {text:'金額',   value:'amount',  groupable:false},
                {text:'確定',   value:'paid_date'},
                {text:'予定',   value:'expected_date'}
            ],
            headersNgArray:[
                {text:'判定結果',value:'isCanPay'},
                {text:'名前',   value:'name'},
                {text:'債権者', value:'creditor_name'},
                {text:'日付',   value:'date'},
                {text:'金額',   value:'amount',  groupable:false},
                {text:'確定',   value:'paid_date'},
                {text:'予定',   value:'expected_date'}
            ],
            headersEditedCustomersArray:[
                {text:'番号', value:'customer_id'},
                {text:'名前',   value:'name'},
                {text:'初期売掛金',   value:'default_accounts_recivable'},
                {text:'確定日',   value:'paid_date'},
                {text:'予定日',   value:'expected_date'},
                {text:'前 預り金',   value:'depositBeforeJudge'},
                {text:'後 預り金',   value:'deposit',  groupable:false},
                {text:'立替',   value:'sumAmount', groupable:false},
                {text:'手数料',   value:'sumCommision', groupable:false},
                {text:'顧問料',   value:'sumAdvisoryFee', groupable:false}
            ]
        }
    },
    computed:{
        // paymentSchedules(){
        //     return this.arr = this.$store.getters['pa/getPaymentSchedules']
        // },
        isAdmin(){
            if(this.$auth.user){
                return this.$auth.user.isAdmin
            }
            return false
        }
    },
    methods:{
        searchRecords(){
            const option = {
                from:this.dateRange[0],
                until:this.dateRange[1],
                isPaidDate:this.isPaidDate,
                isExpectedDate:this.isExpectedDate
            }
            this.$axios.get('api/payment_agency/payment_schedules',{params:option})
            .then((response)=>{
                this.paymentSchedules = response.data
            })
        },
        judgementPaid(){
            //this.selected　について①出金OKかどうか判定　→　②CSVダウンロード　→　③DBに仮出金登録
            //①出金OKかどうか判定
            const selected = this.selected
            this.selected = [] //初期化
            if(selected.length <= 0){ return alert('Error : 選択されてません！！')}
            const ids = getIdsFromPaymentSchedules(selected)
            this.$axios.get('api/payment_agency/payment_schedules/customers_deposit',{params:{ids:ids}})
            .then((response)=>{
                const customers = response.data
                const judgedData = judgePay(selected,customers)
                this.selected = []
                this.judgedSelectedArray = judgedData.judgedSelectedArray
                    const customersObject = judgedData.customersObject
                this.editedCustomersArray  = Object.keys(customersObject).map(key=>{ return customersObject[key]})
                this.okArray = this.judgedSelectedArray.filter((ele)=>{return ele.isCanPay})
                this.ngArray = this.judgedSelectedArray.filter((ele)=>{return !ele.isCanPay})
                this.tabs = 2
                this.isMatched = true
            })
        },
        downloadCsv(){
            console.log('okarray len:',this.okArray.length,this.okArray.length > 0)
            if(this.okArray.length < 1){ return alert('OKなものがありません！') }

            //②CSVダウンロード
            const total = totalAmount(this.okArray)
            const fields = ['payment_schedule_id', 'bankcode', 'branchcode', 'kind', 'account_number', 'account_holder', 'amount','name']
            const json2csvParser = new Parser({fields:fields,header:false,withBOM:true})
            let exportText = json2csvParser.parse(this.okArray)
            exportText = exportText + '\n"2",,,,,' + this.okArray.length + ',' + total + ',' 
            const link = createDownloadATag(exportText)
            link.click()
            //ダウンロードしたら仮で出金としてDB update。
            const okArray = this.okArray
            const today = todayString()
            this.$axios.put('/api/payment_agency/payment_schedules/temporary_pay',{okArray:okArray,date:today,editCustomersArray:this.editCustomersArray})
            .then(() =>{
                this.searchRecords()
                this.judgedSelectedArray   = []
                this.editedCustomersArray  = []
                this.okArray  = []
                this.ngArray  = []
                this.selected = []
                })
        },
        deleteExpected(){
            this.$axios.delete('/api/payment_agency/payment_schedules/temporary_pay',{data:{selected:this.selected}})
            .then(() =>{
                this.searchRecords()
                this.judgedSelectedArray   = []
                this.editedCustomersArray  = []
                this.okArray  = []
                this.ngArray  = []
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
        // this.$store.commit('pa/updatePaymentSchedules',[])
        const option = {
            from:this.dateRange[0],
            until:getNextWeek(),
            isPaidDate:false,
            isExpectedDate:false
        }
        this.$axios.get('api/payment_agency/payment_schedules',{params:option})
        .then((response)=>{
            this.paymentSchedules = response.data
        })
    }
}
</script>