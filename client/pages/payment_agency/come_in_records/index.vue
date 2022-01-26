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
                <v-btn @click="upda">こうしん</v-btn>
                <v-btn @click="goImportfile">インポートファイル一覧</v-btn>
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
        <v-dialog v-model="dialog">
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
    </v-container>
</template>

<script>
import {createDownloadATag} from '/midori-kms/client/plugins/util.js'
import {getNextMonth}       from '/midori-kms/client/plugins/util.js'
import {getLastMonth}       from '/midori-kms/client/plugins/util.js'
import {getMonthAfterNext}       from '/midori-kms/client/plugins/util.js'
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
                { text:'come_in_records_id', value:'come_in_records_id'}
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
            console.log('item:'+item)
            this.dialog = true
        },
        searchCis(){
            const options = {
                searchType:this.searchType,
                searchText:this.searchText,
                until:getMonthAfterNext()
            }
            this.$axios.get('api/payment_agency/cis',{params:options})
            .then((response)=>{
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
                    console.log('response: ',response.data)
                    this.selectItem = []
                    this.dialog = false
                    this.upda()
                })
            }
        },
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