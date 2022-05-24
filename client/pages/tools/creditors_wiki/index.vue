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
                    <v-btn to="/tools/creditors_wiki/log_list" nuxt>更新履歴一覧</v-btn>
                    <v-switch
                    class="mt-5 ml-4"
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
                                items-per-page="20"
                                @click:row="selectCreditor"
                                >
                                 <template v-slot:item.accept_overpayment="{item}">
                                     <v-chip :color="getColor(item.accept_overpayment)" dark>
                                        {{okNgEtc(item.accept_overpayment)}}
                                     </v-chip>
                                 </template>
                                 <template v-slot:item.accept_debt="{item}">
                                     <v-chip :color="getColor(item.accept_debt)" dark>
                                        {{okNgEtc(item.accept_debt)}}
                                     </v-chip>
                                 </template>
                                 <template v-slot:item.survey_only="{item}">
                                     <v-chip :color="getColor(item.survey_only)" dark>
                                        {{okNgEtc(item.survey_only)}}
                                     </v-chip>
                                 </template>
                                </v-data-table>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>

                    <!-- 概要 -->
                    <v-tab-item>

                        <!-- 表示データ -->
                        <v-card v-show="!isDisabled">
                            <v-card-text>
                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="800px">概要</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style="text-align:left;" v-html="conv2br(selectedCreditor.caption)"></td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>
                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="800px">新規向けメモ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td v-html="conv2br(selectedCreditor.inquiry_memo)">{{selectedCreditor.inquiry_memo}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>
                            </v-card-text>
                        </v-card>

                        
                        <v-card v-show="isDisabled">
                            <v-card-text>
                                <v-textarea label="概要" :rows="countRows(selectedCreditor.caption)" :disabled="!isDisabled" outlined v-model="selectedCreditor.caption" :rules="[limit_length300]" counter="300"></v-textarea>
                            </v-card-text>
                            <v-card-text>
                                <v-textarea label="新規向けメモ" :rows="countRows(selectedCreditor.inquiry_memo)" :disabled="!isDisabled" outlined v-model="selectedCreditor.inquiry_memo" :rules="[limit_length300]" counter="300"></v-textarea>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>

                        <!-- 表示のカード -->
                        <v-card v-show="!isDisabled">
                            <v-card-title>受任関係</v-card-title>
                            <v-card-text>
                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="300px">社名</th>
                                            <th width="300px">旧社名</th>
                                            <th width="100px">支店</th>
                                            <th width="100px">地域</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.name}}</td>
                                            <td>{{selectedCreditor.old_name}}</td>
                                            <td>{{selectedCreditor.branch}}</td>
                                            <td>{{selectedCreditor.area}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>
                                <div style="display: flex;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>受任可否(過払い)</th>
                                                <th>受任可否(債務)</th>
                                                <th>代理開示 可否</th>
                                                <th>無料引き直し</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{okNgEtc(selectedCreditor.accept_overpayment)}}</td>
                                                <td>{{okNgEtc(selectedCreditor.accept_debt)}}</td>
                                                <td>{{okNgEtc(selectedCreditor.survey_only)}}</td>
                                                <td>{{okNgEtc(selectedCreditor.self_culculation)}}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>履歴の開示期間</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{selectedCreditor.disclosure_period}}日</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style="display: flex;">
                                <table><thead><tr>
                                            <th>代理開示メモ</th>
                                    </tr></thead>
                                    <tbody><tr>
                                            <td style="padding:0; min-width:500px; min-height:150px;"><textarea disabled style="min-height:150px">{{selectedCreditor.survey_only_memo}}</textarea></td>
                                </tr></tbody></table>
                                <table><thead><tr>
                                            <th>介入時注意点</th>
                                    </tr></thead>
                                    <tbody><tr>
                                            <td style="padding:0;  min-width:500px; min-height:150px;"><textarea disabled style="min-height:150px">{{selectedCreditor.caution}}</textarea></td>
                                </tr></tbody></table>
                                </div>
                                
                                <div style="display: flex;">
                                <table><thead><tr>
                                            <th>その他メモ</th>
                                    </tr></thead>
                                    <tbody><tr>
                                            <td style="padding:0;  min-width:500px; min-height:150px;"><textarea disabled style="min-height:150px">{{selectedCreditor.survey_memo}}</textarea></td>
                                </tr></tbody></table>
                                </div>

                            </v-card-text>
                        </v-card>

                        <!-- 編集のカード -->
                        <v-card v-show="isDisabled">
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
                                        <v-select label="受任可否(過払)" :disabled="!isDisabled" outlined :items="okNg" v-model="selectedCreditor.accept_overpayment"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select label="受任可否(債務)" :disabled="!isDisabled" outlined :items="okNg" v-model="selectedCreditor.accept_debt"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select label="代理開示 可否" :disabled="!isDisabled" outlined :items="okNg" v-model="selectedCreditor.survey_only"></v-select>
                                    </v-col>
                                    <v-col>
                                        <v-select label="無料引き直し" :disabled="!isDisabled" outlined :items="okNg" v-model="selectedCreditor.self_culculation"></v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="代理開示メモ" :rows="countRows(selectedCreditor.survey_only_memo)" :disabled="!isDisabled" outlined v-model="selectedCreditor.survey_only_memo"  :rules="[limit_length300]" counter="300"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="介入時注意点" :rows="countRows(selectedCreditor.caution)" :disabled="!isDisabled" outlined v-model="selectedCreditor.caution"  :rules="[limit_length300]" counter="300"></v-textarea>
                                    </v-col>    
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="その他メモ" :rows="countRows(selectedCreditor.survey_memo)" :disabled="!isDisabled" outlined v-model="selectedCreditor.survey_memo" :rules="[limit_length300]" counter="300"></v-textarea>
                                    </v-col>    
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="履歴の開示期間" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.disclosure_period"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item class="debt">

                        <!-- 表示のカード -->
                        <v-card v-show="!isDisabled">
                            <v-card-title>債務整理</v-card-title>
                            <v-card-text>
                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>支払い回数</th>
                                            <th>最低金額</th>
                                            <th>開始までの期間</th>
                                            <th>経過利息</th>
                                            <th>将来利息</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.number}}</td>
                                            <td>{{selectedCreditor.minimum_payment}}円</td>
                                            <td>{{selectedCreditor.can_wait}}日</td>
                                            <td>{{selectedCreditor.accurued_interest}}</td>
                                            <td>{{selectedCreditor.future_interest}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>短期取引ペナルティ</th>
                                            <th>短期取引ペナルティメモ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.short_term == 0 ? '無し' : '有り'}}</td>
                                            <td style="padding:0; min-width:500px;"><textarea disabled style="min-height:50px; margin:0; outline:0;">{{selectedCreditor.short_term_memo}}</textarea></td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>

                                <div style="display: flex;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>和解書作成</th>
                                                <th>和解書返還</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{selectedCreditor.contract_creator}}</td>
                                                <td>{{selectedCreditor.return_contract_debt}}日</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>和解書メモ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style="padding:0; min-width:500px;"><textarea disabled style="min-height:50px; margin:0; outline:0;">{{selectedCreditor.contract_memo_debt}}</textarea></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>

                                <div style="display: flex;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>中決時の注意点</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style="padding:0; min-width:500px;"><textarea disabled style="min-height:150px; margin:0; outline:0;">{{selectedCreditor.policy_memo_debt}}</textarea></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>交渉時の注意点</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style="padding:0; min-width:500px;"><textarea disabled style="min-height:150px; margin:0; outline:0;">{{selectedCreditor.negotiation_memo_debt}}</textarea></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style="display: flex;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>時効援用メモ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style="padding:0; min-width:500px;"><textarea disabled style="min-height:50px; margin:0; outline:0;">{{selectedCreditor.prescription_contract}}</textarea></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </v-card-text>
                        </v-card>

                        <!-- 編集のカード -->
                        <v-card v-show="isDisabled">
                            <v-card-title>債務整理</v-card-title>
                            <v-card-subtitle></v-card-subtitle>
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
                                            <v-select label="短期取引ペナルティ" :disabled="!isDisabled" outlined :items="shortTerm" v-model="selectedCreditor.short_term"></v-select>
                                        </v-col>
                                        <v-col>
                                            <v-textarea v-show="selectedCreditor.short_term" label="ペナルティの詳細" :rows="countRows(selectedCreditor.short_term_memo)" :disabled="!isDisabled" outlined v-model="selectedCreditor.short_term_memo"  :rules="[limit_length300]" counter="300"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-select label="経過利息" :disabled="!isDisabled" outlined :items="accureedString" v-model="selectedCreditor.accurued_interest"></v-select>
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
                                            <v-select label="和解書作成者" :disabled="!isDisabled" outlined :items="contractCreator" v-model="selectedCreditor.contract_creator"></v-select>
                                        </v-col>
                                        <v-col>
                                            <v-text-field label="和解書の返還まで" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.return_contract_debt" hint="支払い開始日から数える場合は -(ﾏｲﾅｽ) をつけて"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="和解書メモ" :rows="countRows(selectedCreditor.contract_memo_debt)" :disabled="!isDisabled" outlined v-model="selectedCreditor.contract_memo_debt"  :rules="[limit_length300]" counter="300"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="時効援用のメモ" :rows="countRows(selectedCreditor.prescription_contract)" :disabled="!isDisabled" outlined v-model="selectedCreditor.prescription_contract"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="中決時の注意点" :rows="countRows(selectedCreditor.policy_memo_debt)" :disabled="!isDisabled" outlined v-model="selectedCreditor.policy_memo_debt"  :rules="[limit_length1000]" counter="1000"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea label="交渉時の注意点" :rows="countRows(selectedCreditor.negotiation_memo_debt)" :disabled="!isDisabled" outlined v-model="selectedCreditor.negotiation_memo_debt"  :rules="[limit_length1000]" counter="1000"></v-textarea>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>


                    <v-tab-item>
                        <!-- 表示のカード -->
                        <v-card v-show="!isDisabled">
                            <v-card-title>過払い</v-card-title>
                            <v-card-text>
                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>提案まで</th>
                                            <th>任意 上限</th>
                                            <th>返金まで</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.until_proposal}}日</td>
                                            <td>{{selectedCreditor.maximum_proposal}}％</td>
                                            <td>{{selectedCreditor.return_date}}日</td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>

                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>中決時の注意点</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style="padding:0; "><textarea disabled style="width:500px; min-height:200px; margin:0; outline:0;">{{selectedCreditor.policy_memo_overpayment}}</textarea></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>交渉時の注意点</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style="padding:0; "><textarea disabled style="width:500px; min-height:200px; margin:0; outline:0;">{{selectedCreditor.negotiation_memo_overpayment}}</textarea></td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>

                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>和解書返還まで</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.return_contract_overpayment}}日</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>和解書メモ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style="padding:0; "><textarea disabled style="width:400px; min-height:50px; margin:0; outline:0;">{{selectedCreditor.contract_memo_overpayment}}</textarea></td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>

                                <div style="display: flex;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>訴訟提案：金額</th>
                                                <th>訴訟期間：最短</th>
                                                <th>訴訟期間：最長</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{selectedCreditor.trial_maximum_proposal}}％</td>
                                                <td>{{selectedCreditor.trial_period_earlier/30}}ヶ月</td>
                                                <td>{{selectedCreditor.trial_period_longest/30}}ヶ月</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div style="display: flex;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>訴訟メモ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{selectedCreditor.trial_memo}}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </v-card-text>
                        </v-card>

                        <!-- 編集のカード -->
                        <v-card v-show="isDisabled">
                            <v-card-title>過払いデータ</v-card-title>
                            <v-card-subtitle></v-card-subtitle>
                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="提案まで" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.until_proposal"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="任意の提案上限金額" :disabled="!isDisabled" suffix="％" type="number" outlined v-model="selectedCreditor.maximum_proposal"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="返金まで" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.return_date"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="中決時の注意点" :rows="countRows(selectedCreditor.policy_memo_overpayment)" :disabled="!isDisabled" outlined v-model="selectedCreditor.policy_memo_overpayment" :rules="[limit_length1000]" counter="1000"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="交渉時の注意点" :rows="countRows(selectedCreditor.negotiation_memo_overpayment)" :disabled="!isDisabled" outlined v-model="selectedCreditor.negotiation_memo_overpayment" :rules="[limit_length1000]" counter="1000"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="和解書の返還まで" :disabled="!isDisabled" suffix="日" type="number" outlined v-model="selectedCreditor.return_contract_overpayment" hint="支払い開始日から数える場合は -(ﾏｲﾅｽ) をつけて"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-textarea label="和解書メモ" :rows="countRows(selectedCreditor.contract_memo_overpayment)" :disabled="!isDisabled" outlined v-model="selectedCreditor.contract_memo_overpayment" :rules="[limit_length300]" counter="300"></v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="訴訟提案:金額" suffix="％" :disabled="!isDisabled" outlined v-model="selectedCreditor.trial_maximum_proposal"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="訴訟期間：最短" suffix="日" :disabled="!isDisabled" outlined v-model="selectedCreditor.trial_period_earlier"></v-text-field>
                                    </v-col>
                                    ～
                                    <v-col>
                                        <v-text-field label="訴訟期間：最長" suffix="日" :disabled="!isDisabled" outlined v-model="selectedCreditor.trial_period_longest"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-textarea label="訴訟メモ" :rows="countRows(selectedCreditor.trial_memo)" :disabled="!isDisabled" outlined v-model="selectedCreditor.trial_memo" :rules="[limit_length1000]" counter="1000"></v-textarea>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="openUpdateDialog">編集ボタン</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>

                    <!-- 詳細データ -->
                    <v-tab-item>

                        <!-- 表示のカード -->
                        <v-card v-show="!isDisabled">
                            <v-card-title>詳細</v-card-title>
                            <v-card-text>
                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="100px">SAIZO ID</th>
                                            <th width="400px">名前</th>
                                            <th width="400px">カナ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.saizo_id}}</td>
                                            <td>{{selectedCreditor.name}}</td>
                                            <td>{{selectedCreditor.kana}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>

                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="150">受任通知 郵送？</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.mail_start === 1 ? '郵送': 'FAX'}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>受任通知：メモ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style="padding:0; "><textarea disabled style="width:500px; min-height:50px; margin:0; outline:0;">{{selectedCreditor.survey_memo}}</textarea></td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>
                                <hr>
                                <h3>本店所在地</h3>
                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="150">部署</th>
                                            <th width="150">TEL</th>
                                            <th width="150">FAX</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.division}}</td>
                                            <td>{{selectedCreditor.phone}}</td>
                                            <td>{{selectedCreditor.fax}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>
                                <div style="display: flex;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>郵便番号</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>〒{{selectedCreditor.post_code}}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>住所</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{selectedCreditor.address}}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <hr>
                                <h3>受任通知送信先</h3>
                                <div style="display: flex;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="150">部署</th>
                                            <th width="150">TEL</th>
                                            <th width="150">FAX</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{{selectedCreditor.division_survey}}</td>
                                            <td>{{selectedCreditor.phone_survey}}</td>
                                            <td>{{selectedCreditor.fax_survey}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                </div>
                                <div style="display: flex;">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>郵便番号</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>〒{{selectedCreditor.post_code_survey}}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>住所</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{selectedCreditor.address_survey}}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </v-card-text>
                        </v-card>

                        <!-- 編集カード -->
                        <v-card v-show="isDisabled">
                            <v-card-title>詳細データ</v-card-title>
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
                                            <v-text-field label="カナ" :disabled="!isDisabled" outlined v-model="selectedCreditor.name_kana" hint="半角カナで入れてください。"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-select label="受任通知：郵送？" :disabled="!isDisabled" :items="mailStart" outlined v-model="selectedCreditor.mail_start" hint="ハイフン無しで数字のみ"></v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea :rows="countRows(selectedCreditor.survey_memo)" label="受任通知：メモ" :disabled="!isDisabled" outlined v-model="selectedCreditor.survey_memo" counter="300" :rules="limit_length300"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            住所：
                                            <v-expansion-panels>
                                                <v-expansion-panel>
                                                    <v-expansion-panel-header>本店</v-expansion-panel-header>
                                                    <v-expansion-panel-content>
                                                        <v-row>
                                                            <v-col>
                                                                <v-text-field label="部署" :disabled="!isDisabled" outlined v-model="selectedCreditor.division"></v-text-field>
                                                            </v-col>
                                                            <v-col>
                                                                <v-text-field label="TEL" :disabled="!isDisabled" outlined v-model="selectedCreditor.phone" hint="ハイフン無しで数字のみ"></v-text-field>
                                                            </v-col>
                                                            <v-col>
                                                                <v-text-field label="FAX" :disabled="!isDisabled" outlined v-model="selectedCreditor.fax" hint="ハイフン無しで数字のみ"></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                        <v-row>
                                                            <v-col>
                                                                <v-text-field label="郵便番号" prefix="〒" :disabled="!isDisabled" outlined v-model="selectedCreditor.post_code" type="number" hint="ハイフンは無し"></v-text-field>
                                                            </v-col>
                                                            <v-col>
                                                                <v-text-field label="住所" :disabled="!isDisabled" outlined v-model="selectedCreditor.address"></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-expansion-panel-content>
                                                </v-expansion-panel>
                                                <v-expansion-panel>
                                                    <v-expansion-panel-header>受任通知</v-expansion-panel-header>
                                                    <v-expansion-panel-content>
                                                        <v-row>
                                                            <v-col>
                                                                <v-text-field label="部署:受任関係" :disabled="!isDisabled" outlined v-model="selectedCreditor.division_survey" hint="本店と同じ場合は「同上」"></v-text-field>
                                                            </v-col>
                                                            <v-col>
                                                                <v-text-field label="TEL:受任関係" :disabled="!isDisabled" outlined v-model="selectedCreditor.phone_survey" hint="ハイフン無しで数字のみ。"></v-text-field>
                                                            </v-col>
                                                            <v-col>
                                                                <v-text-field label="FAX:受任関係" :disabled="!isDisabled" outlined v-model="selectedCreditor.fax_survey" hint="ハイフン無しで数字のみ。"></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                        <v-row>
                                                            <v-col>
                                                                <v-text-field label="郵便番号:受任関係" prefix="〒" :disabled="!isDisabled" outlined v-model="selectedCreditor.post_code_survey" type="number" hint="ハイフンは無し"></v-text-field>
                                                            </v-col>
                                                            <v-col>
                                                                <v-text-field label="住所:受任関係" :disabled="!isDisabled" outlined v-model="selectedCreditor.address_survey"></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-expansion-panel-content>
                                                </v-expansion-panel>
                                            </v-expansion-panels>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
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
                {text:'名前',         value:'name', width:"300px"},
                {text:'過払い受任',   value:'accept_overpayment'},
                {text:'債務整理受任',   value:'accept_debt'},
                {text:'代理開示',     value:'survey_only'},
                {text:'旧社名',     value:'old_name'}
            ],
            selectedCreditor:{name:'未選択'},
            isDisabled:false,
            //items ///////////////////////////
            okNg:[
                {text:'NG',         value:0},
                {text:'OK',         value:1},
                {text:'OK※注意',   value:2},
                {text:'未確認',     value:3}
            ],
            accureedString:['必要','不要','必要(提案まで)','必要(和解日まで)','必要(支払開始まで)','必要(12回であれば不要)'],
            interestString:['必要','不要','減率'],
            contractCreator:['債権者','事務所'],
            mailStart:[{text:'FAXでOK',value:0},{text:'郵送',value:1},{text:'メモ参照',value:2},{text:'未選択',value:null}],
            /////////////////////////////
            shortTerm:[
                {text:'罰有り',value:1},
                {text:'罰無し',value:0}
            ],
            changeLogs:[],
            changeLogSearchText:'',
            changeLogHeaders:[
                {text:'変更日',  value:'date'},
                {text:'コメント',value:'memo'},
                {text:'編集者',  value:'editer'}
            ],

            ///////////////////////////////////
            ///////////////////////////////////
            ///////////////////////////////////
            //ルール　バリデーション用
            required: v => !!v ||'必須項目です。',
            limit_length300: v => !v || v.length <= 300 || '300文字までです。',
            limit_length1000: v => !v || v.length <= 1000 || '1000文字までです。'
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
        },

        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        //util
        getColor(val){
            let result = ''
            switch(val){
                case 0:
                    result = 'error'
                break
                case 1:
                    result = 'success'
                break
                case 2:
                    result = 'warning'
                break
                case 3:
                    result = 'grey'
                break
            }
            return result
        },
        okNgEtc(val){
            let result =''
            switch(val){
                case 0:
                    result = 'NG'
                break
                case 1:
                    result = 'OK'
                break
                case 2:
                    result = 'OK※注意'
                break
                case 3:
                    result = '未確認'
                break
            }
            return result
        },
        countRows(str){
            // textareaの文字列の改行の数をカウントする。※rowsに設定することで高さを変更する。
            const type = typeof str
            if(type === "string"){
                if(!str){return 0}
                const count = str.match(/\n/g)
                if(count){
                    return count.length + 5
                }
            }
        },
        conv2br(str){
            let converted = ''
            if(typeof str === "string"){
                converted = str.replace( /\n\n/g,"</p><p>")
                return converted.replace( /\n/g,"<br>")
            }
        }
    },
    computed:{
        themeIsDark(){
            return this.$vuetify.theme.isDark
        }
    },
    created(){
        this.getCreditors()
            console.log(this.$vuetify.theme)
    }
}
</script>


<style lang="scss" scoped>
    .theme--dark{
        textarea:disabled{
            color: white;
        }
        p{
            color:white;
        }
        th,td{
            color:#FFFFFF;
        }
        th{
            background: #616161;
        }
        td{
            background: #757575;
        }
    }

    table{
        margin: 5px;
        border-collapse: collapse;
    }

    th,td{
        padding: 5px;
        border: 1px solid black;
        min-width: 50px;
        text-align: center;
        textarea{
            margin : 0;
            padding: 0;
            outline: none;
            width  : 100%;
            height : 100%;
        }
    }

</style>
