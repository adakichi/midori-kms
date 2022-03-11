<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>掲示板</h1>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
        }
    },
    methods:{
        switchDialog(){
            this.dialog = !this.dialog
        },
    },
    computed:{
    },
    created(){
    }
}
</script>