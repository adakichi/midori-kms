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
                            <v-icon @click.stop="dialog = false">mdi-close</v-icon>
                        </v-app-bar>
                        <v-tabs
                        v-model="registerTabs"
                        grow
                        background-color="transparent">
                        <v-tab>和解内容</v-tab>
                        <v-tab>イレギュラー</v-tab>
                        <v-tab>口座情報</v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="registerTabs">
                        <v-tab-item>
                            <v-container>
                            <v-row>
                                <v-col>
                                    <v-autocomplete v-model="creditor"
                                    item-value="creditor_id"
                                    item-text="creditor_name"
                                    :items="creditors"
                                    label="債権者"></v-autocomplete>
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
                                    <v-text-field
                                    v-model="firstAmount"
                                    type="number"
                                    label="初回支払い金額"
                                    suffix="　円"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-select
                                    v-model="monthlyPaymentDueDate"
                                    label="支払日"
                                    :items="dueDate"
                                    ></v-select>
                                </v-col>
                                <v-col>
                                    <v-text-field
                                    v-model="startDate"
                                    label="開始日"
                                    >
                                    <template v-slot:append >
                                            <v-menu>
                                            <template v-slot:activator="{on, attrs}">
                                            <v-icon v-bind="attrs" v-on="on">
                                                mdi-calendar-month
                                            </v-icon>
                                            </template>
                                            <v-date-picker v-model="startDate"></v-date-picker>
                                            </v-menu>
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
                                    <v-text-field
                                    label="将来利息がつく"
                                    type="number"
                                    suffix=" %"
                                    v-model="interest"></v-text-field>
                                    <v-checkbox
                                    label="ボーナス払いがある"
                                    v-model="bonus"></v-checkbox>
                                    <v-row v-show="bonus">
                                    <v-col>
                                        <v-select
                                        v-model="summerBonusDate"
                                        label="夏の支払い日"
                                        :items="summer"
                                        suffix="　月"
                                        >
                                        </v-select>
                                    </v-col>
                                    <v-col>
                                    <v-text-field
                                    label="ボーナス夏"
                                    type="number"
                                    suffix=" 円"
                                    v-model="summerBonusAmount"></v-text-field>
                                    </v-col>
                                    </v-row>
                                    <v-row v-show="bonus">
                                    <v-col>
                                        <v-select
                                        v-model="winterBonusDate"
                                        label="夏の支払い日"
                                        :items="winter"
                                        suffix="　月"
                                        >
                                        </v-select>
                                    </v-col>
                                    <v-col>
                                    <v-text-field
                                    label="ボーナス冬"
                                    type="number"
                                    suffix=" 円"
                                    v-model="winterBonusAmount"></v-text-field>
                                    </v-col>
                                    </v-row>
                                    <v-checkbox
                                    label="別和解と合算がある"
                                    v-model="addition"></v-checkbox>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                    label="代行手数料の金額"
                                    type="number"
                                    suffix="　円"
                                    v-model="commission"></v-text-field>
                                    <v-text-field
                                    type="number"
                                    label="顧問料の金額"
                                    suffix="　円"
                                    v-model="advisoryFee"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-textarea outlined v-model="accountComment" label="メモ"></v-textarea>
                        </v-container>
                        </v-tab-item>
                        <v-tab-item>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <v-select v-model="bankname" item-text="bankname" item-value="bankcode" :items="accounts" label="銀行名"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select v-model="bankcode" item-text="bankcode" item-value="bankcode" :items="accounts" label="銀行コード"></v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-select v-model="branchname" item-text="branchname" item-value="branchcode" :items="accounts" label="支店名"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select v-model="branchcode" item-text="branchcode" item-value="branchcode" :items="accounts" label="支店コード"></v-select>
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
                            <v-btn @click="postNewAccount">登録</v-btn>
                        </v-card-actions>         
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>

        <!-- ここから和解内容表示 -->
        <v-tabs v-model="tabs">
            <v-tab>和解一覧</v-tab>
            <v-tab>支払い予定</v-tab>
            <v-tab>入金予定</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabs">
        <v-tab-item>
        <v-container>
        <v-row v-for="(settle,index) in contentsOfSettlements" :key="index">
            <v-col>
                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col>
                                {{settle.creditor_name}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                総額：{{settle.total_amount}}円
                                月額：{{settle.monthly_amount}}円
                                初回：{{settle.first_amount}}
                                毎月：{{settle.monthly_payment_due_date}}
                                回数：{{settle.number_of_payments}}回
                                日付：{{settle.start_date}}
                            </v-col>
                            <v-col>
                                <v-btn @click="createPaymentSchedules(index)">予定作成</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                メモ：{{settle.account_comment}}
                            </v-col>
                        </v-row>
                        <v-divider></v-divider>
                        <v-row>
                            <v-col>
                                イレギュラー
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-system-bar>
                                    <v-checkbox
                                        v-model="settle.irregular"
                                        label="イレギュラー"
                                        disabled
                                    ></v-checkbox>
                                    <v-checkbox
                                        v-model="settle.pension"
                                        label="年金"
                                        disabled
                                    ></v-checkbox>
                                    <v-checkbox
                                        v-model="settle.interest"
                                        label="将来利息"
                                        disabled
                                    ></v-checkbox>
                                    <v-checkbox
                                        v-model="settle.bonus"
                                        label="ボーナス"
                                        disabled
                                    ></v-checkbox>
                                    <v-checkbox
                                        v-model="settle.addition"
                                        label="合算"
                                        disabled
                                    ></v-checkbox>
                                </v-system-bar>
                            </v-col>
                        </v-row>                               
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>


        <!-- 支払い計画作成のdialog -->
        <v-dialog max-width="800" v-model="createScheduleDialog" persistent>
            <v-card>
                <v-app-bar flat>
                    予定作成
                    <v-spacer></v-spacer>
                    <v-btn @click="registerPaymentSchedules()">確定</v-btn>
                    <v-spacer></v-spacer>
                    <v-icon @click.stop="createScheduleDialog = false; schedules = []">mdi-close</v-icon>
                </v-app-bar>
                <v-card-text>
                    <v-data-table
                    :headers="schedulesHeaders"
                    :items="schedules"
                    >
                    <template v-slot:item.date="props">
                      <v-edit-dialog
                      :return-value.sync="props.item.date"
                      @save="save"
                      @cancel="cancel"
                      @open="open"
                      @close="close"
                    >
                      {{ props.item.date }}
                      <template v-slot:input>
                        <v-text-field
                          v-model="props.item.date"
                          label="日付"
                          single-line
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                    </template>

                    <template v-slot:item.amount="props">
                      <v-edit-dialog
                      :return-value.sync="props.item.amount"
                      @save="save"
                      @cancel="cancel"
                      @open="open"
                      @close="close"
                    >
                      {{ props.item.amount }}
                      <template v-slot:input>
                        <v-text-field
                          v-model="props.item.amount"
                          label="金額"
                          single-line
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                    </template>

                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-dialog>
        </v-container>


        <!-- 支払い予定の部分 -->
        </v-tab-item>
        <v-tab-item>
            <v-container>
                <v-row>
                    <v-col>
                        <v-app-bar>
                            <v-btn>予定作成</v-btn>
                            <v-btn>確定</v-btn>
                        </v-app-bar>
                        <v-row v-for="(schedule,index) in paymentSchedules" :key="index">
                            <v-col>
                                債権者ID：{{schedule.creditor_id}}
                                金額：{{schedule.amount}}
                                日付：{{schedule.date}}
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
        </v-tab-item>
        <v-tab-item>
            <v-container>
                <v-row v-for="(cir,index) in customerCir" :key="index">
                    <v-col>
                        日付：{{cir.payment_day}}
                        金額：{{cir.expected_amount}}
                        入金：{{cir.come_in_recprds_id ? true : false}}
                    </v-col>
                </v-row>
            </v-container>
        </v-tab-item>
        </v-tabs-items>
    </v-container>
</template>

<script>
const moment = require('moment')
export default {
    layout : 'pa',
    data(){
        return{
            dialog:false,
            createScheduleDialog:false,
            targetText:'',
            activePicker:false,
            startDate:'',
            tabs:null,
            registerTabs:null,
            //Form data
            customer:{},
            creditor:'',
            totalAmount:null,
            monthlyAmount:null,
            numberOfPayments:null,
            monthlyPaymentDueDate:'',
            firstAmount:'初回',
            //irregular
            irregular:false,
            pension:false,
            interest:false,
            bonus:false,
            addition:false,
            commission:1000,
            advisoryFee:500,
            accountComment:'',
            //口座部分
            bankname:'',
            bankcode:null,
            branchname:'',
            branchcode:null,
            kind:null,
            accountNumber:'',
            accountHolder:'',

            //Bonus詳細
            summerBonusAmount:null,
            summerBonusDate:null,
            winterBonusAmount:null,
            winterBonusDate:null,

            //items
            dueDate:['末日',1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
            banks:[],
            kinds:['普通','当座'],
            summer:[4,5,6,7,8,9],
            winter:[10,11,12,1,2,3],

            // ここから和解内容


            //支払い予定の部分用
            schedules:[],
            schedulesHeaders:[
                {text:'日付',   value:'date'},
                {text:'金額',   value:'amount'},
            ],
            //validate rules
            required: value => !!value || "必ず入力してください",
            limit_length: value => value.length <= 10 || "10文字以内です。",
            num:value => !isNaN(value) || "数値のみ可" 
        }
    },
    computed:{
        customers(){
            return this.$store.getters['pa/getCustomers']
        },
        creditors(){
            return this.$store.getters['getCreditors']
        },
        accounts(){
            const data = this.banks.filter((account)=>{
                return account.creditor_id == this.creditor
            })
            return data
        },
        contentsOfSettlements(){
            return this.$store.getters['pa/getContentsOfSettlements']
        },
        customerCir(){
            return this.$store.getters['pa/getCustomerCir']
        },
        paymentSchedules(){
            return this.arr = this.$store.getters['pa/getPaymentSchedules']
        }
    },
    methods:{
        searchCustomer(){
            this.$store.dispatch('pa/searchCustomers',this.targetText)
        },
        goCustomerPage(e){
           this.$router.push('/payment_agency/customers/'+ Number(e.customer_id))
        },
        goback(){
            this.$router.push('/payment_agency/customers')
        },
        postNewAccount(){
            const data = [
                parseInt(this.customer.customer_id,10),
                this.creditor,
                this.totalAmount,
                this.monthlyAmount,
                this.numberOfPayments,
                this.monthlyPaymentDueDate,
                this.firstAmount,
                this.irregular,
                this.pension,
                this.interest,
                this.bonus,
                this.addition,
                this.commission,
                this.advisoryFee,
                this.accountComment,
                this.bankcode,
                this.branchcode,
                this.kind,
                this.accountNumber,
                this.accountHolder,
                this.summerBonusAmount,
                this.summerBonusDate,
                this.winterBonusAmount,
                this.winterBonusDate
            ]
            this.$axios.post('/api/payment_agency/new_account',data).then(response =>{
                console.log(response)
                if(response.data.errno){
                    return alert('DB Error: \nCode: '+ response.data.code +'\neErrNo: '+ response.data.errno +'\nMes: '+ response.data.sqlMessage)
                }
                this.dialog = false
                alert('登録が終わりました!')
            })
        },
        createPaymentSchedules(index){
            this.createScheduleDialog = true
            const settle = this.contentsOfSettlements[index]
            let schedules =[{paymentAccountId:settle.payment_account_id,amount:settle.first_amount,date:moment(settle.start_date).format('YYYY/MM/DD')}]
            const duedate = settle.monthly_payment_due_date === '末日'? 31 : baseDate.monthly_payment_due_date
            let baseDate = moment(settle.start_date)
            const year = baseDate.year()
            const month = baseDate.month()+1
            let nextDate = moment(year+'/'+month+'/'+duedate).format('YYYY/MM/DD')
            for(let i = 2; i <= settle.number_of_payments; i++){
                nextDate = moment(baseDate).add(i-1,'month').format('YYYY/MM/DD')
                schedules.push(
                    {
                        paymentAccountId:settle.payment_account_id,
                        amount:settle.monthly_amount,
                        date:nextDate
                    }
                )
            }
            console.log(schedules)
            //最終回だけ端数計算して数字を変更する。
            const total = settle.total_amount
            const num = settle.number_of_payments-2
            const subtotal = settle.monthly_amount * num + settle.first_amount
            console.log(subtotal)
            const lastAmount = total - subtotal
            schedules[schedules.length-1].amount = lastAmount
            this.schedules = schedules
        },
        registerPaymentSchedules(){
            //登録して良いかのValidation組む必要があるが、まず  は登録する。最悪あとから編集の方を先に作ればOKのはず。
            // let data = this.schedules.map(ele => [ele.paymentAccountId,ele.amount,ele.date])
            // console.log(data)
            this.$axios.post('api/payment_agency/customer/register_payment_schedules',this.schedules)
            .then(response =>{
                if(response.data.errno){
                    return alert('DB Error: \nCode: '+ response.data.code +'\neErrNo: '+ response.data.errno +'\nMes: '+ response.data.sqlMessage)
                }
                alert('登録が終わりました!')
                const option ={id:this.customer.customer_id,from:null,until:null}
                this.$store.dispatch('pa/getDbPaymentSchedules',option)
            })
        }
    },
    created(){
            this.customer = this.$store.getters['pa/getCustomers'][0]
            this.$store.dispatch('getDbCreditors')
            this.$store.dispatch('pa/getDbCreditorsAccounts')
            this.$store.dispatch('pa/getDbContentsOfSettlements',this.customer.customer_id)
            this.$store.dispatch('pa/getDbCustomerCir',this.customer.customer_id)
                const option ={id:this.customer.customer_id,from:null,until:null}
            this.$store.dispatch('pa/getDbPaymentSchedules',option)
            this.banks = this.$store.getters['pa/getCreditorsAccounts']
    }
}
</script>