<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>出金予定：Put Out record</v-app-bar-title>
                </v-app-bar>
                <v-app-bar flat>
                    <v-checkbox v-model="isPaidDate" label="出金済を含める"></v-checkbox>
                    <v-checkbox v-model="isExpectedDate" label="仮出金を含める"></v-checkbox>
                    <v-spacer></v-spacer>
                    <div>
                    <v-menu
                     ref="menu1"
                     v-model="menuFrom"
                     :close-on-content-click="false"
                     :return-value.sync="dateRange[0]"
                     transition="scale-transition"
                     offset-y
                     left
                     min-width="auto"
                    >
                        <template v-slot:activator="{on, attrs}">
                            <v-text-field
                             v-model="dateRange[0]"
                             label="検索 開始位置"
                             prepend-icon="mdi-calendar"
                             readonly
                             v-bind="attrs"
                             v-on="on"
                             ></v-text-field>
                        </template>
                    <v-date-picker
                     v-model="dateRange[0]"
                    >
                    <v-spacer></v-spacer>
                    <v-btn
                     text
                     color="primary"
                     @click="$refs.menu1.save(dateRange[0])"
                     >OK
                    </v-btn>
                    </v-date-picker>
                    </v-menu>
                    </div>

                    <div>
                    <v-menu
                     ref="menu2"
                     v-model="menuUntil"
                     :close-on-content-click="false"
                     :return-value.sync="dateRange[1]"
                     transition="scale-transition"
                     offset-y
                     left
                     min-width="auto"
                    >
                        <template v-slot:activator="{on, attrs}">
                            <v-text-field
                             v-model="dateRange[1]"
                             label="検索 終了日"
                             prepend-icon="mdi-calendar"
                             readonly
                             v-bind="attrs"
                             v-on="on"
                             ></v-text-field>
                        </template>
                    <v-date-picker
                     v-model="dateRange[1]"
                    >
                    <v-spacer></v-spacer>
                    <v-btn
                     text
                     color="primary"
                     @click="$refs.menu2.save(dateRange[1])"
                     >OK
                    </v-btn>
                    </v-date-picker>
                    </v-menu>
                    </div>
                    <v-btn @click="searchRecords">検索</v-btn>
                </v-app-bar>
                <v-app-bar>
                    <v-spacer></v-spacer>
                    <v-btn v-show="isMatched ? false : true " @click="judgementPaid">判定<v-icon></v-icon></v-btn>
                    <v-btn v-show="!isMatched ? false : true " @click="downloadCsv(okArray,'okArray')">仮出金(CSV出力)<v-icon>mdi-download</v-icon></v-btn>
                    <v-btn v-show="!isMatched ? false : true " @click="downloadCsv(editedCustomersArray,'ecArray')">人毎(CSV出力)<v-icon>mdi-download</v-icon></v-btn>
                    <v-btn v-show="isMatched ? false : true " @click="deleteExpected">仮出金解除</v-btn>
                    <v-btn v-show="isMatched ? false : true " @click="confirmPayments">出金確定</v-btn>
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
                    <v-toolbar>通常案件：{{paymentSchedules.length}}件</v-toolbar>
                    <v-data-table
                    :headers="headers"
                    :items="paymentSchedules"
                    :items-per-page="-1"
                    item-key="payment_schedule_id"
                    show-select
                    show-group-by
                    v-model="selected"
                    >
                    </v-data-table>
                </v-tab-item>

                <!-- 判定後タブ -->
                <v-tab-item>
                    <v-toolbar>判定後案件：{{judgedSelectedArray.length}}件</v-toolbar>
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
                    <v-toolbar>OK案件：{{okArray.length}}件</v-toolbar>
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
                    <v-toolbar>NG案件：{{ngArray.length}}件</v-toolbar>
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
                    <v-toolbar>人毎案件：{{editedCustomersArray.length}}人</v-toolbar>
                    <v-data-table
                    :headers="headersEditedCustomersArray"
                    :items="editedCustomersArray"
                    :items-per-page="50"
                    item-key="customer_id"
                    show-select
                    show-group-by
                    v-model="selected"
                    >
                        <template v-slot:item.customer_id="prop" @click="goCustomerPage">
                            <v-chip @click="goCustomerPage(prop.item)">{{prop.item.customer_id}}</v-chip>
                        </template>
                    </v-data-table>
                </v-tab-item>

                </v-tabs-items>
            </v-col>
        </v-row>

        <!-- リザルトテーブルのダイアログ -->
        <v-dialog v-model="resultDialog" persistent>
            <v-card>
                <v-toolbar>
                    <v-spacer/>
                    <v-btn @click="downloadCsv(resultArray,'resultArray')">結果出力(CSV)<v-icon>mdi-download</v-icon></v-btn>
                    <v-btn icon @click="closeResultDialog"><v-icon>mdi-close</v-icon></v-btn>
                </v-toolbar>
                <v-card-text>
                    <v-data-table
                    :items="resultArray"
                    :headers="resultHeaders"
                    >
                    <template v-slot:item.error="prop">
                        {{prop.item.error ? '失敗':'取消 成功'}}
                    </template>
                    <template v-slot:item.expected_date="prop">
                        {{prop.item.expected_date ? '有り' : '無し'}}
                    </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- スナックバー -->
        <v-snackbar
            v-model="snack"
            :timeout="3000"
            :color="snackColor"
        >
            {{ snackText }}
            <template v-slot:action="{ attrs }">
            <v-btn
                v-bind="attrs"
                text
                @click="snack = false"
            >
                Close
            </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script>
import { getIdsFromPaymentSchedules } from '/client/plugins/util.js'
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
        itemObject.commission = -(itemObject.commission)
        itemObject.advisory_fee = -(itemObject.advisory_fee)
        return itemObject
    })
}

  //今日の日付をフォーマットして出力(String)
function todayString(){
    const today = new Date()
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
}

//Download用のaタグ作成用関数
import {createDownloadATag} from '/client/plugins/util.js'
import {getNextWeek,judgePay} from '/client/plugins/util.js'
const {Parser} = require('json2csv')
const iconv = require('iconv-lite')
export default {
    layout : 'pa',
    data(){
        return{
            isPaidDate:false,
            isExpectedDate:false,
            menuFrom:false,
            menuUntil:false,
            isMatched:false,    //マッチ済みかどうかのスイッチ。これで仮出金解除等のボタンの表示のON/OFFを切り替える。
            resultDialog:false,

            //メインのDataTable用 配列
            paymentSchedules:[],
            judgedSelectedArray:[],
            editedCustomersArray:[],
            okArray:[],
            ngArray:[],
            dateRange:['',''],
            selected:[],
            resultArray:[],
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
                {text:'予定',   value:'expected_date'},
                {text:'メモ',   value:'memo'},
            ],
            headersEditedCustomersArray:[
                {text:'番号',       value:'customer_id'},
                {text:'名前',       value:'name'},
                {text:'売掛金',     value:'accounts_receivable'},
                {text:'預り金',  value:'depositBeforeJudge'},
                // {text:'後 預り金',  value:'deposit',  groupable:false},
                {text:'前受金',  value:'advancePaymentBeforeJudge'},
                // {text:'後 前受金',  value:'advance_payment'},
                {text:'仮受金',  value:'temporaryReceiptBeforeJudge'},
                // {text:'後 仮受金',  value:'temporary_receipt'},
                // {text:'後 支払い済み金額',   value:'confirm_payment'},
                // {text:'必要預り金',   value:'requiredDeposit'},
                // {text:'必要前受金',   value:'requiredAdvancePayment'},
                {text:'必要金額',   value:'requiredAmount'},
                // {text:'立替',       value:'sumAmount', groupable:false},
                // {text:'手数料',     value:'sumCommission', groupable:false},
                // {text:'顧問料',     value:'sumAdvisoryFee', groupable:false},
                {text:'差額',     value:'diff', groupable:false},
                {text:'メモ',     value:'memo', groupable:false}
            ],
            resultHeaders:[
                {text:'結果',   value:'error'},
                {text:'受任番号',   value:'customer_id'},
                {text:'PS ID',   value:'payment_schedule_id'},
                {text:'仮出金',   value:'expected_date'},
            ],
            //snack bar
            snack:false,
            snackColor:'sucess',
            snackText:'',
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
            //いろんなもの初期化。
            this.judgedSelectedArray   = []
            this.editedCustomersArray  = []
            this.okArray  = []
            this.ngArray  = []
            this.selected = []
            this.isMatched = false
            this.tabs = 0
            /////////////////////
            if(this.dateRange[1] === ''){ return alert('終了日が空の場合は、\nデータが多すぎて止まってしまいます。')}
            const option = {
                from:this.dateRange[0],
                until:this.dateRange[1],
                isPaidDate:this.isPaidDate,
                isExpectedDate:this.isExpectedDate
            }
            this.$axios.get('api/payment_agency/payment_schedules',{params:option})
            .then((response)=>{
                this.paymentSchedules = response.data
                if(option.until === undefined){
                    this.snack = true
                    this.snackColor = 'warning'
                    this.snackText = '「～まで」の範囲指定が無かったので、一ヶ月後までの予定のみ取得しました。'
                }
            })
        },
        judgementPaid(){
            //this.selected　について①出金OKかどうか判定　→　②CSVダウンロード　→　③DBに仮出金登録
            //①出金OKかどうか判定
            const selected = this.selected
            selected.sort((a,b)=>{
                return a.date > b.date ? 1 : -1;
            })
            this.selected = [] //初期化
            if(selected.length <= 0){ return alert('Error : 選択されてません！！')}
            //selectedからカスタマーのIDを抽出
            const ids = getIdsFromPaymentSchedules(selected)
            //預り金があるか等の確認の為顧客情報を取得
            this.$axios.get('api/payment_agency/payment_schedules/customers_deposit',{params:{ids:ids}})
            .then((response)=>{
                const customers = response.data
                //預り金（前受等）があるか判断
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
        downloadCsv(target,type){
            if(target.length < 1){ return alert('データがありません！') }

            //②CSVダウンロード
            const total = totalAmount(target)
            const fields = ['recordKubun', 'bankcode', 'branchcode', 'kind', 'account_number', 'account_holder', 'amount','kana']
            let json2csvParser = {}
            let title = ''
            let lastText = ''
            if(type === 'okArray'){
                json2csvParser = new Parser({fields:fields,header:false,})
                title = 'ペイペイ出金データ'
                lastText = '\n2,,,,,' + target.length + ',' + total 
            } else if(type === 'ecArray') {
                json2csvParser = new Parser()
                title = '人毎データ'
                lastText = '\n2,,,,,' + target.length + ',' + total 
            } else if(type === 'resultArray') {
                json2csvParser = new Parser()
                title = '取り消し結果データ'
            }
            
            let exportText = json2csvParser.parse(target)
            exportText = exportText + lastText
            const conv2Sjis = iconv.encode(exportText,'windows-31j')
            const link = createDownloadATag(conv2Sjis,title)
            link.click()
            //ダウンロードしたら仮で出金としてDB update。
            if(type === 'okArray' ){
                const okArray = target
                const today = todayString()
                this.$axios.put('/api/payment_agency/payment_schedules/temporary_pay',{okArray:okArray,date:today,editCustomersArray:this.editCustomersArray})
                .then((response) =>{
                    this.selected = []
                    this.editCustomersArray = []
                    this.searchRecords()
                    if(response.data.error){ return alert(response.data.message)}
                    this.popupSnackBar(response.data)
                })
            }
        },
        deleteExpected(){
            const yesno = confirm('仮出金解除処理です。\n本当に実行しますか？')
            if(!yesno){return}
            this.$axios.delete('/api/payment_agency/payment_schedules/temporary_pay',{data:{selected:this.selected}})
            .then((response) =>{
                this.selected = []
                this.resultArray = response.data
                this.resultDialog = true
                console.log(response.data)
                console.log(this.resultArray)
                this.searchRecords()
            })
        },
        closeResultDialog(){
            const yesno = confirm('閉じると結果のデータは削除されます。\n本当に閉じて良いですか？')
            if(!yesno){return}
            this.resultArray = []
            this.resultDialog = false
        },
        confirmPayments(){
            const yesno = confirm('出金確定処理です。\n本当に実行しますか？')
            if(!yesno){return}
            const ids = getIds(this.selected)
            const today = todayString()
            console.log('confirm')
            this.$axios.put('/api/payment_agency/payment_schedules/confirm',{ids:ids,date:today})
            .then(() =>{
                this.selected = []
                this.searchRecords()
            })
        },
        cancelConfirmPayments(){
            const yesno = confirm('出金解除処理です。\n上長に確認してください。\n\n本当に実行しますか？')
            if(!yesno){return}
            const ids = getIds(this.selected)
            this.$axios.delete('/api/payment_agency/payment_schedules/confirm',{data:{ids:ids,date:null}})
            .then(() =>{
                this.selected = []
                this.searchRecords()
            })
        },
        goCustomerPage(e){
            console.log(e)
           this.$router.push('/payment_agency/customers/'+ Number(e.customer_id))
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
        },
    },
    created(){
        this.dateRange[1]=getNextWeek()
        // this.$store.commit('pa/updatePaymentSchedules',[])
        const option = {
            from:this.dateRange[0],
            until:this.dateRange[1],
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