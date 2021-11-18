<template>
            <v-card color="accent">
                <v-card-title>
                    <v-avatar><v-icon>{{item.icon}}</v-icon></v-avatar>
                    {{item.title}}</v-card-title>
                <v-card-text class="white--text">{{item.description}}</v-card-text>
                <v-divider></v-divider>
                <v-card-actions><v-btn color="secondary" @click="routerPush(item.to)">
                OPEN
                </v-btn></v-card-actions>
            </v-card>

</template>

<script>
export default {
    props:{
        item:{
            type:Object
        }
    },
    methods:{
        routerPush(path){
            this.$router.push(path)
        }
    }
}
</script>