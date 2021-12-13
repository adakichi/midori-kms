<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>Customers</v-app-bar-title>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="targetText" label="search"></v-text-field>
                    <v-btn @click="searchCustomer">検索</v-btn>
                </v-app-bar>
                <v-data-table
                :headers="headers"
                :items="customers"
                item-key="customer_id"
                :items-per-page="10"
                class="elevation-1"
                :search="search"
                show-select
                show-group-by
                dense
                >
                <template v-slot:top>
                <v-text-field
                v-model="search"
                label="Search(まだうごかんばい)"
                class="mx-4"
                >
                </v-text-field>
                </template>
                    <template v-slot:item.delete_flag="{item}">
                        <v-simple-checkbox
                        v-model="item.delete_flag === 0 ?false:true"
                        disabled
                        >
                        </v-simple-checkbox>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    layout : 'pa',
    data(){
        return{
            targetText:'',
            search:'',
            headers:[
                { text:'customer_id', value:'customer_id'},
                { text:'name', value:'name'}
            ]
        }
    },
    computed:{
        customers(){
            return this.$store.getters['pa/getCustomers']
        }
    },
    methods:{
        searchCustomer(){
            this.$store.dispatch('pa/searchCustomers',this.targetText)
        }
    }
}
</script>