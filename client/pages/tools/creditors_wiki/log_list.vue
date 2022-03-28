<template>
    <v-container>
        <v-row>
            <v-col>
                <v-btn to="./" nuxt>戻る</v-btn>
                <v-app-bar>
                        <v-text-field
                        v-model="filter"
                        label="フィルター"
                        class="mx-4"
                        >
                        </v-text-field>
                    <v-spacer></v-spacer>
                    <v-btn >検索<v-icon>mdi-magnify</v-icon></v-btn>
                </v-app-bar>
                <v-data-table
                :items="logs"
                :headers="logsHeaders"
                :search="filter"
                >
                </v-data-table>
                        <v-snackbar
                          v-model="snack"
                          :timeout="3000"
                          :color="snackColor"
                        >
                          {{ snackText }}
                          <template v-slot:action="{ attrs }">
                            <v-btn
                              v-bind="attrs"
                              text
                              @click="snack = false"
                            >
                              Close
                            </v-btn>
                          </template>
                        </v-snackbar>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data(){
        return{
            logs:[],
            filter:'',
            editDialogMemo:false,
            //snackBar
            snack:false,
            snackColor:'sucess',
            snackText:'',
            ////▲▲▲▲▲▲▲▲▲▲▲▲▲//////
            logsHeaders:[
                { text:'日付',  value:'date'},
                { text:'債権者',  value:'name'},
                { text:'メモ',  value:'memo'},
                { text:'編集者',  value:'editer'},
            ]
        }
    },
    methods:{
        getLogs(){
            this.$axios.get('api/mkms/creditors/changeLog/all',{params:{id:0}})
            .then(response=>{
                if(response.data.error){ return alert(response.data.message)}
                console.log(response.data)
                this.logs = response.data
            })
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
        },
        search(){

        }
    },
    created(){
        this.getLogs()
    }
}
</script>