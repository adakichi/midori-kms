
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
console.log()
export const actions = {
    async actComeInRecords(context){
        const cir = await this.$axios.$get('api/payment_agency/cir/')
            console.log('vuex store:')
        context.commit('updateComeInRecords',cir)
    }
}

