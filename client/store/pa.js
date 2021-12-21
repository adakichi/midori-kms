
export const state = ()=>({
    comeInRecords:[],
    comeInSchedules:[],
    customers:[],
    creditorsAccounts:[],
    contentsOfSettlements:[]
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
    }
}

export const actions = {
    //come in recordsのindex用　DBから最新情報Get
    async actComeInRecords(context){
        const cir = await this.$axios.$get('api/payment_agency/cir/')
        context.commit('updateComeInRecords',cir)
    },
    //come in recordsのimport用 銀行データ登録
    async postImportfile(context,{newSchedule}){
        const data = [newSchedule.customerId,payment_day, expected_amount]
        const dbResult = await this.$axios.post('api/payment_agency/cir',data)
        console.log(dbResult)
    },

    //come in schedules用の DB select all用
    async actComeInSchedules(context){
        const cis = await this.$axios.$get('api/payment_agency/cis/')
        console.log(cis)
        context.commit('updateComeInSchedules',cis)
    },
    //come in schedulesの DB 新規登録用
    async postcomeInSchedules(context,data){
        const dbResult = await this.$axios.post('api/payment_agency/cis',data)
    },

    //customers 用
    //検索
    async searchCustomers(context,targetText){
        const customers = await this.$axios.get('api/payment_agency/customers',{
            params:{
                text:targetText
            }
        })
        context.commit('updateCustomers',customers.data)
    },
    //債権者の口座候補リスト
    async getDbCreditorsAccounts(context){
        const creditorsAccounts = await this.$axios.get('api/creditors_accounts/')
        context.commit('updateCreditorsAccounts',creditorsAccounts.data)
    },

    //債権者の和解リスト
    async getDbContentsOfSettlements(context,id){
        console.log('getDbcontents of settlements' + id)
        const settlements = await this.$axios.get('api/payment_agency/settlements',{params:{id:id}})
        console.log(settlements)
        context.commit('updateContentsOfSettlements',settlements.data)
    }
}

