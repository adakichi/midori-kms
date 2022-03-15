<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>債権者 wiki</h1>
                <v-app-bar>
                    <v-toolbar-title>
                        {{selectedCreditor.id}}:{{selectedCreditor.name}}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-switch
                    v-model="isDisabled"
                    label="編集"
                    ></v-switch>
                </v-app-bar>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-tabs v-model="tabs">
                    <v-tab>リスト</v-tab>
                    <v-tab>概要</v-tab>
                    <v-tab>受任時</v-tab>
                    <v-tab>債務整理</v-tab>
                    <v-tab>過払い</v-tab>
                    <v-tab>詳細</v-tab>
                    <v-tab>更新履歴</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tabs">
                    <v-tab-item>
                        <v-card>
                            <v-card-title><v-text-field label="フィルター" v-model="searchText" ></v-text-field></v-card-title>
                            <v-card-text>
                                <v-data-table
                                :items="creditors"
                                :headers="creditorsHeaders"
                                :search="searchText"
                                @click:row="selectCreditor"
                                ></v-data-table>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card>
                            <v-card-text>
                                <v-textarea label="概要" :disabled="!isDisabled" outlined v-model="selectedCreditor.caption"></v-textarea>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card>
                            <v-card-title>受任関係</v-card-title>
                            <v-card-subtitle>{{selectedCreditor.name}}</v-card-subtitle>
                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="旧社名/部署" :disabled="!isDisabled" outlined v-model="selectedCreditor.old_name"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="支店" :disabled="!isDisabled" outlined v-model="selectedCreditor.branch"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="地域" :disabled="!isDisabled" outlined v-model="selectedCreditor.area"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-select label="受任可否" :disabled="!isDisabled" outlined :items="okNg" v-model="selectedCreditor.accept ? 'OK': 'NG'"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select label="代理開示 可否" :disabled="!isDisabled" outlined :items="okNg" v-model="selectedCreditor.survey_only ? 'OK': 'NG'"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select label="無料引き直し" :disabled="!isDisabled" outlined :items="okNg" v-model="selectedCreditor.self_culculation ? 'OK': 'NG'"></v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="代理開示メモ" :disabled="!isDisabled" outlined v-model="selectedCreditor.survey_only_memo"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="介入時注意点" :disabled="!isDisabled" outlined v-model="selectedCreditor.caution"></v-textarea>
                                    </v-col>    
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="その他メモ" :disabled="!isDisabled" outlined v-model="selectedCreditor.survey_memo"></v-textarea>
                                    </v-col>    
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="履歴の開示期間" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.disclosure_period"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="和解書の返還まで" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.return_contract"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card>
                            <v-card-title>債務整理</v-card-title>
                            <v-card-subtitle>さぶちゃん</v-card-subtitle>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col>
                                            <v-text-field label="支払い回数" :disabled="!isDisabled" suffix="回" type="number" outlined v-model="selectedCreditor.number"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="開始まで" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.can_wait"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-select label="経過利息" :disabled="!isDisabled" outlined :items="interestString" v-model="selectedCreditor.accurued_interest"></v-select>
                                        </v-col>
                                        <v-col>
                                            <v-select label="将来利息" :disabled="!isDisabled" outlined :items="interestString" v-model="selectedCreditor.future_interest"></v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-text-field label="最低支払金額" :disabled="!isDisabled" suffix="円" type="number" outlined v-model="selectedCreditor.minimum_payment"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-select label="和解書作成者" :disabled="!isDisabled" outlined :items="contractCreater" v-model="selectedCreditor.contract_creater"></v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="時効援用のメモ" :disabled="!isDisabled" outlined v-model="selectedCreditor.prescription_contract"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="中決時の注意点" :disabled="!isDisabled" outlined v-model="selectedCreditor.policy_memo_debt"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="交渉時の注意点" :disabled="!isDisabled" outlined v-model="selectedCreditor.negotiation_memo_debt"></v-textarea>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card>
                            <v-card-title>過払いデータ</v-card-title>
                            <v-card-subtitle>さぶちゃん</v-card-subtitle>
                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="提案まで" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.until_proposal"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="提案まで" :disabled="!isDisabled" suffix="％" type="number" outlined v-model="selectedCreditor.maximum_proposal"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="和解書の返送" :disabled="!isDisabled" suffix="ヶ月" type="number" outlined v-model="selectedCreditor.return_date"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="中決時の注意点" :disabled="!isDisabled" outlined v-model="selectedCreditor.policy_memo_overpayment"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="交渉時の注意点" :disabled="!isDisabled" outlined v-model="selectedCreditor.negotiation_memo_overpayment"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="和解書の返還" :disabled="!isDisabled" outlined v-model="selectedCreditor.contract_return"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="訴訟提案" :disabled="!isDisabled" outlined v-model="selectedCreditor.trial_proposal"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="訴訟メモ" :disabled="!isDisabled" outlined v-model="selectedCreditor.trial_memo"></v-textarea>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card>
                            <v-card-title>詳細データ</v-card-title>
                            <v-card-subtitle>さぶちゃん</v-card-subtitle>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col>
                                            <v-text-field label="SAIZO:ID" :disabled="!isDisabled" type="number" outlined v-model="selectedCreditor.saizo_id"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="名前" :disabled="!isDisabled" outlined v-model="selectedCreditor.name"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="カナ" :disabled="!isDisabled" outlined v-model="selectedCreditor.kana"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-text-field label="TEL:受任関係" :disabled="!isDisabled" outlined v-model="selectedCreditor.phone_survey"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="FAX:受任関係" :disabled="!isDisabled" outlined v-model="selectedCreditor.fax"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-text-field label="郵便番号" :disabled="!isDisabled" outlined v-model="selectedCreditor.post_code" type="number"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="住所" :disabled="!isDisabled" outlined v-model="selectedCreditor.address"></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card>
                            <v-card-title>編集履歴<v-spacer></v-spacer><v-btn @click="getChaneLog">取得</v-btn></v-card-title>
                            <v-card-subtitle>
                                <v-text-field label="filter" v-model="changeLogSearchText"></v-text-field>
                            </v-card-subtitle>
                            <v-card-text>
                                <v-data-table
                                :items="changeLogs"
                                :headers="changeLogHeaders"
                                :search="changeLogSearchText"
                                ></v-data-table>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </v-col>
        </v-row>
        <v-dialog v-model="updateMemoDialog">
            <v-card>
                <v-card-text>
                    <v-text-field
                    v-model="updateMemo"
                    label="更新履歴用メモ"
                    >
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="updateSelectedCreditor">更新</v-btn>                    
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
            tabs:0,
            searchText:'',
            creditors:[],
            updateMemoDialog:false,
            updateMemo:'',
            creditorsHeaders:[
                {text:'名前',   value:'name'}
            ],
            selectedCreditor:{name:'未選択'},
            isDisabled:false,
            //items ///////////////////////////
            okNg:['OK','NG'],
            interestString:['必要','不要','減率'],
            contractCreater:['先方','みどり'],
            /////////////////////////////

            changeLogs:[],
            changeLogSearchText:'',
            changeLogHeaders:[
                {text:'変更日', value:'date'},
                {text:'変更日', value:'created_at'},
                {text:'コメント',value:'memo'},
                {text:'編集者',value:'editer'}
            ]
        }
    },
    methods:{
        getCreditors(){
            this.$axios.get('api/mkms/creditors')
            .then(response=>{
                if(response.data.error){ return response.data.message }
                this.creditors = response.data
            })
        },
        selectCreditor(e){
            console.log(e)
            this.tabs = 1
            this.selectedCreditor = e
        },
        openUpdateDialog(){
            this.updateMemoDialog = true
        },
        updateSelectedCreditor(){
            const doNot = !confirm('更新しますか？')
            if(doNot){ return }
            this.$axios.put('api/mkms/creditors/edit',{data:this.selectedCreditor,memo:this.updateMemo, editer:this.$auth.user?.name})
            .then(response=>{
                if(response.data.error){ return alert(response.data.message)}
                alert(response.data)
                console.log(response.data)
                this.updateMemo = ''
                this.updateMemoDialog = false
            })
        },
        getChaneLog(){
            this.$axios.get('api/mkms/creditors/changeLog',{params:{id:this.selectedCreditor.id}})
            .then(response=>{
                if(response.data.error){ return alert(response.data.message)}
                this.changeLogs = response.data
            })
        }
    },
    computed:{
    },
    created(){
        this.getCreditors()
    }
}
</script>