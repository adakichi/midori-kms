export const state = ()=>({
    issues:[]
})

export const mutations = {
    setIssues(state,data){
        return state.issues = data
    }
}

export const getters = {
    getIssues(state){
        return state.issues
    }
}

export const actions = {
    async dbGetIssues(context){
        const response = await this.$axios.get('api/issues/')
        context.commit('setIssues',response.data)    
    }
}