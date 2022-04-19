<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                        <v-text-field
                        v-model="filter"
                        label="フィルター"
                        class="mx-4 mt-4"
                        >
                        </v-text-field>
                    <v-spacer></v-spacer>
                    <v-btn class="mr-1" @click="openDialog">仕訳作成<v-icon>mdi-clipboard-edit</v-icon></v-btn>
                    <v-btn class="mr-1" @click="getJournalBook('journal_book')">検索<v-icon>mdi-magnify</v-icon></v-btn>
                    <v-btn class="mr-1" @click="getJournalBook('journal_book_for_receivable')">売掛検索<v-icon>mdi-magnify</v-icon></v-btn>
                    <v-btn @click="downloadCsv">CSV<v-icon>mdi-download</v-icon></v-btn>
                </v-app-bar>
                <v-data-table
                :items="journalBook"
                :headers="journalBookHeaders"
                :search="filter"
                >
                    <!-- 借方勘定補助科目 -->
                    <template v-slot:item.debit_subaccount="{item}">
                        <v-edit-dialog
                            v-model="editDialogDebitSubaccount"
                            large
                            @save="saveUpdate(item)"
                            :return-value.sync="item.debit_subaccount"
                        >   
                            {{item.debit_subaccount}}
                            <template v-slot:input>
                                <v-text-field
                                    v-model="item.debit_subaccount"
                                    label="借方勘定　補助科目"
                                    single-line
                                ></v-text-field>
                            </template>
                        </v-edit-dialog>
                    </template>

                    <!-- 貸方勘定補助科目 -->
                    <template v-slot:item.credit_subaccount="{item}">
                        <v-edit-dialog
                            v-model="editDialogCreditSubaccount"
                            large
                            @save="saveUpdate(item)"
                            :return-value.sync="item.credit_subaccount"
                        >   
                            {{item.credit_subaccount}}
                            <template v-slot:input>
                                <v-text-field
                                    v-model="item.credit_subaccount"
                                    label="貸方勘定　補助科目"
                                    single-line
                                ></v-text-field>
                            </template>
                        </v-edit-dialog>
                    </template>

                    <!-- メモ欄 -->
                    <template v-slot:item.memo="{item}">
                        <v-edit-dialog
                            v-model="editDialogMemo"
                            large
                            @save="saveUpdate(item)"
                            :return-value.sync="item.memo"
                        >   
                            {{item.memo}}
                            <template v-slot:input>
                                <v-text-field
                                    v-model="item.memo"
                                    label="メモ"
                                    single-line
                                ></v-text-field>
                            </template>
                        </v-edit-dialog>
                    </template>
                </v-data-table>
                <!-- dialog -->
                <v-dialog v-model="dialog" max-width="500">
                    <v-card class="pa-5">
                        <v-card-title>手入力仕訳</v-card-title>
                        <v-card-text>
                            <v-select :items="itemsMotocho" v-model="motocho" label="元帳" ></v-select>
                            <v-select label="出金元銀行" v-model="bankFrom" :items="banks"></v-select>
                            <v-select label="出金先銀行" v-model="bankTo" :items="banks"></v-select>
                            <v-text-field v-model="amount" label="金額"></v-text-field>
                            <v-text-field v-model="customerId" type="number" label="受任番号" hint="特に無い場合はゼロのままでOK"></v-text-field>
                            <v-text-field v-model="memo" label="メモ"></v-text-field>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="createNewJournal">作成</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <!-- snackbar -->
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
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {createDownloadATag} from '/client/plugins/util.js'
const {Parser} = require('json2csv')
export default {
    layout : 'pa',
    data(){
        return{
            journalBook:[],
            filter:'',
            editDialogMemo:false,
            editDialogDebitSubaccount:false,
            editDialogCreditSubaccount:false,

            /////dialog//////
            dialog:false,
            motocho:[],
            itemsMotocho:['振替'],
            banks:['ﾐﾂｲｽﾐﾄﾓ','ｼｺｸ','ﾍﾟｲﾍﾟｲ'],
            bankFrom:null,
            bankTo:null,
            amount:0,
            customerId:0,
            memo:'',
            //snackBar
            snack:false,
            snackColor:'sucess',
            snackText:'',
            ////▲▲▲▲▲▲▲▲▲▲▲▲▲//////
            journalBookHeaders:[
                { text:'元帳',  value:'motocho'},
                { text:'日付',  value:'date'},
                { text:'借方勘定科目',  value:'debit_account'},
                { text:'借方勘定補助科目',  value:'debit_subaccount'},
                { text:'貸方勘定科目',  value:'credit_account'},
                { text:'貸方勘定補助科目',  value:'credit_subaccount'},
                { text:'借方',  value:'debit'},
                { text:'貸方',  value:'credit'},
                { text:'番号',  value:'customer_id'},
                { text:'名前',  value:'name'},
                { text:'メモ',  value:'memo'},
            ]
        }
    },
    methods:{
        getJournalBook(table){
            const options = {
                until:null,
                from:null,
                dialog:false,
                table:table
            }
            this.$axios.get('api/payment_agency/journal_book/',{params:{options:options}})
            .then((response)=>{
                console.log(response)
                if(response.data.error){ return response.data.message }
                this.journalBook = response.data
            })
        },
        downloadCsv(){
            //②CSVダウンロード
            const fields = ['motocho', 'date', 'debit_account','debit_subaccount', 'credit_account','credit_subaccount', 'debit', 'credit', 'customer_id','name','memo']
            const json2csvParser = new Parser({fields:fields,header:true,withBOM:true})
            let exportText = json2csvParser.parse(this.journalBook)
            const link = createDownloadATag(exportText)
            link.click()
        },
        saveUpdate(e){
        e.options = Object.keys(e)[0]
        const doNot = !confirm('編集しますか？')
        if(doNot){ return }
        this.$axios.put('api/payment_agency/journal_book',e)
        .then(response=>{
            if(response.data.error){
                console.log(response.data)
                alert(response.data.message)
                this.popupSnackBar('失敗しました。','warning')
            }
            console.log(response.data)
            this.popupSnackBar(response.data)
            })
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
        },
        openDialog(){
            this.dialog = true
        },
        createNewJournal(){
            const doNot = !confirm('本当に登録してOKですか？')
            if(doNot){ return }
            const valArray = [this.motocho,'預金', this.bankTo ,this.amount,'預金', this.bankFrom, this.amount, this.customerId,this.memo]
            this.$axios.post('api/payment_agency/journal_book/',{values:valArray})
            .then(response=>{
                if(response.data.error){return alert(response.data.message)}
                this.popupSnackBar(response.data)
                this.dialog = false
            })
        }
    },
    created(){
        this.getJournalBook('journal_book')
    }
}
</script>