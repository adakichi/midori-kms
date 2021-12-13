
export const state = ()=>({
    comeInRecords:[{text: 'hello'}],
    comeInSchedules:[{text:'hello cis'}]
})

export const getters = {
    getCIR(state){
        return state.comeInRecords
    },
    getCIS(state){
        return state.comeInSchedules
    }
}

export const mutations = {
    updateComeInRecords(state,data){
        state.comeInRecords = data
    },
    updateComeInSchedules(state,data){
        state.comeInSchedules = data
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
        console.log(dbResult)
    },

}

