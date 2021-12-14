<template>
    <v-container>
                <v-app-bar>
                    <v-app-bar-title>ID：{{customer? customer.customer_id:'No ID'}} {{customer?customer.name:'No Name'}}</v-app-bar-title>
                    <v-spacer></v-spacer>
                    <v-btn @click="goback">戻る</v-btn>
                </v-app-bar>
        <v-row>
            <v-col class="text-center">
                <v-dialog max-width="800" v-model="dialog" persistent>
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on">新規和解登録</v-btn>
                    </template>
                    <v-card color="grey darken-3">
                        <v-app-bar flat>
                            和解登録
                            <v-spacer></v-spacer>
                            <v-icon @click="dialog = false">mdi-close</v-icon>
                        </v-app-bar>
                        <v-tabs
                        v-model="tabs"
                        grow
                        background-color="transparent">
                        <v-tab>和解内容</v-tab>
                        <v-tab>イレギュラー</v-tab>
                        <v-tab>口座情報</v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="tabs">
                        <v-tab-item>
                            <v-container>
                            <v-row>
                                <v-col>
                                    <v-select v-model="creditor" :items="creditors" label="債権者"></v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                    :rules="[num]"
                                    v-model="totalAmount"
                                    type="number"
                                    label="支払い総額"
                                    suffix=" 円"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                    v-model="monthlyAmount"
                                    :rules="[num]"
                                    type="number"
                                    label="月額"
                                    suffix=" 円"
                                    ></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-text-field
                                    v-model="numberOfPayments"
                                    :rules="[num]"
                                    type="number"
                                    label="支払い回数"
                                    suffix=" 回"
                                    ></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-select
                                    v-model="fraction"
                                    :items="fractions"
                                    label="端数"
                                    ></v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                    v-model="startDate"
                                    label="開始日"
                                    >
                                    <template v-slot:append >
                                        <div>
                                            <v-menu>
                                            <template v-slot:activator="{on, attrs}">
                                            <v-icon v-bind="attrs" v-on="on">
                                                mdi-calendar-month
                                            </v-icon>
                                            </template>
                                            <v-date-picker v-model="startDate"></v-date-picker>
                                            </v-menu>
                                        </div>
                                    </template>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            </v-container>
                        </v-tab-item>
                        <v-tab-item>
                            <v-container>
                            <v-row>
                                <v-col>
                                    <span><v-checkbox
                                    label="変則(他に選択肢がなければこれ)"
                                    v-model="irregular"
                                    ></v-checkbox></span>
                                    <v-checkbox
                                    label="年金(偶数月入金)"
                                    v-model="pension"></v-checkbox>
                                    <v-checkbox
                                    label="将来利息がつく"
                                    v-model="interest"></v-checkbox>
                                    <v-checkbox
                                    label="ボーナス払いがある"
                                    v-model="bonus"></v-checkbox>
                                    <v-checkbox
                                    label="別和解と合算がある"
                                    v-model="addition"></v-checkbox>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-checkbox
                                    label="代行手数料をもらう"
                                    v-model="commission"></v-checkbox>
                                    <v-checkbox
                                    label="顧問料をもらう"
                                    v-model="advisoryFee"></v-checkbox>
                                </v-col>
                            </v-row>
                        </v-container>
                        </v-tab-item>
                        <v-tab-item>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <v-select v-model="bankname" :items="banknames" label="銀行名"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select v-model="bankcode" :items="bankcodes" label="銀行コード"></v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-select v-model="branchname" :items="branchnames" label="支店名"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select v-model="branchcode" :items="branchcodes" label="支店コード"></v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col md="2" lg="2">
                                        <v-select v-model="kind" :items="kinds" label="種別"></v-select>
                                    </v-col>
                                    <v-col md="4" lg="4">
                                        <v-text-field v-model="accountNumber" label="口座番号"></v-text-field>
                                    </v-col>
                                    <v-col md="6" lg="6">
                                        <v-text-field v-model="accountHolder" label="口座名義"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-tab-item>
                        </v-tabs-items>
                        <v-divider></v-divider>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn>登録</v-btn>
                        </v-card-actions>         
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    layout : 'pa',
    data(){
        return{
            dialog:false,
            targetText:'',
            activePicker:false,
            startDate:'',
            tabs:null,
            //Form data
            customer:{},
            creditor:'',
            totalAmount:null,
            monthlyAmount:null,
            numberOfPayments:null,
            fraction:'初回',
            irregular:false,
            pension:false,
            interest:false,
            bonus:false,
            addition:false,
            commission:true,
            advisoryFee:true,
            //口座部分
            bankname:'',
            bankcode:null,
            branchname:'',
            branchcode:null,
            kind:null,
            accountNumber:'',
            accountHolder:'',


            //items
            creditors:[
                'アコム',
                'プロミス'
            ],
            fractions:['初回','最終回'],
            banknames:['三菱東京UFJ','三井住友'],
            bankcodes:['0123','0456','0789'],
            branchnames:['東京支店','駅前支店'],
            branchcodes:['123','234','567'],
            kinds:['普通','当座'],

            //validate rules
            required: value => !!value || "必ず入力してください",
            limit_length: value => value.length <= 10 || "10文字以内です。",
            num:value => !isNaN(value) || "数値のみ可" 
        }
    },
    computed:{
        customers(){
            return this.$store.getters['pa/getCustomers']
        }
    },
    methods:{
        searchCustomer(){
            this.$store.dispatch('pa/searchCustomers',this.targetText)
        },
        goCustomerPage(e){
            console.log(e)
            this.$router.push('/payment_agency/customers/'+ Number(e.customer_id))
        },
        goback(){
            this.$router.push('/payment_agency/customers')
        }
    },
    created(){
            this.customer = this.$store.getters['pa/getCustomers'][0]
    }
}
</script>