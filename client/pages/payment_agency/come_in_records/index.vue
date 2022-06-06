<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>
                        入金実績：come in records
                    </v-app-bar-title>
                    <v-spacer></v-spacer>
                <v-btn @click="goImport">インポート</v-btn>
                <v-btn @click="goImportfile">インポートファイル一覧</v-btn>
                <v-btn @click="upda">検索</v-btn>
                <v-btn v-show="isAdmin" color="warning" @click="cancelMatching">出金確定取り消し</v-btn>
                </v-app-bar>
                <v-app-bar>
                    <v-radio-group v-model="radioPaid" row>
                        <v-radio label="未入金" value="false"></v-radio>
                        <v-radio label="入金済" value="true"></v-radio>
                        <v-radio label="両方" value="both"></v-radio>
                    </v-radio-group>
                    <v-divider vertical></v-divider>
                    <v-radio-group v-model="deleteFlag" row>
                        <v-radio label="削除あり" value="true"></v-radio>
                        <v-radio label="削除なし" value="false"></v-radio>
                        <v-radio label="両方" value="both"></v-radio>
                    </v-radio-group>
                    <v-spacer></v-spacer>
                    <v-btn disabled @click="match">Match</v-btn>
                    <v-btn @click="csvDownload">CSV<v-icon>mdi-download</v-icon></v-btn>
                </v-app-bar>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-data-table
                v-model="selected"
                :headers="headers"
                :items="comeInRecordsList"
                item-key="come_in_records_id"
                :items-per-page="-1"
                class="elevation-1"
                :search="search"
                show-select
                show-group-by
                dense
                >
                <template v-slot:item.action="{ item }" >
                    <v-btn @click="openDialog(item)"><v-icon>mdi-handshake</v-icon></v-btn>
                </template>
                <template v-slot:top>
                <v-text-field
                v-model="search"
                label="Search(まだうごかんばい)"
                class="mx-4"
                >
                </v-text-field>
                </template>
                    <template v-slot:item.matched="{item}">
                        <v-simple-checkbox
                        v-model="item.matched == 'TRUE' ? true : false"
                        disabled
                        >
                        </v-simple-checkbox>
                    </template>
                    <template v-slot:item.delete_flag="{item}">
                        <v-simple-checkbox
                        v-model="item.delete_flag === 0 ?false:true"
                        disabled
                        >
                        </v-simple-checkbox>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-dialog v-model="dialog"  max-width="800">
            <v-card>
                <v-app-bar>
                    <v-radio-group v-model="searchType" row>
                        <v-radio label="カナ"     value="kana"></v-radio>
                        <v-radio label="受任番号" value="jyunin"></v-radio>
                        <v-radio label="金額"     value="kingaku"></v-radio>
                    </v-radio-group>
                    <v-text-field label="検索文字" v-model="searchText"></v-text-field>
                    <v-btn @click="searchCis">検索</v-btn>
                </v-app-bar>
                <v-app-bar>
                    名前：{{selectItem.come_in_name}} 番号：{{selectItem.actual_deposit_amount}}  受任番号：{{selectItem.customer_id}} 日付：{{selectItem.actual_deposit_date}}
                    <v-spacer></v-spacer>
                    <v-btn @click="match">紐づけ</v-btn>
                    <v-btn v-show="isAdmin" @click="openJournalDialog" color="warning">特殊個別仕訳処理</v-btn>
                </v-app-bar>
                <v-card-text>
                    <v-data-table
                    v-model="selectedSearchResult"
                    :headers="matchItemHeaders"
                    :items="searchResult"
                    item-key="come_in_schedules_id"
                    :items-per-page="-1"
                    class="elevation-1"
                    show-select
                    single-select
                    dense
                    ></v-data-table>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="journalDialog" max-width="500">
            <v-card class="pa-5">
                <v-card-title>手入力仕訳</v-card-title>
                <v-card-text>
                    <v-select label="元帳"              v-model="journal.motocho"           :items="itemsMotocho"  ></v-select>
                    <v-text-field v-model="journal.date" label="日付" type="date"></v-text-field>
                    <v-text-field v-model="journal.time" label="日付" type="time"></v-text-field>
                    <v-select label="借方勘定科目"      v-model="journal.debitAccount"      :items="journalAccount"></v-select>
                    <v-select label="借方勘定 補助科目" v-model="journal.debitSubaccount"   :items="journalsubaccount"></v-select>
                    <v-select label="貸方勘定科目"      v-model="journal.creditAccount"     :items="journalAccount"></v-select>
                    <v-select label="貸方勘定 補助科目" v-model="journal.creditSubaccount"  :items="journalsubaccount"></v-select>
                    <v-text-field v-model="journal.amount" disabled label="金額"></v-text-field>
                    <v-text-field v-model="journal.customerId" type="number" label="受任番号" hint="特に無い場合はゼロのままでOK"></v-text-field>
                    <v-text-field v-model="journal.memo" label="メモ"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="createNewJournal">作成</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar
            v-model="snack"
            :timeout="2000"
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
import {createDownloadATag} from '/client/plugins/util.js'
import {getNextMonth}       from '/client/plugins/util.js'
import {getLastMonth}       from '/client/plugins/util.js'
import {getMonthAfterNext}       from '/client/plugins/util.js'
import {getDateTime,getToday}       from '/client/plugins/util.js'
const {Parser} = require('json2csv')

export default {
    layout : 'pa',
    data(){
        return{
            search:'',
            selected:[],
            selectItem:{},
            searchType:'kana',
            searchText:'',
            searchResult:[],
            selectedSearchResult:[],
            dialog:false,
            //入金or未入金or両方
            radioPaid:'false',
            //

            //jounal dialog
            journalDialog:false,
            journal:{motocho:'',date:'',time:'00:00:00',debitAccount:'',debitSubaccount:'',creditAccount:'',creditSubaccount:'',customerId:0,memo:''},
            itemsMotocho:['利息','振込手数料','訂正'],
            journalAccount:['預金','仮払金','受取利息','振込手数料'],
            journalsubaccount:['ﾐﾂｲｽﾐﾄﾓ','ｼｺｸ','ペイペイ',''],
            /////////////

            //snackBar
            snack:false,
            snackColor:'sucess',
            snackText:'',
            ////▲▲▲▲▲▲▲▲▲▲▲▲▲//////

            deleteFlag:'false',
            headers:[
                { text:'action',                value:'action'},
                { text:'id',                    value:'come_in_records_id', align:'start', sortable:false, groupable:false },
                { text:'customer_id',           value:'customer_id'},
                { text:'come_in_name',          value:'come_in_name'},
                { text:'金額',                  value:'actual_deposit_amount', groupable:false},
                { text:'actual_deposit_date',   value:'actual_deposit_date'},
                { text:'matched',               value:'matched'},
                { text:'delete_flag',           value:'delete_flag'},
                { text:'created_at',            value:'created_at'}
            ],
            matchItemHeaders:[
                { text:'cis-id',            value:'come_in_schedules_id'},
                { text:'customer_id',       value:'customer_id'},
                { text:'name',              value:'name'},
                { text:'LU',                value:'lu_id'},
                { text:'payment_day',       value:'payment_day'},
                { text:'expected_amount',   value:'expected_amount'},
                { text:'come_in_records_id', value:'come_in_records_id'},
                { text:'メモ',               value:'memo'},
            ]
        }
    },
    computed:{
        comeInRecordsList(){
            const data = this.$store.getters['pa/getCIR']
            if(Array.isArray(data)){
                return data
            } else {
                return []
            }
        },
        cis(){
            return this.$store.getters['pa/getCIS']
        },
        isAdmin(){
            if(this.$auth.user){
                return this.$auth.user.isAdmin
            }
            return false
        }
    },
    methods:{
        upda(){
            const options = {
                paid:this.radioPaid,
                deleteFlag:this.deleteFlag
            }
            this.$store.dispatch('pa/actComeInRecords',options)
        },
        goImport(){
            this.$router.push('/payment_agency/come_in_records/import')
        },
        goImportfile(){
            this.$router.push('/payment_agency/come_in_records/importfile')
        },
        csvDownload(){
            const json2csvParser = new Parser({header:true,withBOM:true})
            const exportText = json2csvParser.parse(this.comeInRecordsList)
            const link = createDownloadATag(exportText)
            link.click()
        },
        openDialog(item){
            this.selectItem = item
            console.log(item)
            this.dialog = true
        },
        searchCis(){
            const options = {
                searchType:this.searchType,
                searchText:this.searchText,
                until:getMonthAfterNext(),
                isMatched:false
            }
            this.$axios.get('api/payment_agency/cis',{params:options})
            .then((response)=>{
                if(response.data.length <= 0){ return alert('検索結果ゼロ')}
                this.searchResult = response.data
            })
        },
        match(){
            const cis  = this.selectedSearchResult[0]
            const confirmText = '名前：' + cis.name + ' 受任番号：' + cis.customer_id + ' 金額：' + cis.expected_amount + '　日付：' + cis.payment_day
            const result = confirm(confirmText + '\n上記とマッチングしますか？')
            if(result){
                const cir = this.selectItem
                const matched = [
                    {cir:cir,cis:cis}
                ]
                this.$axios.put('api/payment_agency/matching',matched)
                .then((response)=>{
                    if(response.data.error){ console.log('true');return alert(response.data.message)}
                    this.selectItem = []
                    this.dialog = false
                    this.searchResult = []
                    this.selectedSearchResult = []
                    this.upda()
                    this.popupSnackBar(response.data)
                })
            }
        },
        cancelMatching(){
            console.log(this.selected)
            this.$axios.delete('api/payment_agency/matching',{data:this.selected})
                .then((response)=>{
                    console.log('response: ',response.data)
                    this.selected = []
                    this.upda()
                })
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
        },
        openJournalDialog(){
            this.journalDialog = true
            console.log(this.selectItem)
            this.journal.amount = this.selectItem.actual_deposit_amount
            this.journal.date = getToday()
        },
        createNewJournal(){
            const doNot = !confirm('本当に登録しますか？')
            if(doNot){ return }
            console.log(this.selectItem)
            const datetime = this.journal.date + ' ' + this.journal.time
            const motocho = this.journal.motocho + ':cir[' + this.selectItem.come_in_records_id+']'
            const journalArray = [motocho, datetime, this.journal.debitAccount,this.journal.debitSubaccount,this.journal.amount,this.journal.creditAccount,this.journal.creditSubaccount, this.journal.amount, this.journal.customerId,this.journal.memo]
            this.$axios.post('api/payment_agency/cir/irregular',{journalValues:journalArray,cirId:this.selectItem.come_in_records_id,customerId:this.journal.customerId ,memo:this.journal.memo,motocho:this.journal.motocho})
            .then(response=>{
                if(response.data.error){return alert(response.data.message)}
                this.popupSnackBar(response.data)
                this.dialog = false
                location.reload()
            })
        }
    },  
    created(){
        this.upda()
        const nextMonth = getNextMonth()
        const lastMonth = getLastMonth()
        const options = {
            id:0,
            from:lastMonth,
            until:nextMonth
        }
        this.$store.dispatch('pa/actComeInSchedules',options)
    }
}
</script>