<template>
    <v-container>
                <h1>支払い口座マスタ</h1>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>
                        <v-text-field v-model="searchText" label="検索"></v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn @click="openNewAccountDialog">新規登録</v-btn>
                    </v-card-title>
                    <v-data-table
                     :items="accounts"
                     :headers="headers"
                     key="creditors_account_id"
                     :search="searchText"
                     @click:row="openUpdateAccountDialog"
                    ></v-data-table>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="newAccountDialog">
            <v-card>
                <v-card-title>新規登録</v-card-title>
                <v-card-text>
                    <v-autocomplete label="債権者ID" :items="creditors" item-text="creditor_name" item-value="creditor_id" v-model="newAccount.creditor_id"></v-autocomplete>
                    <v-autocomplete label="銀行" return-object :items="banknameItems" v-model="selectedBankAccount"></v-autocomplete>
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
                    <v-select label="種別" :items="kindItems" v-model="newAccount.kind"></v-select>
                    <v-text-field label="名義人"    v-model="newAccount.account_holder"></v-text-field>
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
            newAccountDialog:false,
            creditors:[],
            accounts:[],
            searchText:'',
            kindItems:['普通','当座','貯蓄'],
            banknameItems:[],
            selectedBankAccount:{},
            newAccount:{
                creditor_id:0,
                account_holder:'',
                bankcode:'',
                bankname:'',
                branchcode:'',
                branchname:'',
                kind:'普通',
                account_holder:''
            },
            headers:[
                {text:'ID',   value:'creditors_account_id'},
                {text:'債権者ID',   value:'creditor_id'},
                {text:'名義人',   value:'account_holder'},
                {text:'銀行名',   value:'bankname'},
                {text:'銀行',   value:'bankcode'},
                {text:'支店',   value:'branchcode'},
                {text:'支店名',   value:'branchname'},
                {text:'種別',   value:'kind'}
            ]
        }
    },
    methods:{
        getAccounts(){
            this.$axios.get('api/payment_agency/creditors/accounts')
            .then(response=>{
                if(response.data.error){ return response.data.message}
                this.accounts = response.data
                let bank = []
                this.accounts.forEach(ele => {
                    bank.push({bankcode:ele.bankcode,bankname:ele.bankname,branchcode:ele.branchcode,branchname:ele.branchname,text:ele.bankname+':'+ele.bankcode+'/'+ele.branchname+':'+ele.branchcode})
                });
                this.banknameItems = bank
            })
        },
        getCreditors(){
            this.$axios.get('api/creditors')
            .then(response=>{
                if(response.data.error){ return response.data.message}
                this.creditors = response.data
            })
        },
        openNewAccountDialog(){
            this.registerOrupdate = true //更新ボタンと登録ボタンの切り替え
            this.newAccountDialog = true
        },
        registerNewAccount(){
            const str = '債権者id:'+this.newAccount.creditor_id+'\n銀行名:'+this.selectedBankAccount.bankname+'\n銀行コード:'+this.selectedBankAccount.bankcode+'\n支店名:'+this.selectedBankAccount.branchname+'\n支店コード:'+this.selectedBankAccount.branchcode+'\n口座種別:'+this.newAccount.kind
            const doNot = !confirm(str+'\nで登録してよろしいですか？')
            if(doNot){return this.registerOrupdate = true}
                this.newAccount.bankcode = this.selectedBankAccount.bankcode
                this.newAccount.bankname = this.selectedBankAccount.bankname
                this.newAccount.branchcode = this.selectedBankAccount.branchcode
                this.newAccount.branchname = this.selectedBankAccount.branchname
            this.$axios.post('api/payment_agency/creditors/accounts',this.newAccount)
                .then(response=>{
                    if(response.data.error){ 
                        this.registerOrupdate = true
                        return response.data.message
                    }
                    alert(response.data)
                    this.newAccountDialog = false
                    this.creditors = response.data
                    this.registerOrupdate = true
                })
        },
        openUpdateAccountDialog(e){
            this.newAccountDialog = true
            this.registerOrupdate = false //更新ボタンと登録ボタンの切り替え
            this.newAccount = e
            this.selectedBankAccount.branchcode = e.branchcode
            this.selectedBankAccount.branchname = e.branchname
            this.selectedBankAccount.bankcode = e.bankcode
            this.selectedBankAccount.bankname = e.bankname
        },
        updateAccount(){
            const str = '債権者id:'+this.newAccount.creditor_id+'\n銀行名:'+this.newAccount.bankname+'\n銀行コード:'+this.newAccount.bankcode+'\n支店名:'+this.newAccount.branchname+'\n支店コード:'+this.branchcode+'\n口座種別:'+this.newAccount.kind
            const doNot = !confirm(str+'\nで更新してよろしいですか？')
            if(doNot){return this.registerOrupdate = true}
                this.newAccount.bankcode = this.selectedBankAccount.bankcode
                this.newAccount.bankname = this.selectedBankAccount.bankname
                this.newAccount.branchcode = this.selectedBankAccount.branchcode
                this.newAccount.branchname = this.selectedBankAccount.branchname
            this.$axios.put('api/payment_agency/creditors/accounts',this.newAccount)
                .then(response=>{
                    if(response.data.error){ 
                        this.registerOrupdate = true
                        return response.data.message
                    }
                    alert(response.data)
                    this.newAccountDialog = false
                    this.creditors = response.data
                    this.registerOrupdate = true
                })
        }
    },
    created(){
        this.getAccounts()
        this.getCreditors()
    }
}
</script>