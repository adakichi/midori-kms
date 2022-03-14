<template>
    <v-container>
        <v-row>
            <v-col>
                <h1>債権者 wiki</h1>
                <v-app-bar>
                    <v-app-bar-title>
                        <v-text-field v-model="searchText" ></v-text-field>
                        <v-spacer></v-spacer>
                        {{selectedCreditor.id}}:{{selectedCreditor.name}}
                    </v-app-bar-title>
                </v-app-bar>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-tabs v-model="tabs">
                    <v-tab>リスト</v-tab>
                    <v-tab>受任時</v-tab>
                    <v-tab>債務整理</v-tab>
                    <v-tab>過払い</v-tab>
                    <v-tab>詳細データ</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tabs">
                    <v-tab-item>
                        <v-card>
                            <v-card-title>リスト</v-card-title>
                            <v-card-subtitle>さぶちゃん</v-card-subtitle>
                            <v-card-text>
                                <v-data-table
                                :items="creditors"
                                :headers="creditorsHeaders"
                                :search="searchText"
                                @click:row="selectCreditor"
                                ></v-data-table>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn>編集ボタン</v-btn>
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
                                        <v-textarea label="概要" outlined v-model="selectedCreditor.caption"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="旧社名/部署" outlined v-model="selectedCreditor.old_name"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="支店" outlined v-model="selectedCreditor.branch"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="地域" outlined v-model="selectedCreditor.area"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-select label="受任可否" outlined :items="okNg" v-model="selectedCreditor.accept ? 'OK': 'NG'"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select label="代理開示 可否" outlined :items="okNg" v-model="selectedCreditor.survey_only ? 'OK': 'NG'"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select label="無料引き直し" outlined :items="okNg" v-model="selectedCreditor.self_culculation ? 'OK': 'NG'"></v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="代理開示メモ" outlined v-model="selectedCreditor.survey_only_memo"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="介入時注意点" outlined v-model="selectedCreditor.caution"></v-textarea>
                                    </v-col>    
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="その他メモ" outlined v-model="selectedCreditor.survey_memo"></v-textarea>
                                    </v-col>    
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="履歴の開示期間" suffix="日" type="number" outlined v-model="selectedCreditor.disclosure_period"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="和解書の返還まで" suffix="日" type="number" outlined v-model="selectedCreditor.return_contract"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn>編集ボタン</v-btn>
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
                                            <v-text-field label="支払い回数" suffix="回" type="number" outlined v-model="selectedCreditor.number"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="開始まで" suffix="日" type="number" outlined v-model="selectedCreditor.can_wait"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-select label="経過利息" outlined :items="interestString" v-model="selectedCreditor.accurued_interest"></v-select>
                                        </v-col>
                                        <v-col>
                                            <v-select label="将来利息" outlined :items="interestString" v-model="selectedCreditor.future_interest"></v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-text-field label="最低支払金額" suffix="円" type="number" outlined v-model="selectedCreditor.minimum_payment"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-select label="和解書作成者" outlined :items="contractCreater" v-model="selectedCreditor.contract_creater"></v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="時効援用のメモ" outlined v-model="selectedCreditor.prescription_contract"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="中決時の注意点" outlined v-model="selectedCreditor.policy_memo_debt"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="交渉時の注意点" outlined v-model="selectedCreditor.negotiation_memo_debt"></v-textarea>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn>編集ボタン</v-btn>
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
                                        <v-text-field label="提案まで" suffix="日" type="number" outlined v-model="selectedCreditor.until_proposal"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="提案まで" suffix="％" type="number" outlined v-model="selectedCreditor.maximum_proposal"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="和解書の返送" suffix="ヶ月" type="number" outlined v-model="selectedCreditor.return_date"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="中決時の注意点" outlined v-model="selectedCreditor.policy_memo_overpayment"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="交渉時の注意点" outlined v-model="selectedCreditor.negotiation_memo_overpayment"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="和解書の返還" outlined v-model="selectedCreditor.contract_return"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="訴訟提案" outlined v-model="selectedCreditor.trial_proposal"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="訴訟メモ" outlined v-model="selectedCreditor.trial_memo"></v-textarea>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn>編集ボタン</v-btn>
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
                                            <v-text-field label="債権者ID" type="number" outlined v-model="selectedCreditor.id"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="名前" outlined v-model="selectedCreditor.name"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="カナ" outlined v-model="selectedCreditor.kana"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-text-field label="TEL:受任関係" outlined v-model="selectedCreditor.phone_survey"></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="FAX:受任関係" outlined v-model="selectedCreditor.fax"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-text-field label="住所" outlined v-model="selectedCreditor.address"></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn>編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
            tabs:0,
            searchText:'',
            creditors:[],
            creditorsHeaders:[
                {text:'名前',   value:'name'}
            ],
            selectedCreditor:{name:'none'},
            okNg:['OK','NG'],
            interestString:['必要','不要','減率'],
            contractCreater:['先方','みどり']
        }
    },
    methods:{
        getCreditors(){
            this.$axios.get('api/creditors/mkms')
            .then(response=>{
                if(response.data.error){ return response.data.message }
                console.log(response.data)
                this.creditors = response.data
            })
        },
        selectCreditor(e){
            console.log(e)
            this.tabs = 1
            this.selectedCreditor = e            
        },
        switchDialog(){
            this.dialog = !this.dialog
        },
    },
    computed:{
    },
    created(){
        this.getCreditors()
    }
}
</script>