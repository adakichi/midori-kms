<template>
    <v-container>
        <h1><v-icon>mdi-tools</v-icon>Tools</h1>
    <v-row>
        <v-col
        v-for="item in cards"
        :key="item.title">
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