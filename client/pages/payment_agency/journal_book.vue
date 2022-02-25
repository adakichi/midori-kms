<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                        <v-text-field
                        v-model="search"
                        label="検索"
                        class="mx-4"
                        >
                        </v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn @click="submitData">登録</v-btn>

                    <v-spacer></v-spacer>
                    <v-btn @click="downloadCsv">CSV<v-icon>mdi-download</v-icon></v-btn>
                </v-app-bar>
                <v-data-table
                :items="journalBook"
                :headers="journalBookHeaders"
                :search="search"
                >
                </v-data-table>
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
            search:'',
            journalBookHeaders:[
                { text:'元帳',  value:'motocho'},
                { text:'日付',  value:'date'},
                { text:'借方勘定科目',  value:'debit_account'},
                { text:'貸方勘定科目',  value:'credit_account'},
                { text:'借方',  value:'debit'},
                { text:'貸方',  value:'credit'},
                { text:'番号',  value:'customer_id'},
                { text:'名前',  value:'name'},
            ]
        }
    },
    methods:{
        getJournalBook(){
            const options = {
                until:null,
                from:null
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
    },
    created(){
        this.getJournalBook()
    }
}
</script>