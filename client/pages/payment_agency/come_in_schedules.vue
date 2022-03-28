<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>
                        入金予定:Come In Schedules
                    </v-app-bar-title>
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
                    <v-btn @click="searchSchedules">検索</v-btn>
                    <v-btn @click="searchDiff">相違検索</v-btn>
                </v-app-bar>
                <v-app-bar>
                    <v-radio-group v-model="isMatched" row>
                        <v-radio label="未入金" value="false"></v-radio>
                        <v-radio label="入金済" value="true"></v-radio>
                        <v-radio label="両方" value="both"></v-radio>
                    </v-radio-group>
                    <v-divider vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-btn @click="csvDownload">CSV<v-icon>mdi-download</v-icon></v-btn>
                </v-app-bar>
            </v-col>
        </v-row>    
        <v-row>
            <v-col>
                <v-data-table
                :headers="headers"
                :items="comeInSchedulesList"
                item-key="come_in_schedules_id"
                :items-per-page="50"
                class="elevation-1"
                :footer-props="footerOptions"
                :search="search"
                @click:row="goCustomerPage"
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
const moment = require('moment')
import {createDownloadATag} from '/midori-kms/client/plugins/util.js'
const {Parser} = require('json2csv')
export default {
    layout : 'pa',
    data(){
        return{
            menu:false,
            dateRange:[],
            isMatched:'false',
            search:'',
            comeInSchedulesList:[],
            headers:[
                { text:'cis-id', value:'come_in_schedules_id'},
                { text:'customer_id', value:'customer_id'},
                { text:'name', value:'name'},
                { text:'LU', value:'lu_id'},
                { text:'payment_day', value:'payment_day'},
                { text:'expected_amount', value:'expected_amount'},
                { text:'come_in_records_id', value:'come_in_records_id'}
            ],
            footerOptions:{
                itemsPerPageOptions:[30,50,100,-1]
            }
        }
    },
    computed:{
    },
    methods:{
        searchSchedules(){
            const option = {
                id:0,
                from:this.dateRange[0],
                until:this.dateRange[1],
                isMatched:this.isMatched
            }
            this.$axios.get('api/payment_agency/cis/',{params:option})
            .then(response=>{
                this.comeInSchedulesList = response.data
            })
        },
        searchDiff(){
            this.$axios.get('api/payment_agency/cis/diff')
            .then(response=>{
                this.comeInSchedulesList = response.data
            })
        },
        goCustomerPage(e){
            console.log(e)
            const strToNum = parseInt(e.customer_id, 10)
            this.$router.push('/payment_agency/customers/'+strToNum)
        },
        csvDownload(){
            const json2csvParser = new Parser({header:true,withBOM:true})
            const exportText = json2csvParser.parse(this.comeInSchedulesList)
            const link = createDownloadATag(exportText,'入金予定')
            link.click()
        }
    },
    created(){
            this.dateRange[1] = moment().format("YYYY-MM-DD")
            this.searchSchedules()
    }
}
</script>