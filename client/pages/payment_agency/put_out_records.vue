<template>
    <v-container>
        {{selected}}
        <v-row>
            <v-col>
                <h1>Put Out record</h1>
                <v-data-table
                :headers="headers"
                :items="paymentSchedules"
                :items-per-page="50"
                item-key="payment_schedule_id"
                show-select
                show-group-by
                v-model="selected"
                >
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
            selected:[],
            headers:[
                {text:'名前',   value:'name'},
                {text:'日付',   value:'date'},
                {text:'金額',   value:'amount',  groupable:false},
                {text:'確定',   value:'paid_date'},
                {text:'予定',   value:'expected_date'}
            ]
        }
    },
    computed:{
        paymentSchedules(){
            return this.arr = this.$store.getters['pa/getPaymentSchedules']
        }
    },
    created(){
        this.$store.dispatch('pa/getDbPaymentSchedules',0)
    }
}
</script>