export const state = ()=>({
    issues:[],
    issueMessages:[]
})

export const mutations = {
    setIssues(state,data){
        return state.issues = data
    },
    //issue Messages用
    setIssueMessages(state,data){
        return state.issueMessages = data
    }
}

export const getters = {
    getIssues(state){
        return state.issues
    },
    //issue Messages用
    getIssueMessages(state){
        return state.issueMessages
    }
}

export const actions = {
    async dbGetIssues(context){
        const response = await this.$axios.get('api/issues/')
        context.commit('setIssues',response.data)    
    },
    async dbCreateNewIssue(context,data){
        const response = await this.$axios.post('api/issues/',data)
        context.dispatch('dbGetIssues')
    },

    //issue Messages用
    async dbGetIssueMessages(context,issueId){
        const response = await this.$axios.get('api/issue/', {params:{id:issueId}})
        context.commit('setIssueMessages',response.data)    
    },
    async postMessage(context,data){
        console.log('action postmessage')
        const response = await this.$axios.post('api/issue/',data)
        console.log(response)
        context.dispatch('dbGetIssueMessages',data.id)
    },
    async updateMessage(context,data){
        console.log('action updatemessage')
        const response = await this.$axios.put('api/issue/',data)
        console.log(response)
        context.dispatch('dbGetIssueMessages',data.issueId)
    }
}