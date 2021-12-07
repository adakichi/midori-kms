<template>
    <v-container>
        <h1>come in records</h1>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-spacer></v-spacer>
                <v-btn @click="goImport">インポート</v-btn>
                <v-btn @click="upda">こうしん</v-btn>
                </v-app-bar>
            </v-col>
        </v-row>    
        <v-row>
            <v-col>
                <v-data-table
                :headers="headers"
                :items="comeInRecordsList"
                item-key="come_in_records_id"
                :items-per-page="5"
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
            cirl:[{name:'testtarou'}],
            search:'',
            headers:[
                {
                    text:'id',
                    align:'start',
                    sortable:false,
                    value:'come_in_records_id',
                    groupable:false
                },
                { text:'customer_id', value:'customer_id'},
                { text:'come_in_name', value:'come_in_name'},
                { text:'actual_deposit_amount', value:'actual_deposit_amount', groupable:false},
                { text:'actual_deposit_date', value:'actual_deposit_date'},
                { text:'come_in_schedule_id', value:'come_in_schedule_id', groupable:false},
                { text:'delete_flag', value:'delete_flag'},
                { text:'created_at', value:'created_at'}
            ]
        }
    },
    computed:{
        comeInRecordsList(){
            console.log(this.$store.getters['pa/getCIR'])
            return this.$store.getters['pa/getCIR']
        }
    },
    methods:{
        upda(){
            console.log('upda')
            this.$store.dispatch('pa/actComeInRecords')
        },
        goImport(){
            this.$router.push('/payment_agency/come_in_records/import')
        }
    },  
    created(){
        this.upda()
    }
}
</script>