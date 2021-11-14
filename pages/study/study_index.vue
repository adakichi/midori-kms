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
                        >
                        <template v-slot:activator>
                            <v-list-item-icon><v-icon>{{item.icon}}</v-icon></v-list-item-icon>
                            <v-list-item-title>{{item.title}}</v-list-item-title>
                        </template>
                            <v-list-item
                                v-for="list in item.lists"
                                :key="list.title"
                                @click="openSlide(list.id)"
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
                          :max="8"
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
            studyMenu:[
                {
                    icon:'mdi-folder',
                    title:'入所案内',
                    lists:[]
                },
                {
                    icon:'mdi-folder',
                    title:'新人',
                    lists:[]
                },
                {
                    icon:'mdi-folder',
                    title:'交面',
                },
                {
                    icon:'mdi-folder',
                    title:'TEST',
                    to:'/study/slide_view'
                }
            ],
        }
    },
    methods:{
        openSlide(id){
            this.$refs.slide.clickOpenBtn()
             this.activeSlide = this.slideData[id -1]
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
        }
    },
    computed:{
        slideData(){
            return slides.rookie
        },
        studyMenuList(){
            let menu = this.studyMenu
            menu[1].lists = this.slideData
            return menu
        }
    }
};
</script>