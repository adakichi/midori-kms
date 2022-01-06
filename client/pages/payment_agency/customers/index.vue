<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>Customers</v-app-bar-title>
                </v-app-bar>
                <v-app-bar>
                    <v-radio-group v-model="searchType" mandatory row>
                        <v-radio label="受任番号"   value="jyunin"></v-radio>
                        <v-radio label="名前"       value="namae"></v-radio>
                        <v-radio label="LU"         value="lu"></v-radio>
                        <v-radio label="全表示"         value="all"></v-radio>
                    </v-radio-group>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="targetText" label="search" @keydown.enter="searchCustomer"></v-text-field>
                    <v-btn @click="searchCustomer">検索</v-btn>
                </v-app-bar>
                <v-data-table
                v-show="customers[0]"
                :headers="headers"
                :items="customers"
                item-key="customer_id"
                :items-per-page="10"
                class="elevation-1"
                :search="search"
                show-select
                show-group-by
                dense
                @click:row="goCustomerPage"
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
                <v-row v-show="!customers[0]"><v-col>
                <v-sheet class="text-center" color="grey darken-3">該当無し</v-sheet>
                </v-col></v-row>
    </v-container>
</template>

<script>
export default {
    layout : 'pa',
    data(){
        return{
            targetText:'',
            search:'',
            searchType:'namae',
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
            const options = {
                "searchType":this.searchType,
            }
            this.$store.dispatch('pa/searchCustomers',{targetText:this.targetText,options:options})
            .then(()=>{if(this.customers.length === 1){
                this.$router.push('/payment_agency/customers/'+ Number(this.customers[0].customer_id))
            }})
        },
        goCustomerPage(e){
                this.$router.push('/payment_agency/customers/'+ Number(e.customer_id))
        }
    }
}
</script>