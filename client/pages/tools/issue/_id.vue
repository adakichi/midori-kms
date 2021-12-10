<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>title: {{issuesData?issuesData.title:'一旦もどってね。'}}</h1>
                <p>{{issuesData?issuesData.description:'直リンクは無効にしてます。'}}</p>
                <v-btn to="/tools/issues">戻る</v-btn>
                <v-row v-for="(item, index) in messages" :key="index"><v-col>
                <v-card>
                    <v-toolbar dense elevation=0 >
                        <v-card-subtitle>{{item.name}} : {{item.created_at}}</v-card-subtitle>
                        <v-spacer></v-spacer>
                        <v-btn @click="update(index)">編集</v-btn>
                    </v-toolbar>
                    <v-card-text v-html="convMarked(item.message)"></v-card-text>
                </v-card>
                </v-col></v-row>
                <v-textarea counter v-model="newMessage"></v-textarea>
                <v-btn @click="sendMessage">投稿</v-btn>
            </v-col>
        </v-row>
        <v-dialog
        v-model="dialog"
        >
            <v-card>
                <v-card-text>
                    <v-textarea v-model="editMessage.text"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="updateIssue">更新</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
const marked = require('marked')
export default {
    data(){
        return {
            newMessage:'',
            dialog:false,
            editMessage:{text:'',idx:''}
        }
    },
    methods:{
        update(idx){
            this.dialog = true
            this.editMessage.idx = idx
            this.editMessage.text = this.messages[idx].message
        },
        updateIssue(){
            const targetMessage = this.messages[this.editMessage.idx]
            if(!this.$auth.user){ return alert('ログインしてから送って')}
            if(this.$auth.user.userId !== targetMessage.author){ return alert('ほかの人のは編集できません')}
            if(this.editMessage.text.length > 1000){ return alert('文字数が多いです。\n1000文字まで。')}
            const data = {
                messageId:targetMessage.issues_messages_id,
                issueId:targetMessage.issue_id,
                message:this.editMessage.text
                }
            this.dialog = false
            return this.$store.dispatch('issues/updateMessage',data)
        },
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