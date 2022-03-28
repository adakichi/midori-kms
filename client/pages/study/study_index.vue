<template>
    <v-row>
        <v-col>
            
            <v-row>
                <v-col>
                    <h1><v-icon>mdi-school</v-icon>Study Page</h1>
                    <!-- メニュー -->
                    <v-list nav dense>
                        <v-list-group
                        v-for="item in studyMenuList"
                        :key="item.title"
                        :append-icon="item.lists ? undefined : ''"
                        no-action
                        @click="routerPush(item.to)"
                        >
                        <template v-slot:activator>
                            <v-list-item-icon><v-icon>{{item.icon}}</v-icon></v-list-item-icon>
                            <v-list-item-title>{{item.title}}</v-list-item-title>
                        </template>
                            <v-list-item
                                v-for="list in item.lists"
                                :key="list.title"
                                @click="openSlide({id:list.id,'title':item.title})"
                            >
                                    <v-list-item-icon>
                                        <v-icon>{{list.icon}}</v-icon>
                                    </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>{{list.id}}.{{list.title}}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-group>
                    </v-list>
                </v-col>
                <v-col>
                    <!-- スライド表示部分 -->
                        <slide-view
                            ref="slide"
                          :slide="activeSlide" 
                          :isBtn="true"
                          :min="1"
                          :max="slideData.length"
                          :myNum="activeSlide.id"
                          v-on:clickPrev="prevSlide"
                          v-on:clickNext="nextSlide">
                        </slide-view>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script>
let slides = require('../../assets/data/rookie_slide.json')
console.log(slides)
export default {
    head(){
        return {
            title: 'Study Top',
        }
    },
    data(){
        return{
            activeSlide:{id:1},
            slideData:[],
            studyMenu:[
                {
                    icon:'mdi-folder',
                    title:'入所案内'
                },
                {
                    icon:'mdi-presentation-play',
                    title:'新人用スライド',
                    lists:[{id:'1', title:'単語',to:'~/study/wordList'}]
                },
                {
                    icon:'mdi-presentation-play',
                    title:'交面課',
                },
                {
                    icon:'mdi-presentation-play',
                    title:'調査課',
                },
                {
                    icon:'mdi-book-open-variant',
                    title:'単語リスト',
                    to:'/study/wordList'
                },
                {
                    icon:'mdi-lead-pencil',
                    title:'TEST',
                    to:'/study/test'
                }
            ],
        }
    },
    methods:{
        openSlide(obj){
            switch(obj.title){
                case '調査課':
                    this.slideData = slides.chousa
                    break
                case '新人用スライド':
                    this.slideData = slides.rookie
                    break
            }
            this.$refs.slide.clickOpenBtn()
            this.activeSlide = this.slideData[obj.id -1]
        },
        closeSlideComp(){
            this.slideComp = false
        },
        prevSlide(){
            const id = this.activeSlide.id
            this.activeSlide = this.slideData[id -2]
        },
        nextSlide(){
            const id = this.activeSlide.id
            this.activeSlide = this.slideData[id]
        },
        routerPush(to){
            if(to){
                this.$router.push(to)
            }
        }
    },
    computed:{
        studyMenuList(){
            let menu = this.studyMenu
            menu[1].lists = slides.rookie
            menu[3].lists = slides.chousa
            return menu
        }
    }
};
</script>