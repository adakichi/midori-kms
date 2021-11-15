<template>
    <v-container>
        <h1><v-icon>mdi-tools</v-icon>Tools</h1>
    <v-row>
        <v-col>
            <v-card>
                <v-card-title>
                    <v-avatar><v-icon>mdi-phone</v-icon></v-avatar>
                    内線表</v-card-title>
                <v-card-text>クリックで発信できる、BIZTEL用の内線表</v-card-text>
                <v-divider></v-divider>
                <v-card-actions><v-btn @click="routerPush('/tools/workReport')">
                OPEN
                </v-btn></v-card-actions>
            </v-card>
        </v-col>
        <v-col>
            <v-card>
                <v-card-title>
                    <v-avatar><v-icon>mdi-clipboard-account-outline</v-icon></v-avatar>
                    業務報告</v-card-title>
                <v-card-text>Chatwork宛の業務報告書</v-card-text>
                <v-divider></v-divider>
                <v-card-actions><v-btn @click="routerPush('/tools/workReport')">
                OPEN
                </v-btn></v-card-actions>
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
        routerPush(path){
            this.$router.push(path)
        }
    }
}
</script>