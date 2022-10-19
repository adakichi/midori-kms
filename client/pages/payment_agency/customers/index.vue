<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>Customers</v-app-bar-title>
                    <v-spacer></v-spacer>
                    <v-btn @click="openRegisterDialog">新規登録</v-btn>
                </v-app-bar>
                <v-dialog v-model="registerDialogIsOpen" width="300">
                    <v-card>
                        <v-card-text>
                            <v-text-field label="受任番号"  v-model="newCustomer.customer_id" type="number"></v-text-field>
                            <v-text-field label="氏名"      v-model="newCustomer.name"></v-text-field>
                            <v-text-field label="カナ"      v-model="newCustomer.kana"></v-text-field>
                            <v-text-field label="LU番号"    v-model="newCustomer.lu_id" type="number"></v-text-field>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="registCustomer">登録</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-app-bar>
                    <v-radio-group v-model="searchType" mandatory row>
                        <v-radio label="受任番号"   value="jyunin"></v-radio>
                        <v-radio label="名前"       value="name"></v-radio>
                        <v-radio label="LU"         value="lu"></v-radio>
                        <v-radio label="自動"     value="auto"></v-radio>
                    </v-radio-group>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="targetText" label="search" @keydown.enter="searchCustomer"></v-text-field>
                    <v-btn @click="searchCustomer">検索</v-btn>
                </v-app-bar>
                <v-data-table
                v-show="customers[0]"
                :headers="headers"
                :items="customers"
                item-key="customer_id"
                :items-per-page="10"
                class="elevation-1"
                :search="search"
                show-select
                show-group-by
                dense
                @click:row="goCustomerPage"
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
                <v-row v-show="!customers[0]"><v-col>
                <v-sheet class="text-center" color="grey darken-3">該当無し</v-sheet>
                </v-col></v-row>

        <!-- スナックバー -->
        <v-snackbar
            v-model="snack"
            :timeout="3000"
            :color="snackColor"
        >
            {{ snackText }}
            <template v-slot:action="{ attrs }">
            <v-btn
                v-bind="attrs"
                text
                @click="snack = false"
            >
                Close
            </v-btn>
            </template>
        </v-snackbar>

    </v-container>
</template>

<script>
import {zenkaku2HankakuEisu} from "../../../plugins/util.js"
export default {
    layout : 'pa',
    data(){
        return{
            targetText:'',
            search:'',
            searchType:'auto',
            registerDialogIsOpen:false,
            newCustomer:{
                customer_id:'',
                name:'',
                lu_id:'',
                kana:'',
            },
            headers:[
                { text:'customer_id', value:'customer_id'},
                { text:'name', value:'name'},
                { text:'kana', value:'kana'}
            ],
            //snack bar
            snack:'',
            snackColor:'',
            snackText:''

        }
    },
    computed:{
        customers(){
            return this.$store.getters['pa/getCustomers']
        }
    },
    methods:{
        searchCustomer(){
            this.targetText = zenkaku2HankakuEisu(this.targetText)
            //面倒なので、文字列か数字かで検索オプションを自動で判別する
            if(this.searchType == "auto"){
                if( isNaN(this.targetText)){
                    //文字列の場合は名前検索
                    this.searchType = "name"
                } else {
                    this.searchType = "jyunin"
                }
                this.popupSnackBar("検索方法：" + this.searchType)
            }

            const options = {
                "searchType":this.searchType,
            }
            console.log(options.searchType)
            this.$store.dispatch('pa/searchCustomers',{targetText:this.targetText,options:options})
            .then(()=>{if(this.customers.length === 1){
                this.$router.push('/payment_agency/customers/'+ Number(this.customers[0].customer_id))
            }})
        },
        goCustomerPage(e){
            this.$router.push('/payment_agency/customers/'+ Number(e.customer_id))
        },
        openRegisterDialog(){
            this.registerDialogIsOpen = true
        },
        registCustomer(){
            this.$axios.post('api/payment_agency/customers/',this.newCustomer)
            .then((response)=>{
                console.log(response.data)
                if(response.data.error){ return alert(response.data.message)}
                alert(response.data)
                this.$router.push('/payment_agency/customers/'+ Number(this.newCustomer.customer_id))
            })
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
        }
    }
}
</script>