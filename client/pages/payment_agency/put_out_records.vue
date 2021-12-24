<template>
    <v-container>
        {{selected}}
        <v-row>
            <v-col>
                <v-app-bar flat>
                    <v-app-bar-title>出金予定：Put Out record</v-app-bar-title>
                    <v-spacer></v-spacer>
                    <a href="file" download>だうんろーどA</a>
                    <v-btn @click="downloadCsv">だうんろーど</v-btn>
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

  //Dounload用のaタグ作成用関数
function createDownloadATag(exportText){
    const textName = 'ExpCsv' + today + '.csv'
    const today = Date(Date.now())
    const blob = new Blob([exportText],{type:'text/plain'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = textName
    return link
}

const {Parser} = require('json2csv')
export default {
    layout : 'pa',
    data(){
        return{
            menu:false,
            dateRange:[],
            selected:[],
            headers:[
                {text:'名前',   value:'name'},
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
        searchRecords(){
            const option = {
                id:0,
                from:this.dateRange[0],
                until:this.dateRange[1]
            }
            this.$store.dispatch('pa/getDbPaymentSchedules',option)
        },
        downloadCsv(){
            const total = totalAmount(this.selected)
            const fields = ['payment_schedule_id', 'bankcode', 'branchcode', 'kind', 'account_number', 'account_holder', 'amount','name']
            const json2csvParser = new Parser({transforms:[convToOne] ,fields:fields,header:false,withBOM:true})
            let exportText = json2csvParser.parse(this.selected)
            exportText = exportText + '\n"2",,,,,' + this.selected.length + ',' + total + ',' 
            const link = createDownloadATag(exportText)
            link.click()
        }
    },
    created(){
        this.$store.commit('pa/updatePaymentSchedules',[])
    }
}
</script>