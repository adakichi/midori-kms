<template>
    <v-container>
                <h1>銀行/支店 登録</h1>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>
                        <v-text-field v-model="searchText" label="検索"></v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn @click="openNewDialog">新規登録</v-btn>
                    </v-card-title>
                    <v-data-table
                     :items="banklist"
                     :headers="headers"
                     key="creditors_account_id"
                     :search="searchText"
                     :items-per-page="-1"
                     show-group-by
                     @click:row="openUpdateDialog"
                    ></v-data-table>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="newDialog">
            <v-card>
                <v-card-title>新規登録</v-card-title>
                <v-card-text>
                    <v-autocomplete label="銀行" return-object :items="banks" v-model="selectedBankAccount"></v-autocomplete>
                    <v-row>
                        <v-col>
                            <v-text-field label="銀行名"        v-model="selectedBankAccount.bankname"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="銀行コード"    v-model="selectedBankAccount.bankcode"></v-text-field>
                    </v-col></v-row>
                    <v-row>
                        <v-col>
                            <v-text-field label="支店名"        v-model="selectedBankAccount.branchname"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="支店コード"    v-model="selectedBankAccount.branchcode"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn v-show="registerOrupdate" @click="registerNewAccount" color="success">登録</v-btn>
                    <v-btn v-show="!registerOrupdate" @click="updateAccount" color="warning">更新</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
export default {
    layout : 'pa',
    data(){
        return{
            registerOrupdate:true, // trueの場合は新規登録 falseは更新ボタンが表示される。
            newDialog:false,
            banklist:[],
            banks:[],
            searchText:'',
            selectedBankAccount:{},
            newAccount:{
                bankcode:'',
                bankname:'',
                branchcode:'',
                branchname:'',
            },
            headers:[
                {text:'銀行名',   value:'bankname', groupable:false},
                {text:'銀行',     value:'bankcode'},
                {text:'支店名',   value:'branchname', groupable:false},
                {text:'支店',     value:'branchcode', groupable:false}
            ]
        }
    },
    methods:{
        getBanks(){
            this.$axios.get('api/payment_agency/banklist')
            .then(response=>{
                if(response.data.error){ return response.data.message}
                this.banklist = response.data
                let banks = []
                this.banklist.forEach(ele => {
                    banks.push({text:ele.bankname+':'+ele.bankcode, bankname:ele.bankname, bankcode:ele.bankcode})
                })
                console.log(banks)
                this.banks = banks
            })
        },
        openNewDialog(){
            this.registerOrupdate = true //更新ボタンと登録ボタンの切り替え
            this.newDialog = true
        },
        registerNewAccount(){
            const doNot = !confirm('登録してよろしいですか？')
            if(doNot){return this.registerOrupdate = true}
                this.newAccount.bankcode = this.selectedBankAccount.bankcode
                this.newAccount.bankname = this.selectedBankAccount.bankname
                this.newAccount.branchcode = this.selectedBankAccount.branchcode
                this.newAccount.branchname = this.selectedBankAccount.branchname
            this.$axios.post('api/payment_agency/banklist',this.newAccount)
                .then(response=>{
                    if(response.data.error){ 
                        this.registerOrupdate = true
                        return response.data.message
                    }
                    alert(response.data)
                    this.newDialog = false
                    this.creditors = response.data
                    this.registerOrupdate = true
                })
        },
        openUpdateDialog(e){
            this.newDialog = true
            this.registerOrupdate = false //更新ボタンと登録ボタンの切り替え
            this.newAccount = e
            this.selectedBankAccount.branchcode = e.branchcode
            this.selectedBankAccount.branchname = e.branchname
            this.selectedBankAccount.bankcode = e.bankcode
            this.selectedBankAccount.bankname = e.bankname
        },
        updateAccount(){
            const doNot = !confirm('更新してよろしいですか？')
            if(doNot){return this.registerOrupdate = true}
                this.newAccount.bankcode = this.selectedBankAccount.bankcode
                this.newAccount.bankname = this.selectedBankAccount.bankname
                this.newAccount.branchcode = this.selectedBankAccount.branchcode
                this.newAccount.branchname = this.selectedBankAccount.branchname
            this.$axios.put('api/payment_agency/banklist',this.newAccount)
                .then(response=>{
                    if(response.data.error){ 
                        this.registerOrupdate = false
                        return response.data.message
                    }
                    alert(response.data)
                    this.newDialog = false
                    this.creditors = response.data
                    this.registerOrupdate = false
                })
        }
    },
    created(){
        this.getBanks()
    }
}
</script>