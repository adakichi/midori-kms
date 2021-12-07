<template>
    <v-container>
        <v-row>
            <v-col>
        <h1>掲示板</h1>
        <v-spacer></v-spacer>
        <v-btn @click="switchDialog">新規登録</v-btn>
        </v-col>
        </v-row>
        <v-row>
            <v-col v-for="item in issues" :key="item.issues_id">
                <v-card>
                    <v-card-title>{{item.title}}</v-card-title>
                    <v-card-text>{{item.description}}</v-card-text>
                </v-card>
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
                    <v-btn color="primary" @click="createNew">作成</v-btn>
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
            dialog:false,
            newTitle:'',
            newDescription:''
        }
    },
    methods:{
        switchDialog(){
            this.dialog = !this.dialog
        },
        createNew(){
            const title = this.newTitle
            const description = this.newDescription
            const auth = this.$auth.user ? this.$auth.user.userId : 0
            alert(
                'titel:'+ title+'\n'
                + 'descri: ' + description + '\n'
                + 'author: ' + auth
                )
            this.dialog = !this.dialog
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