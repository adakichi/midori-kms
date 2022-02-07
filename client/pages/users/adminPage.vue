<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text>
                        <v-data-table
                        :items="users"
                        item-key="id"
                        :headers="usersHeaders"
                        >
                            <template v-slot:item.division="props">
                                <v-edit-dialog
                                  :return-value.sync="props.item.division"
                                  @save="save(props)"
                                  @cancel=""
                                  @open=""
                                  @close=""
                                  large
                                >
                                  {{ props.item.division }}
                                    <template v-slot:input>
                                        <v-select
                                          :items="divisions"
                                          v-model="props.item.division"
                                          :value="props.item.division"
                                          label="Edit"
                                          single-line
                                          counter
                                        ></v-select>
                                      </template>
                                </v-edit-dialog>
                          </template>
                            <template v-slot:item.admin="{item}">
                                <v-simple-checkbox
                                v-model="item.admin === 0 ? false : true "
                                disabled
                                >
                                </v-simple-checkbox>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
            users:[],
            isDialog:false,
            divisions:['新規','調査','中決','交面','交渉','完了','債務整理','無所属'],
            usersHeaders:[
                {text:'ID', value:'user_id'},
                {text:'氏名', value:'name'},
                {text:'管理者', value:'admin'},
                {text:'所属', value:'division'},
                {text:'編集', value:'action'},
            ]
        }
    },
    computed:{
        openDialog(){
            this.isDialog = true
        },
    },
    methods:{
        save(props){
        this.$axios.put('/api/auth/user/editUser',props.item)
        .then(response => {
            console.log(response)
        })
        },
    },
    created(){
        this.$axios.get('/api/auth/user/allUsers')
        .then(response => {
            console.log(response)
            this.users = response.data
        })
    }
}
</script>