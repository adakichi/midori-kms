<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                        <v-text-field
                        v-model="filter"
                        label="フィルター"
                        class="mx-4"
                        >
                        </v-text-field>
                    <v-spacer></v-spacer>
                    <v-btn @click="getJournalBook('journal_book')">検索<v-icon>mdi-magnify</v-icon></v-btn>
                    <v-btn @click="getJournalBook('journal_book_for_receivable')">売掛検索<v-icon>mdi-magnify</v-icon></v-btn>
                    <v-btn @click="downloadCsv">CSV<v-icon>mdi-download</v-icon></v-btn>
                </v-app-bar>
                <v-data-table
                :items="journalBook"
                :headers="journalBookHeaders"
                :search="filter"
                >
                            <template v-slot:item.memo="{item}">
                                <v-edit-dialog
                                    v-model="editDialogMemo"
                                    large
                                    @save="saveMemo(item)"
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
import {createDownloadATag} from '/midori-kms/client/plugins/util.js'
const {Parser} = require('json2csv')
export default {
    layout : 'pa',
    data(){
        return{
            journalBook:[],
            filter:'',
            editDialogMemo:false,
            //snackBar
            snack:true,
            snackColor:'sucess',
            snackText:'',
            ////▲▲▲▲▲▲▲▲▲▲▲▲▲//////
            journalBookHeaders:[
                { text:'元帳',  value:'motocho'},
                { text:'日付',  value:'date'},
                { text:'借方勘定科目',  value:'debit_account'},
                { text:'貸方勘定科目',  value:'credit_account'},
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
            const fields = ['motocho', 'date', 'debit_account', 'credit_account', 'debit', 'credit', 'customer_id','name']
            const json2csvParser = new Parser({fields:fields,header:false,withBOM:true})
            let exportText = json2csvParser.parse(this.journalBook)
            const link = createDownloadATag(exportText)
            link.click()
        },
        saveMemo(e){
        console.log(e)
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
        search(){

        }
    },
    created(){
        this.getJournalBook('journal_book')
    }
}
</script>