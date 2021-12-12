
export const state = ()=>({
    comeInRecords:[{text: 'hello'}]
})

export const getters = {
    getCIR(state){
        return state.comeInRecords
    }
}

export const mutations = {
    updateComeInRecords(state,data){
        console.log('vuex store:mutetions')
        state.comeInRecords = data
    }
}

export const actions = {
    //come in recordsのindex用　DBから最新情報Get
    async actComeInRecords(context){
        const cir = await this.$axios.$get('api/payment_agency/cir/')
            console.log('vuex store:')
        context.commit('updateComeInRecords',cir)
    },
    //come in recordsのimport用 銀行データ登録
    async postImportfile(context,{fileinfo,data}){
        const dbResult = await this.$axios.post('api/payment_agency/cir',{fileinfo,data})
        console.log(dbResult)
    }
}

