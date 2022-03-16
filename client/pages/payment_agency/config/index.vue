<template>
    <v-container>
                <h1>設定</h1>
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
    </v-container>
</template>

<script>
export default {
    layout : 'pa',
    data(){
        return{
            menus:[
                {
                    title:'返済口座マスタ',
                    description:'返済口座の選択肢登録',
                    to:'/payment_agency/config/creditors_accounts'
                },
            ]
        }
    }
}
</script>