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
                </v-app-bar>
                <v-app-bar>
                    <v-radio-group v-model="radioPaid" row>
                        <v-radio label="未入金" value="false"></v-radio>
                        <v-radio label="入金済" value="true"></v-radio>
                        <v-radio label="両方" value="both"></v-radio>
                    </v-radio-group>
                    <v-spacer></v-spacer>
                    <v-btn @click="match">Match</v-btn>
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
    </v-container>
</template>

<script>
import {createDownloadATag} from '/midori-kms/client/plugins/util.js'
import {getNextMonth}       from '/midori-kms/client/plugins/util.js'
import {getLastMonth}       from '/midori-kms/client/plugins/util.js'
import {matchCis}           from '/midori-kms/client/plugins/util.js'
const {Parser} = require('json2csv')

export default {
    layout : 'pa',
    data(){
        return{
            search:'',
            selected:[],
            //入金or未入金or両方
            radioPaid:'false',
            headers:[
                {
                    text:'id',
                    align:'start',
                    sortable:false,
                    value:'come_in_records_id',
                    groupable:false
                },
                { text:'customer_id',           value:'customer_id'},
                { text:'come_in_name',          value:'come_in_name'},
                { text:'金額', value:'actual_deposit_amount', groupable:false},
                { text:'actual_deposit_date',   value:'actual_deposit_date'},
                { text:'matched',               value:'matched'},
                { text:'delete_flag',           value:'delete_flag'},
                { text:'created_at',            value:'created_at'}
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
                paid:this.radioPaid
            }
            this.$store.dispatch('pa/actComeInRecords',options)
        },
        goImport(){
            this.$router.push('/payment_agency/come_in_records/import')
        },
        match(){
            const cir = this.comeInRecordsList
            const cis  = this.cis
            const matched = matchCis(cis,cir)
            console.log('cir:',cir)
            console.log('cis:',cis)
            console.log('matched:',matched)
            //マッチした配列をapi/indexに投げて、登録処理を作る。
            this.$axios.put('api/payment_agency/matching',matched)
            .then((response)=>{
                console.log('response: ',response.data)
            })
        },
        csvDownload(){
            const json2csvParser = new Parser({header:true,withBOM:true})
            const exportText = json2csvParser.parse(this.comeInRecordsList)
            const link = createDownloadATag(exportText)
            link.click()
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