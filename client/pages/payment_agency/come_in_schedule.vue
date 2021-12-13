<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>
                        入金予定:Come In Schedules
                    </v-app-bar-title>
                    <v-spacer></v-spacer>
                <v-btn @click="test">test</v-btn>
                <v-btn @click="openNewDialog">新規登録</v-btn>
                </v-app-bar>
            </v-col>
        </v-row>    
        <v-row>
            <v-col>
                <v-data-table
                :headers="headers"
                :items="comeInSchedulesList"
                item-key="come_in_schedules_id"
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
        <v-dialog v-model="newDialog">
            <v-card>
                <v-card-text>
                    <v-row><v-col>
                <v-date-picker v-model="newSchedule.payment_day"></v-date-picker>
                    </v-col>
                    <v-col>
                <v-text-field v-model="newSchedule.customer_id" label="受任番号"></v-text-field>
                <v-text-field v-model="newSchedule.expected_amount" type="number" lable="金額"></v-text-field>
                </v-col></v-row>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="postNewSchedule">登録</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
export default {
    layout : 'pa',
    data(){
        return{
            newDialog:false,
            newSchedule:{
                customer_id:'',
                payment_day:null,
                expected_amount:0
            },
            search:'',
            headers:[
                { text:'customer_id', value:'customer_id'},
                { text:'payment_day', value:'payment_day', groupable:false},
                { text:'expected_amount', value:'expected_amount'},
                { text:'come_in_records_id', value:'come_in_records_id', groupable:false}
            ]
        }
    },
    computed:{
        comeInSchedulesList(){
            return this.$store.getters['pa/getCIS']
        }
    },
    methods:{
        test(){
            console.log(this.comeInSchedulesList[0].payment_day)
        },
        openNewDialog(){
            this.newDialog = true
        },
        postNewSchedule(){
            this.$store.dispatch('pa/postcomeInSchedules',this.newSchedule)
            .then(()=>{
                this.newDialog = false
                this.$store.dispatch('pa/actComeInSchedules')
            })
        }
    },  
    created(){
        this.$store.dispatch('pa/actComeInSchedules')
    }
}
</script>