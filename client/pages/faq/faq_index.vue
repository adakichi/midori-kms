<template>
    <div>
        <h1><v-icon>mdi-help</v-icon>FAQ</h1>
        <v-row>
            <v-col
            v-for="item in bcp"
            :key="item.title"
            >
                <v-card>
                <v-card-title>{{item.title}}</v-card-title>
                <v-card-text>{{item.text}}</v-card-text>
                <v-card-actions>
                    <v-btn @click="openSlide(item)">SLIDE</v-btn>
                </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        <slide-view ref="slide" :slide="activeSlide"></slide-view>
    </div>
</template>

<script>
import slide_view from '~/components/slide_view.vue';
const bcpJson = require('../../assets/data/bcp.json')
const arrBcp = bcpJson.bcp
console.log(arrBcp)
export default {
  components: { slide_view },
    head(){
        return {
            title: 'FAQ Top',
        }
    },
    data(){
        return {
            bcp: arrBcp,
            activeSlide:{}
        }
    },
    methods:{
        openSlide(slideData){
            const slide = {
                title:slideData.title,
                src:slideData.src
            }
            this.activeSlide = slide
            this.$refs.slide.clickOpenBtn()
        }
    }
};
</script>