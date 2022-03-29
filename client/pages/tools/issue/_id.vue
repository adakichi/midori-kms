<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>title: {{issuesData?issuesData.title:'一旦もどってね。'}}</h1>
                <p>{{issuesData?issuesData.description:'直リンクは無効にしてます。'}}</p>
                <v-btn class="mr-1" to="/tools/issues">戻る</v-btn>
                <v-btn class="mr-1" @click="openNewDialog">新規投稿</v-btn>
                <v-switch style="display:inline-block" label="降順" v-model="desc"></v-switch>
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
            </v-col>
        </v-row>
        <v-dialog
        v-model="dialog"
        >
            <v-card>
                <v-card-text class="pa-2">
                    <v-textarea outlined label="text" v-model="editMessage.text"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn v-show="isNew" @click="postIssue">投稿</v-btn>
                    <v-btn v-show="!isNew" @click="updateIssue">更新</v-btn>
                    <v-btn v-show="!isNew" @click="deleteIssue">削除</v-btn>
                </v-card-actions>
            </v-card>
            <v-card>
                <v-divider></v-divider>
                <v-card-title>プレビュー</v-card-title>
                <v-card-text v-html="convMarked(editMessage.text)"></v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
const marked = require('marked')
export default {
    data(){
        return {
            isNew:true,
            dialog:false,
            desc:false,
            rowMessages:[],
            editMessage:{text:'',idx:''}
        }
    },
    methods:{
        update(idx){
            this.dialog = true
            this.editMessage.idx = idx
            this.editMessage.text = this.messages[idx].message
            this.isNew = false
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
        deleteIssue(){
            const doNot = !confirm('本当に削除しますか？')
            if(doNot){ return }
            const doNot2 = !confirm('削除は推奨していません！\n本当に削除しますか？')
            if(doNot2){ return }
            const targetMessage = this.messages[this.editMessage.idx]
            const data = {
                messageId:targetMessage.issues_messages_id,
                issueId:targetMessage.issue_id,
                }
            this.$axios.delete('api/issue',{data:data})
            .then(response=>{
                if(response.data.error){ return alert(response.data.message)}
                alert(response.data)
                alert('一度戻って画面を更新してください。\n万が一間違って削除した場合は、\n今のうちに内容をコピーしておきましょう。')
                this.dialog = false
            })
        },
        convMarked(str){
            return marked.marked(str)
        },
        postIssue(){
            if(this.editMessage.text.length > 1000){ return alert('文字数が多いです。\n1000文字まで。')}
            if(!this.$auth.user){ return alert('ログインしてから送って')}  
            const data = {id:this.issuesData.issue_id, author:this.$auth.user.userId, message:this.editMessage.text}
            this.$store.dispatch('issues/postMessage',data)
            .then(response=>{
                this.dialog = false
            })
        },
        openNewDialog(){
            this.dialog = true
            this.isNew = true
        },
        getMessages(){
            this.rowMessages =  this.$store.getters['issues/getIssueMessages']
        }
    },
    computed:{
        messages(){
            const id = this.$route.params.id
            this.rowMessages = this.$store.getters['issues/getIssueMessages']
            const items = this.rowMessages.slice(0,this.rowMessages.length)
            if(this.desc){
                items.reverse()
            }
            return items
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
        this.getMessages()
    },
    validate({params}){
        return /^\d+$/.test(params.id)
    }
}
</script>