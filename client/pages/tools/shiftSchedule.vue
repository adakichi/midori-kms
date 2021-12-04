<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>シフト表</h1>
                <v-data-table
                    :headers="headers"
                    :items="shifts"
                >
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-simple-table>
                    <thead>
                        <tr>
                            <th v-for="{day,key} in days" :key="key">{{day}}</th>
                        </tr>
                    </thead>

                </v-simple-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
const calender = ()=>{
    let days = []
    for(i = 1;i<=31;i++){
        days.push({text:i,t})
    }
}
export default {
    data(){
        return {
            headers:[
                {
                    text:'名前',
                    value:'name'
                },
                { text:'所属',value:'division'},
                { text:'1',}
            ],
            shifts:[
                {name:'adati',division:'完了'}
            ]
        }
    },
    methods:{
        async getholiday(){
            return await axios.get('https://holidays-jp.github.io/api/v1/date.json')
        }
    },
    computed:{
        days(){

        }
    }
}
</script>