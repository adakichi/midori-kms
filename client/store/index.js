
export const state = ()=>({
    creditors:[]
})

export const getters = {
    getCreditors(state){
        return state.creditors
    }
}

export const mutations = {
    updateCreditors(state,data){
        state.creditors = data
    }
}

export const actions = {
    //creditors更新
    async getDbCreditors(context){
        const dbResult = await this.$axios.get('api/creditors')
        context.commit('updateCreditors',dbResult.data)
        console.log(dbResult)
    }
}

