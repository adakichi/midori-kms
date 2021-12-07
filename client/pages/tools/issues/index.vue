<template>
    <v-container>
        <h1>掲示板</h1>
        <v-row>
            <v-col v-for="item in issues" :key="item.issues_id">
                <v-card>
                    <v-card-title>{{item.title}}</v-card-title>
                    <v-card-text>{{item.description}}</v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
        }
    },
    methods:{
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