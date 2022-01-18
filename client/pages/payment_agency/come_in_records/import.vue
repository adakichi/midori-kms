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
        <v-btn @click="match">match</v-btn>
        <v-row>
            <v-col>
                {{fileInfo}}
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
                v-model="selected"
                :headers="headers"
                :items="fileResult"
                item-key="id"
                :items-per-page="-1"
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
    console.log(wareki)
    return String((2018 + parseInt(wareki.substring(0,2),10)))+ '-' +wareki.substring(2,4) + "-" +wareki.substring(4,6)
}

//CSVを展開する
const parseCsv = function(blocktext){
    const lines = blocktext.split('\r\n')
    const obj = lines.map(line =>{
        return line.split(',')
    })
    return obj.map((item, index) =>{
        item.push(index)
        return item
    })
}

//fileInfoにデータを入れる部分
const setFileInfo =function(name,parsedCsv,thisObj){

    const headerRecord = parsedCsv.filter((ele)=>{ return (ele[0] == 1)})[0]
    const trailerRecord = parsedCsv.filter((ele)=>{ return (ele[0] == 8)})[0]
    thisObj.fileInfo.name         = name
    thisObj.fileInfo.downloadDate = warekiToSeireki(headerRecord[3])
    thisObj.fileInfo.totalAmount  = trailerRecord[2]
    thisObj.fileInfo.count        = trailerRecord[1]
    thisObj.fileInfo.bankName     = String(headerRecord[7]).replace(/[0-9"]/g,"")

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
            selected:[],
            fileInfo:{name:'',downloadDate:'',totalAmount:0,count:0,bankName:'',imported:0},
            fileResult:[],
            search:'',
            headers:[
                { text:'row',       value:'id'},
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
                    const name = String(arr[14]).replace(/[0-9"]/g,"")
                    let customerId = ''
                    if(arr[13]){
                        customerId = arr[13]
                    } else {
                        customerId = String(arr[14]).replace(/[^0-9]/g,"")
                    }
                    obj.customer_id = customerId
                    obj.come_in_name = name
                    obj.actual_deposit_amount = arr[6]
                    obj.actual_deposit_date = warekiToSeireki(arr[2])
                    obj.id = arr[20]
                    resultArray.push(obj)
                })
                this.fileResult = resultArray
                this.loading=false
            }
        },
        submitData(){
            const selectedItems = this.selected
            this.fileInfo.imported = selectedItems.length
            console.log(this.fileInfo)
            console.log('length:',selectedItems.length)
            console.log(selectedItems)
            this.$axios.post('api/payment_agency/cir',{fileinfo:this.fileInfo,data:selectedItems})
            .then((response)=>{
                console.log('response:',response)
                if(response.data.error){
                    alert(response.data.message)
                } else {
                    console.log(response)
                    alert('新規登録:'+ response.data.affectedRows + '\nResult:' + response.data.message)
                    const doMatch = confirm('紐づけしますか？')
                    if(doMatch){this.match(this.fileInfo.downloadDate)}
                }
            })
        },
        match(importDate){
            console.log(importDate)
            console.log('cirArray:',this.selected)
            const cirArray = this.selected
            if(cirArray){
                this.$axios.post('api/payment_agency/matching',{cir:cirArray,baseDate:importDate})
                .then(response=>{console.log(response);alert(response.data)})
            } else {
                alert('インポートデータがありません。')
            }
        }
    }
}
</script>