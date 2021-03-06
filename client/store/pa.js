
export const state = ()=>({
    comeInRecords:[],
    comeInSchedules:[],
    customers:[],
    creditorsAccounts:[],
    contentsOfSettlements:[],
    customerCir:[],
    customerCis:[],
    paymentSchedules:[]
})

export const getters = {
    getCIR(state){
        return state.comeInRecords
    },
    getCIS(state){
        return state.comeInSchedules
    },
    getCustomers(state){
        return state.customers
    },
    getCreditorsAccounts(state){
        return state.creditorsAccounts
    },
    getContentsOfSettlements(state){
        return state.contentsOfSettlements
    },
    getCustomerCir(state){
        return state.customerCir
    },
    getCustomerCis(state){
        return state.customerCis
    },
    getPaymentSchedules(state){
        return state.paymentSchedules
    }
}

export const mutations = {
    updateComeInRecords(state,data){
        state.comeInRecords = data
    },
    updateComeInSchedules(state,data){
        state.comeInSchedules = data
    },
    updateCustomers(state,data){
        state.customers = data
    },
    updateCreditorsAccounts(state,data){
        state.creditorsAccounts = data
    },
    updateContentsOfSettlements(state,data){
        state.contentsOfSettlements = data
    },
    updateCustomerCir(state,data){
        state.customerCir = data
    },
    updateCustomerCis(state,data){
        state.customerCis = data
    },
    updatePaymentSchedules(state,data){
        state.paymentSchedules = data
    }
}

export const actions = {
    //come in recordsのindex用　DBから最新情報Get
    async actComeInRecords(context,options){
        const cir = await this.$axios.$get('api/payment_agency/cir/',{params:options})
        console.log('actComeInRecords:',cir)
        context.commit('updateComeInRecords',cir)
    },
    //come in recordsのimport用 銀行データ登録
    //2022.1.17普通にaxiosで直接やりとりすれば良い気がするのでコメントアウトします。
    // async postImportfile(context,newSchedule){
    //     // const data = [newSchedule.customer_id,payment_day, expected_amount]
    //     const dbResult = await this.$axios.post('api/payment_agency/cir',newSchedule)
    //     context.commit('actComeInRecords')
    // },

    //come in schedules用の DB select all用
    async actComeInSchedules(context,option){
        const cis = await this.$axios.$get('api/payment_agency/cis/',{params:option})
        context.commit('updateComeInSchedules',cis)
    },
    //come in schedulesの DB 新規登録用
    async postcomeInSchedules(context,data){
        const dbResult = await this.$axios.post('api/payment_agency/cis',data)
        },

    //customers 用
    //検索
    async searchCustomers(context,data){
        const targetText = data.targetText
        const options = data.options
        const customers = await this.$axios.get('api/payment_agency/customers',{params:{text:targetText,options:options}})
        //errorの場合の処理
        if(customers.data.error){
            alert(customers.data.message)
        } else {
            context.commit('updateCustomers',customers.data)
        }
    },
    //債権者の口座候補リスト
    async getDbCreditorsAccounts(context){
        const creditorsAccounts = await this.$axios.get('api/payment_agency/creditors/accounts/')
        context.commit('updateCreditorsAccounts',creditorsAccounts.data)
    },

    //顧客毎ぺーじ用　債権者の和解リスト
    //債権者の和解リスト
    async getDbContentsOfSettlements(context,id){
        const settlements = await this.$axios.get('api/payment_agency/customer/settlements',{params:{id:id}})
        context.commit('updateContentsOfSettlements',settlements.data)
    },
    //顧客IDでのcome in records取得
    async getDbCustomerCis(context,id){
        const cises = await this.$axios.get('api/payment_agency/customer/cis',{params:{id:id}})
        context.commit('updateCustomerCis',cises.data)
    },
    async getDbPaymentSchedules(context,option){
        const schedules = await this.$axios.get('api/payment_agency/customer/payment_schedules',{
            params:{
                id:option.id,
                from:option.from,
                until:option.until,
                isPaidDate:option.isPaidDate,
                isExpectedDate:option.isExpectedDate,
            }
        })
        context.commit('updatePaymentSchedules',schedules.data)
    },
    
}

