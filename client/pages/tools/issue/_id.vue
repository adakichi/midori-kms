<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>title: {{issuesData.title}}</h1>
                <p>{{issuesData.description}}</p>
                <v-btn to="/tools/issues">戻る</v-btn>
                <v-row v-for="item in messages" :key="item.issues_messages_id"><v-col>
                <v-card>
                    <v-card-subtitle>{{item.name}} : {{item.created_at}}</v-card-subtitle>
                    <v-divider></v-divider>
                    <v-card-text>{{item.message}}</v-card-text>
                </v-card>
                </v-col></v-row>
                <v-textarea counter v-model="newMessage"></v-textarea>
                <v-btn @click="sendMessage">投稿</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
            newMessage:''
        }
    },
    methods:{
        sendMessage(){
            if(this.newMessage.length > 300){ return alert('文字数が多いです。\n300文字まで。')}
            if(!this.$auth.user){ return alert('ログインしてから送って')}            
            const data = {id:this.issuesData.issue_id, author:this.$auth.user.userId, message:this.newMessage}
            console.log('おくるよ')
            console.log(data)
            return this.$store.dispatch('issues/postMessage',data)
        }
    },
    computed:{
        messages(){
            const id = this.$route.params.id
            return this.$store.getters['issues/getIssueMessages']
        },
        issuesData(){
            const issues = this.$store.getters['issues/getIssues']
            const id = this.$route.params.id
            let result = issues.filter((el)=>{
                return (el.issue_id == id)
            })
            return result[0]
        }
    },
    created(){
        const id = this.$route.params.id
        this.$store.dispatch('issues/dbGetIssueMessages',id)
    },
    validate({params}){
        return /^\d+$/.test(params.id)
    }
}
</script>