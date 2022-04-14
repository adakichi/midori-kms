<template>
    <v-container>
        <h1><v-icon>mdi-tools</v-icon>Tools</h1>
    <v-row>
        <v-col
        sm="6" md="4" lg="3" xl="1"
        v-for="item in cards"
        :key="item.title"
        >
            <menu-card :item="item"></menu-card>
        </v-col>
    </v-row>
    </v-container>
</template>

<script>
import menu_card from '~/components/menu_card.vue'
export default {
  components: { menu_card },
    data(){
        return {
            cards:[
                {
                    title:"内線表",
                    to:"/tools/phoneList",
                    description:"クリックで発信できる、BIZTEL用の内線表",
                    icon:"mdi-phone"  
                },
                {
                    title:"業務報告書",
                    to:"/tools/workReport",
                    description:"Chatwork宛の業務報告書",
                    icon:"mdi-clipboard-account-outline"
                },
                {
                    title:"問題解決掲示板",
                    to:"/tools/issues",
                    description:"問題提起等の掲示板",
                    icon:"mdi-forum"
                },
                {
                    title:"債権者wiki",
                    to:"/tools/creditors_wiki",
                    description:"債権者情報",
                    icon:"mdi-wikipedia"
                },
                {
                    title:"組織図",
                    to:"/tools/organization_chart",
                    description:"組織図",
                    icon:"mdi-family-tree"
                }
            ],
            item:{title:"tesuto", to:"to",description:"せつめい", icon:"mdi-phone"}
        }
    },
    methods:{
        routerPush(path){
            this.$router.push(path)
        }
    }
}
</script>