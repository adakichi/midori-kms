<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>title: {{issuesData?issuesData.title:'一旦もどってね。'}}</h1>
                <p>{{issuesData?issuesData.description:'直リンクは無効にしてます。'}}</p>
                <v-btn to="/tools/issues">戻る</v-btn>
                <v-row v-for="item in messages" :key="item.issues_messages_id"><v-col>
                <v-card>
                    <v-card-subtitle>{{item.name}} : {{item.created_at}}</v-card-subtitle>
                    <v-divider></v-divider>
                    <v-card-text v-html="convMarked(item.message)"></v-card-text>
                </v-card>
                </v-col></v-row>
                <v-textarea counter v-model="newMessage"></v-textarea>
                <v-btn @click="sendMessage">投稿</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
const marked = require('marked')
export default {
    data(){
        return {
            newMessage:''
        }
    },
    methods:{
        convMarked(str){
            return marked.marked(str)
        },
        sendMessage(){
            if(this.newMessage.length > 1000){ return alert('文字数が多いです。\n1000文字まで。')}
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
        if(this.$store.getters['issues/getIssues']){
            this.$store.dispatch('issues/dbGetIssues')
        }
    },
    validate({params}){
        return /^\d+$/.test(params.id)
    }
}
</script>