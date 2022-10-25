<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                  <v-card-title>
                        <v-spacer/>
                        <v-radio-group v-model="searchType" row>
                          <v-radio 
                            label="all"
                            value="all"></v-radio>
                          <v-radio 
                            label="雇用中"
                            value="continuation"></v-radio>
                          <v-radio 
                            label="退職者"
                            value="retiree"></v-radio>
                        </v-radio-group>
                    <v-btn @click="getUsers()">再表示</v-btn>
                  </v-card-title>
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

                            <!-- 司法書士 -->
                            <template v-slot:item.judicial_scrivener="{item}">
                                <v-simple-checkbox
                                v-model="item.judicial_scrivener === 0 ? false : true "
                                disabled
                                >
                                </v-simple-checkbox>
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

                            <!-- cw_to_id -->
                            <template v-slot:item.cw_to_id="props">
                                <v-edit-dialog
                                  :return-value.sync="props.item.cw_to_id"
                                  @save="save(props)"
                                  @cancel=""
                                  @open=""
                                  @close=""
                                  large
                                >
                                  {{ props.item.cw_to_id }}
                                    <template v-slot:input>
                                        <v-text-field
                                          v-model="props.item.cw_to_id"
                                          label="Edit"
                                          single-line
                                        ></v-text-field>
                                      </template>
                                </v-edit-dialog>
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

                            <!-- leave_date -->
                            <template v-slot:item.leave_date="props">
                                <v-edit-dialog
                                  :return-value.sync="props.item.leave_date"
                                  @save="putLeaveDate(props)"
                                  @cancel=""
                                  @open=""
                                  @close=""
                                  large
                                >
                                  {{ props.item.leave_date }}
                                    <template v-slot:input>
                                        <v-text-field
                                          v-model="props.item.leave_date"
                                          label="Edit"
                                          single-line
                                        >
                                        <template v-slot:append>
                                          <v-date-picker 
                                           v-model="props.item.leave_date"
                                           locale="ja-jp"
                                          ></v-date-picker>
                                          <v-icon>mdi-calender</v-icon>
                                        </template>
                                        </v-text-field>
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
            searchType:'continuation',
            searchText:'',
            divisions:['新規(過払い)','新規(WEB相続)','調査','中決','交面','破産','交渉','完了','カスタマー','債務整理','相続','札幌','名古屋','岡山','広島','松山','高知','熊本','無所属'],
            positions:['SL','L','SM','M','D'],
            usersHeaders:[
                {text:'ID',       value:'user_id'},
                {text:'氏名',     value:'name'},
                {text:'カナ',     value:'kana'},
                {text:'BIZTEL',   value:'biztel_id'},
                {text:'管理者',   value:'admin'},
                {text:'所属',     value:'division'},
                {text:'司法書士', value:'judicial_scrivener'},
                {text:'役職',     value:'position'},
                {text:'最終ログイン', value:'last_login'},
                {text:'最終ログアウト', value:'last_logout'},
                {text:'CW To ID', value:'cw_to_id'},
                {text:'DA room id', value:'cw_dazou_room_id'},
                {text:'退所',       value:'leave_date', groupable:false},
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
        // 退所処理。
        putLeaveDate(props){
          const yesno = confirm('退所にしますか？')
          if(!yesno){return}
          this.$axios.put('/api/auth/user/leave-date',props.item)
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
        getUsers(){
          let uri = ''
          const type = this.searchType
          if(type =='all'){
            uri = '/api/auth/user/allUsers/all'
          } else if (type == 'continuation'){
            uri = '/api/auth/user/allUsers/all/continuation'
          } else if (type == 'retiree'){
            uri = '/api/auth/user/allUsers/all/retiree'
          }
          this.$axios.get(uri)
          .then(response => {
              console.log(response)
              this.users = response.data
          })

        }

    },
    created(){
      this.getUsers()
    }
}
</script>