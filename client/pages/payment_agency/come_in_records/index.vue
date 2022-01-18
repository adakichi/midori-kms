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
import {zenkana2BigHankana} from '/midori-kms/client/plugins/util.js'
import {createDownloadATag} from '/midori-kms/client/plugins/util.js'
const {Parser} = require('json2csv')

const getNextMonth = function(){
    let today = new Date()
    today.setDate(today.getDate()+27)
    const nextMonth = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate()
    return nextMonth
}

const getLastMonth = function(){
    let today = new Date()
    today.setDate(today.getDate()-27)
    const lastMonth = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate()
    return lastMonth
}

const matchCis = function(cis,cir){
    //cisとcirのマッチング処理
    //１．cirに受任番号がある場合
        //受任番号マッチ　→　カナマッチ　→　filterd
    //２．cirに受任番号が無い場合
        //カナマッチ　    →　金額マッチ　→　filterd

    //受任番号でマッチ
    const matcheJyuninNum = function(jyuninNum,cisArray){
        return cisArray.filter((ele)=>{
            return jyuninNum === ele.customer_id
        })
    }

    //名前の間のスペースはトリミングする。※銀行によってスペースがあったりなかったりする為。
    const matcheName = function(name,cisArray){
        return cisArray.filter((ele)=>{
            return zenkana2BigHankana(name.replace(/\s+/g, "")) === zenkana2BigHankana(String(ele.kana).replace(/\s+/g, ""))
        })
    }

    //金額でマッチング
    const matcheAmount = function(amount,cisArray){
        return cisArray.filter((ele)=>{
            return amount === ele.amount
        })
    }

    //マッチングしたものをcisから削除する(重複をさける為)
    const matchedCisDelete = function(matchedCis,cisArray){
        return cisArray.filter((ele,index)=>{
            if(ele.come_in_schedules_id !== matchedCis.come_in_schedules_id){
                return true
            } else {
                console.log('del cis id:'+ matchedCis.come_in_schedules_id)
            }
        })
    }

    let filtered = []
    cir.forEach((cirlItem)=>{

        if(cirlItem.customer_id){
        //①入金に受任番号があるかないか。

            const customerIdMatchedArray = matcheJyuninNum(cirlItem.customer_id,cis)
            if(customerIdMatchedArray.length !== 0){
            //受任番号がマッチした配列について「カナ」のマッチング処理
                const nameMatchedArray = matcheName(cirlItem.come_in_name,customerIdMatchedArray)

                if(nameMatchedArray.length !== 0){
                //「カナ」もマッチした場合にfilterdに追加。
                    filtered.push({cir:cirlItem,cis:nameMatchedArray[0]})
                    cis = matchedCisDelete(nameMatchedArray[0],cis)
                }
                return
            } else {
            //受任番号がマッチしなかった場合はとりあえず、マッチングさせない。（数が増えてきたら検討する）
                console.log('no matched [cir id]: '+ cirlItem.come_in_records_id)
                return
            }
        } else {
            //②受任番号が無い場合
            const nameMatchedArray = matcheName(cirlItem.come_in_name,cis)

            if(nameMatchedArray.length !== 0){
            //カナがマッチした配列について、金額でマッチング
                const amountMatched = matcheAmount(cirlItem.amount,nameMatchedArray)

                if(amountMatched.length !== 0){
                //金額もマッチングした場合filterdに追加。
                    filtered.push({cir:cirlItem,cis:amountMatched[0]})
                    cis = matchedCisDelete(amountMatched[0],cis)
                }
                return
            } else {
            //カナがマッチしなかったら終了。
                console.log('no matched [cir id]: '+ cirlItem.come_in_records_id)
                return
            }
        }
    })
    return filtered
}

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
            console.log(cir)
            console.log(cis)
            console.log(matched)
            //マッチした配列をapi/indexに投げて、登録処理を作る。
            this.$axios.put('api/payment_agency/matching',matched)
            .then((response)=>{
                console.log(response.data)
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