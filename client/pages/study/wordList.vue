<template>
    <v-container fluid grid-list>
            <v-list nav>
                <v-row>
                    <v-col cols=12 sm=12 md=6 lg=6 v-for="item in menulist" :key="item.title">
                        <v-card>
                            <v-app-bar color="accent">
                                {{item.title}}
                                <v-card-subtitle>{{item.yomi}}</v-card-subtitle>
                            </v-app-bar>
                            <v-card-text>{{item.explain}}</v-card-text>
                            <v-chip-group v-for="tag in item.tag" :key="tag">
                                <v-spacer></v-spacer>
                                <v-chip x-small :color="tagcolor(tag)">{{tag}}</v-chip>
                            </v-chip-group>
                        </v-card>
                    </v-col>
                </v-row>
            </v-list>
    </v-container>
</template>

<script>
const tangojson = require('~/assets/data/tangoList')
export default {
    data(){
        return {
            menulist:tangojson.tangoList
        }
    },
    methods:{
        tagcolor(tag){
            let color = ''
            switch(tag){
                case '全般,':
                    color = 'primary'
                    break
                case '過払い,':
                    color = 'blue'
                    break
                case '任意,':
                    color = 'orange'
                    break
                case 'みどり,':
                    color = 'green'
                    break
                case '主な電話,':
                    color = 'pink'
                    break
                
            }
            return color
        }
    }
}
</script>