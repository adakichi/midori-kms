<template>
    <v-container>
        <h1>come in records</h1>
        <v-row>
            <v-col>
                <v-app-bar>
                <v-file-input
                hint="とりあえずCSVのみ受け付けます。"
                persistent-hint
                accept=".txt, .csv"
                @click="startloading"
                @click:clear.prevent="stoploading"
                @change="inputFile"
                :loading="loading"
                ></v-file-input>
                <v-spacer></v-spacer>
                <v-btn @click="goIndex">戻る</v-btn>
                </v-app-bar>
            </v-col>
        </v-row>    
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>
                        <v-text-field
                        v-model="search"
                        label="Search(まだうごかんばい)"
                        class="mx-4"
                        >
                        </v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn @click="submitData">登録</v-btn>
                    </v-card-title>

                <v-data-table
                :headers="headers"
                :items="fileResult"
                item-key="come_in_records_id"
                :items-per-page="5"
                class="elevation-1"
                :search="search"
                show-select
                show-group-by
                dense
                >
                    <template v-slot:item.delete_flag="{item}">
                        <v-simple-checkbox
                        v-model="item.delete_flag === 0 ?false:true"
                        disabled
                        >
                        </v-simple-checkbox>
                    </template>
                </v-data-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
//各処理から関係性が低いものを抜き出して関数化（できるだけメインの処理を読みやすくする為）

//令和を西暦へ
const warekiToSeireki=function(wareki){
    return String(2018 + parseInt(wareki.substr(0,1),10))+ '-' +wareki.substr(1,2) + "-" +wareki.substr(3,2)
}

//CSVを展開する
const parseCsv = function(blocktext){
    const lines = blocktext.split('\r\n')
    return lines.map(line =>{
        return line.split(',')
    })
}

//fileInfoにデータを入れる部分
const setFileInfo =function(name,parsedCsv,thisObj){
    const trailerRecord = parsedCsv[parsedCsv.length-2]
    thisObj.fileInfo.name = name
    thisObj.fileInfo.downloadDate = warekiToSeireki(parsedCsv[0][3])
    thisObj.fileInfo.totalAmount = trailerRecord[2]
    thisObj.fileInfo.count = trailerRecord[1]
    thisObj.fileInfo.bankName = parsedCsv[0][7]

}

//インポートしたCSVからデータカラムのみ抽出
const selectDataColumns= function(lines){
    return lines.filter(line => { return line[0] == '2'})
}


//^/^/^/^/^/^/^/^/^//

export default {
    layout : 'pa',
    data(){
        return{
            loading:false,
            fileInfo:{name:'',downloadDate:'',totalAmount:0,count:0,bankName:''},
            fileResult:[],
            search:'',
            headers:[
                { text:'受任番号',  value:'customer_id'},
                { text:'名前',      value:'come_in_name'},
                { text:'金額',      value:'actual_deposit_amount', groupable:false},
                { text:'日付',      value:'actual_deposit_date'},
                // { text:'come_in_schedule_id', value:'come_in_schedule_id', groupable:false},
                // { text:'delete_flag', value:'delete_flag'},
                // { text:'created_at', value:'created_at'}
            ]
        }
    },
    computed:{
    },
    methods:{
        goIndex(){
            this.$router.push('/payment_agency/come_in_records/')
        },
        startloading(){
            this.loading = true
        },
        stoploading(){
            this.loading = false
        },
        inputFile(e){
            if(!e){ 
                return this.fileResult = []
            }
            let reader = new FileReader()
            reader.readAsText(e,'shift-jis')
            reader.onload = ()=>{
                const parsedCsv = parseCsv(reader.result)
                // let ftexts = txt.match(/.{120}/g)
                parsedCsv.pop()
                setFileInfo(e.name,parsedCsv,this)
                const dataColumns = selectDataColumns(parsedCsv)
                let resultArray = []
                this.fileResult = dataColumns.forEach((arr)=>{
                    let obj = {}
                    const name = String(arr[14]).replace(/[0-9]/g,"")
                    const customerId = String(arr[14]).replace(/[^0-9]/g,"")
                    obj.customer_id = customerId
                    obj.come_in_name = name
                    obj.actual_deposit_amount = arr[6]
                    obj.actual_deposit_date = warekiToSeireki(arr[2])
                    resultArray.push(obj)
                })
                this.fileResult = resultArray
                this.loading=false
            }
        },
        submitData(){
            this.$store.dispatch('pa/postImportfile',{fileinfo:this.fileInfo,data:this.fileResult})
        }
    }
}
</script>