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
                @click:clear="stoploading"
                @change="inputFile"
                :loading="loading"
                ></v-file-input>
                <v-spacer></v-spacer>
                <v-btn @click="goIndex">戻る</v-btn>
                </v-app-bar>
                <p>{{fileResult}}</p>
            </v-col>
        </v-row>    
        <v-row>
            <v-col>
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
export default {
    layout : 'pa',
    data(){
        return{
            loading:false,
            fileinfo:'',
            fileResult:[],
            search:'',
            headers:[
                // {
                //     text:'id',
                //     align:'start',
                //     sortable:false,
                //     value:'come_in_records_id',
                //     groupable:false
                // },
                { text:'受任番号', value:'customer_id'},
                { text:'名前', value:'come_in_name'},
                { text:'金額', value:'actual_deposit_amount', groupable:false},
                { text:'日付', value:'actual_deposit_date'},
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
                return this.fileResult = ''
            }
            this.fileinfo = e
            console.log(e)
            let reader = new FileReader()
            reader.readAsText(e,'shift-jis')
            reader.onload = ()=>{
                let txt = reader.result
                    txt = txt.split('\r\n')
                let ftexts = txt.map(line =>{
                    return line.split(',')
                })
                // let ftexts = txt.match(/.{120}/g)
                console.log(ftexts)
                let resultArray = []
                let date = ftexts[0][5]
                    date = String(2018 + parseInt(date.substr(0,1),10))+ '-' +date.substr(1,2) + "-" +date.substr(3,2)
                this.fileResult = ftexts.forEach((arr)=>{
                    let obj = {}
                    const name = String(arr[14]).replace(/[0-9]/g,"")
                    const customerId = String(arr[14]).replace(/[^0-9]/g,"")
                    obj.customer_id = customerId
                    obj.come_in_name = name
                    obj.actual_deposit_amount = arr[6]
                    obj.actual_deposit_date = date
                    resultArray.push(obj)
                })
                this.fileResult = resultArray
                this.loading=false
            }
        }
    }
}
</script>