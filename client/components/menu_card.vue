<template>
    <v-card color="accent" :min-width="mWidth" :height="height" @click="routerPush(item.to)">
        <v-card-title>
            <v-avatar v-if="item.icon"><v-icon>{{item.icon}}</v-icon></v-avatar>
            {{item.title}}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="white--text">{{item.description}}</v-card-text>
    </v-card>
</template>

<script>
export default {
    props:{
        item:{
            type:Object
        },
        mWidth:{
            type:Number,
            default:200
        },
        height:{
            type:Number,
            default:200
        }
    },
    methods:{
        routerPush(path){
            this.$router.push(path)
        }
    }
}
</script>