<template>
    <v-container>
                <h1>代行支払い</h1>
        <v-row>
            <v-col v-for="(menu,index) in menus" :key="index">
                <v-card color="grey darken-3" :to="menu.to" min-width="200" height="150">
                        <v-card-title>
                            {{menu.title}}
                        </v-card-title>
                        <v-divider></v-divider>
                    <v-card-text>{{menu.description}}</v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col v-for="(menu,index) in menus" :key="index" sm="6" md="4" lg="3" xl="1">
                <menu-card :item="menu" :mWidth="200"></menu-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import menu_card from '~/components/menu_card.vue'
export default {
  components: { menu_card },
    layout : 'pa',
    data(){
        return{
            menus:[
                {
                    title:'入金実績',
                    description:'銀行の入金読込＆予定との紐づけ',
                    to:'/payment_agency/come_in_records/'
                },
                {
                    title:'入金予定',
                    description:'入金予定一覧表示＆新規入金予定作成',
                    to:'/payment_agency/come_in_schedules/'
                },
                {
                    title:'出金予定',
                    description:'出金予定作成＆銀行読込データ作成',
                    to:'/payment_agency/put_out_records/'
                },
                {
                    title:'顧客ページ',
                    description:'顧客毎のページ',
                    to:'/payment_agency/customers/'
                },
                {
                    title:'仕訳帳',
                    description:'仕訳帳のページ',
                    to:'/payment_agency/journal_book/'
                },
                {
                    title:'設定',
                    description:'設定のページ',
                    to:'/payment_agency/config/'
                }
            ]
        }
    }
}
</script>