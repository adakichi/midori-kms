<template>
    <v-container>
        <v-row>
            <v-col>
        <h1>掲示板</h1>
        <v-breadcrumbs></v-breadcrumbs>
        <v-spacer></v-spacer>
        <v-btn @click="switchDialog">新規登録</v-btn>
        </v-col>
        </v-row>
        <v-row>
            <v-col v-for="item in issues" :key="item.issues_id">
                <v-badge content="New" overlap offset-x="30">
                <v-card>
                    <v-row>
                        <v-col>
                            <v-card-title>{{item.title}}</v-card-title>
                            <v-card-text>{{item.description}}</v-card-text>
                            <v-card-actions>
                                <v-btn color="primary" @click="editTitle(item)">編集</v-btn>
                                <v-btn :to="'/tools/issue/' + item.issue_id">Go issues</v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-card>
                </v-badge>
            </v-col>
        </v-row>
        <v-dialog
        v-model="dialog"
        width="400"
        >
        <v-card color="info">
            <v-card-text>
                <v-text-field
                label="タイトル"
                v-model="newTitle"
                ></v-text-field>
                <v-textarea
                label="説明文"
                v-model="newDescription"
                ></v-textarea>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn v-show="isNew" color="primary" @click="createNew">作成</v-btn>
                    <v-btn v-show="!isNew" color="primary" @click="updateNew">更新</v-btn>
                </v-card-actions>
            </v-card-text>
        </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
            isNew:true,
            dialog:false,
            newTitle:'',
            newDescription:'',
            editIssueId:0
        }
    },
    methods:{
        switchDialog(){
            this.dialog = !this.dialog
            this.isNew = true
        },
        createNew(){
            const title = this.newTitle
            const description = this.newDescription
            const author = this.$auth.user ? this.$auth.user.userId : 0
            this.dialog = !this.dialog
            const data = {
                title: title,
                description:description,
                author: author                
            }
            this.$store.dispatch('issues/dbCreateNewIssue',{data})
        },
        editTitle(item){
            this.dialog = !this.dialog
            this.newTitle = item.title
            this.newDescription = item.description
            this.editIssueId = item.issue_id
            this.isNew = false
        },
        updateNew(){
            const data = {
                title: this.newTitle,
                description:this.newDescription,
                Id:this.editIssueId
            }
            this.$axios.put('api/issues',{data:data})
            .then(response=>{
                if(response.data.error){return alert(response.data.message)}
                alert(response.data)
                this.dialog = false
            })
        }
    },
    computed:{
        issues(){
            return this.$store.getters['issues/getIssues']
        }
    },
    created(){
        this.$store.dispatch('issues/dbGetIssues')
    }
}
</script>