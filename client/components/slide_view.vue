<template>
    <v-dialog
    v-model="isOpen"
    persistent
    width="700"
    >
    <v-card>
        <v-card-title>
            <h3>{{slide.id}}.{{ slide.title}}</h3>
            <v-spacer></v-spacer>
            <v-btn :disabled="isPrevBtn ? false : true" @click="clickPrevBtn"><v-icon>mdi-chevron-left</v-icon>PREV</v-btn>
            <v-btn :disabled="isNextBtn ? false : true" @click="clickNextBtn">NEXT<v-icon>mdi-chevron-right</v-icon></v-btn>
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
    </v-dialog>
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
            isOpen:false,
            showSlide:true
        }
    },
    methods:{
        clickOpenBtn(){
            this.isOpen = true
        },
        clickCloseBtn(){
            this.isOpen = false
        },
        clickPrevBtn(){
            this.myNum = -1 
            this.showSlide = false
            this.$emit('clickPrev')
        },
        clickNextBtn(){
            this.myNum = +1 
            this.showSlide = false
            this.$emit('clickNext')
        }
    },
    props:{
        slide:{
            type:Object,
            default:() => ({
                id:0,
                title:'none',
                src:''
            })
        },
        isBtn:{
            type:Boolean,
            default:() => (false)
        },
        myNum:{
            type:Number
        },
        min:{
            type:Number
        },
        max:{
            type:Number
        }
    },
    computed:{
        slideTitle(){
            return this.slide.title
        },
        isPrevBtn(){
            let result = false
            if(this.isBtn){
               result =  this.myNum <= this.min ? false : true 
            }
            return result
        },
        isNextBtn(){
            let result = false
            if(this.isBtn){
               result =  this.myNum >= this.max ? false : true 
            }
            return result
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