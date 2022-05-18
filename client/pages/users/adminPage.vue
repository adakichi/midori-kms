<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-subtitle>
                        <v-text-field label="Search" v-model="searchText"></v-text-field>
                    </v-card-subtitle>
                    <v-card-text>
                        <v-data-table
                        :items="users"
                        item-key="id"
                        :headers="usersHeaders"
                        :search="searchText"
                        show-group-by
                        >
                            <!-- name -->
                            <template v-slot:item.name="props">
                                <v-edit-dialog
                                  :return-value.sync="props.item.name"
                                  @save="save(props)"
                                  @cancel=""
                                  @open=""
                                  @close=""
                                  large
                                >
                                  {{ props.item.name }}
                                    <template v-slot:input>
                                        <v-text-field
                                          v-model="props.item.name"
                                          label="Edit"
                                          single-line
                                        ></v-text-field>
                                      </template>
                                </v-edit-dialog>
                          </template>

                            <!-- kana -->
                            <template v-slot:item.kana="props">
                                <v-edit-dialog
                                  :return-value.sync="props.item.kana"
                                  @save="save(props)"
                                  @cancel=""
                                  @open=""
                                  @close=""
                                  large
                                >
                                  {{ props.item.kana }}
                                    <template v-slot:input>
                                        <v-text-field
                                          v-model="props.item.kana"
                                          label="Edit"
                                          single-line
                                        ></v-text-field>
                                      </template>
                                </v-edit-dialog>
                          </template>

                            <!-- BIZTEL -->
                            <template v-slot:item.biztel_id="props">
                                <v-edit-dialog
                                  :return-value.sync="props.item.biztel_id"
                                  @save="save(props)"
                                  @cancel=""
                                  @open=""
                                  @close=""
                                  large
                                >
                                  {{ props.item.biztel_id }}
                                    <template v-slot:input>
                                        <v-text-field
                                        type="number"
                                          v-model="props.item.biztel_id"
                                          label="Edit"
                                          single-line
                                        ></v-text-field>
                                      </template>
                                </v-edit-dialog>
                          </template>


                            <!-- 所属 -->
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

                            <!-- 役職 -->
                            <template v-slot:item.position="props">
                                <v-edit-dialog
                                  :return-value.sync="props.item.position"
                                  @save="save(props)"
                                  @cancel=""
                                  @open=""
                                  @close=""
                                  large
                                >
                                  {{ props.item.position }}
                                    <template v-slot:input>
                                        <v-select
                                          :items="positions"
                                          v-model="props.item.position"
                                          :value="props.item.position"
                                          label="Edit"
                                          single-line
                                          counter
                                        ></v-select>
                                      </template>
                                </v-edit-dialog>
                          </template>

                            <!-- 管理者 -->
                            <template v-slot:item.admin="{item}">
                                <v-simple-checkbox
                                v-model="item.admin === 0 ? false : true "
                                disabled
                                >
                                </v-simple-checkbox>
                            </template>

                            <!-- cw_dazou_room_id -->
                            <template v-slot:item.cw_dazou_room_id="props">
                                <v-edit-dialog
                                  :return-value.sync="props.item.cw_dazou_room_id"
                                  @save="save(props)"
                                  @cancel=""
                                  @open=""
                                  @close=""
                                  large
                                >
                                  {{ props.item.cw_dazou_room_id }}
                                    <template v-slot:input>
                                        <v-text-field
                                          v-model="props.item.cw_dazou_room_id"
                                          label="Edit"
                                          single-line
                                        ></v-text-field>
                                      </template>
                                </v-edit-dialog>
                          </template>

                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <!-- スナックバー -->
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
    </v-container>
</template>

<script>
export default {
    data(){
        return {
            users:[],
            isDialog:false,
            searchText:'',
            divisions:['新規(過払い)','新規(WEB相続)','調査','中決','交面','破産','交渉','完了','カスタマー','債務整理','相続','札幌','名古屋','岡山','広島','松山','高知','熊本','無所属'],
            positions:['SL','L','SM','M','D'],
            usersHeaders:[
                {text:'ID', value:'user_id'},
                {text:'氏名', value:'name'},
                {text:'カナ', value:'kana'},
                {text:'BIZTEL', value:'biztel_id'},
                {text:'管理者', value:'admin'},
                {text:'所属', value:'division'},
                {text:'役職', value:'position'},
                {text:'最終ログイン', value:'last_login'},
                {text:'最終ログアウト', value:'last_logout'},
                {text:'DA room id', value:'cw_dazou_room_id'},
                {text:'編集', value:'action'},
            ],
            //snackbar
            snack:'',
            snackColor:'',
            snackText:'',
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
            if(response.data.error){return this.popupSnackBar(response.data.message,'warning')}
            this.popupSnackBar(response.data)
              console.log(response)
          })
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
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