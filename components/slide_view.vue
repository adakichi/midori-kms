<template>
    <v-card>
        <v-card-title>
            <h3>{{slide.id}}.{{ slide.title}}</h3>
            <v-spacer></v-spacer>
            <v-btn :disabled="slide.id < 2 ? true : false" @click="clickPrevBtn"><v-icon>mdi-chevron-left</v-icon>PREV</v-btn>
            <v-btn :disabled="slide.id > 7 ? true : false" @click="clickNextBtn">NEXT<v-icon>mdi-chevron-right</v-icon></v-btn>
            <!-- <v-spacer></v-spacer> -->
            <v-card-actions>
                <v-btn @click="clickCloseBtn">
                CLOSE
                <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card-title>
        <v-layout justify-center>
        <div class="slide">
            <iframe v-show="showSlide" :src="slide.src" @load="showSlide = true" frameborder="0" width="640" height="389" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
        </div>
        </v-layout>
    </v-card>
</template>

<script>
export default {
    head(){
        return {
            title: this.slideTitle
        }
    },
    data(){
        return{
            showSlide:true
        }
    },
    methods:{
        clickCloseBtn(){
            this.$emit('clickCloseBtn')
        },
        clickPrevBtn(){
            this.showSlide = false
            this.$emit('clickPrev')
        },
        clickNextBtn(){
            this.showSlide = false
            this.$emit('clickNext')
        }
    },
    props:{
        slide:{
            type:Object
        }
    },
    computed:{
        slideTitle(){
            return this.slide.title
        }
    }
};
</script>

<style scoped>
.slide { 
    width:640px;
    height:395px;
    background-image: url("~assets/img/loading-37-1.gif");
    background-repeat: no-repeat;
    background-position-x: 300px;
    background-position-y: center;
}

</style>