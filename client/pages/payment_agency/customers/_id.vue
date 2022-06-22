<template>
    <v-container>
                <v-app-bar>
                    LUID：{{customer? customer.lu_id:'No ID'}}
                </v-app-bar>
                <v-app-bar>
                    受：{{customerId}} {{customer?customer.name:'No Name'}}
                    <v-spacer></v-spacer>
                    <div>
                      <v-edit-dialog
                      large
                      @save="updateProgress"
                    >
                      {{ customer.progress }}
                      <template v-slot:input>
                        <v-select
                          v-model="customer.progress"
                          :items="progressItems"
                          label="進捗"
                          single-line
                        ></v-select>
                      </template>
                    </v-edit-dialog>
                    </div>
                    <v-btn @click="goback">戻る</v-btn>
                </v-app-bar>
        <v-row>
            <v-col class="text-center">
            </v-col>
        </v-row>

        <!-- ここから和解内容表示 -->
        <v-tabs v-model="tabs">
            <v-tab>和解一覧</v-tab>
            <v-tab>支払い予定</v-tab>
            <v-tab>入金予定</v-tab>
            <v-tab>顧客情報</v-tab>
            <v-tab>会計情報</v-tab>
            <v-tab>仕訳情報</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabs">

        <!-- 和解一覧タブ -->
        <v-tab-item>
        <v-container>
                <v-row>
                    <v-col>
                        <v-app-bar>
                <v-dialog max-width="800" v-model="dialog" persistent>
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on">新規和解登録</v-btn>
                    </template>
                    <v-card color="grey darken-3">
                        <v-app-bar flat>
                            和解登録
                            <v-spacer></v-spacer>
                            <v-icon @click.stop="dialog = false">mdi-close</v-icon>
                        </v-app-bar>
                        <v-tabs
                        v-model="registerTabs"
                        grow
                        background-color="transparent">
                        <v-tab>和解内容</v-tab>
                        <v-tab>イレギュラー</v-tab>
                        <v-tab>口座情報</v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="registerTabs">
                        <v-tab-item>
                            <v-container>
                            <v-row>
                                <v-col>
                                    <v-autocomplete v-model="creditor"
                                    item-value="creditor_id"
                                    item-text="creditor_name"
                                    :items="creditors"
                                    label="債権者"></v-autocomplete>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                    :rules="[num]"
                                    v-model="totalAmount"
                                    type="number"
                                    label="支払い総額"
                                    suffix=" 円"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                    v-model="monthlyAmount"
                                    :rules="[num]"
                                    type="number"
                                    label="月額"
                                    suffix=" 円"
                                    ></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-text-field
                                    v-model="numberOfPayments"
                                    :rules="[num]"
                                    type="number"
                                    label="支払い回数"
                                    suffix=" 回"
                                    ></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-text-field
                                    v-model="firstAmount"
                                    type="number"
                                    label="初回支払い金額"
                                    suffix="　円"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-select
                                    v-model="monthlyPaymentDueDate"
                                    label="支払日"
                                    :items="dueDate"
                                    ></v-select>
                                </v-col>
                                <v-col>
                                    <v-text-field
                                    v-model="startDate"
                                    label="開始日"
                                    >
                                    <template v-slot:append >
                                            <v-menu>
                                            <template v-slot:activator="{on, attrs}">
                                            <v-icon v-bind="attrs" v-on="on">
                                                mdi-calendar-month
                                            </v-icon>
                                            </template>
                                            <v-date-picker v-model="startDate"></v-date-picker>
                                            </v-menu>
                                    </template>
                                    </v-text-field>
                                </v-col>
                                <v-col>
                                    <v-select
                                    :items="typeOfDelayArray"
                                    v-model="typeOfDelay"
                                    label="懈怠設定"
                                    ></v-select>
                                </v-col>
                                <v-col>
                                    <v-text-field
                                    type="number"
                                    v-model="delayedInterestRate"
                                    label="遅延利率"
                                    suffix=" %"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            </v-container>
                        </v-tab-item>
                        <v-tab-item>
                            <v-container>
                            <v-row>
                                <v-col>
                                    <span><v-checkbox
                                    label="イレギュラー(他に選択肢がなければこれ)"
                                    v-model="irregular"
                                    ></v-checkbox></span>
                                    <v-select
                                    :items="pensionValues"
                                    label="隔月(年金等)"
                                    v-model="pension"></v-select>
                                    <v-text-field
                                    label="将来利息がつく"
                                    type="number"
                                    suffix=" %"
                                    v-model="interest"></v-text-field>
                                    <v-checkbox
                                    label="ボーナス払いがある"
                                    v-model="bonus"></v-checkbox>
                                    <v-row v-show="bonus">
                                    <v-col>
                                        <v-select
                                        v-model="summerBonusDate"
                                        label="夏の支払い日"
                                        :items="summer"
                                        suffix="　月"
                                        >
                                        </v-select>
                                    </v-col>
                                    <v-col>
                                    <v-text-field
                                    label="ボーナス夏"
                                    type="number"
                                    suffix=" 円"
                                    v-model="summerBonusAmount"></v-text-field>
                                    </v-col>
                                    </v-row>
                                    <v-row v-show="bonus">
                                    <v-col>
                                        <v-select
                                        v-model="winterBonusDate"
                                        label="夏の支払い日"
                                        :items="winter"
                                        suffix="　月"
                                        >
                                        </v-select>
                                    </v-col>
                                    <v-col>
                                    <v-text-field
                                    label="ボーナス冬"
                                    type="number"
                                    suffix=" 円"
                                    v-model="winterBonusAmount"></v-text-field>
                                    </v-col>
                                    </v-row>
                                    <v-checkbox
                                    label="別和解と合算がある"
                                    v-model="addition"></v-checkbox>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                    label="代行手数料の金額"
                                    type="number"
                                    suffix="　円"
                                    v-model="commission"></v-text-field>
                                    <v-text-field
                                    type="number"
                                    label="顧問料の金額"
                                    suffix="　円"
                                    v-model="advisoryFee"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-textarea outlined v-model="accountComment" label="メモ"></v-textarea>
                        </v-container>
                        </v-tab-item>
                        <v-tab-item>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <v-select v-model="selectedAccount" return-object item-text="selectItem" item-value="selectItem" :items="accounts" label="セレクトアイテム"></v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field disabled v-model="selectedAccount.bankname" label="銀行名"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field disabled v-model="selectedAccount.bankcode" label="銀行コード"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field disabled v-model="selectedAccount.branchname" label="支店名"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field disabled v-model="selectedAccount.branchcode" label="支店コード"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col md="2" lg="2">
                                        <v-text-field disabled v-model="selectedAccount.kind" label="種別"></v-text-field>
                                    </v-col>
                                    <v-col md="4" lg="4">
                                        <v-text-field v-model="accountNumber" label="口座番号"></v-text-field>
                                    </v-col>
                                    <v-col md="6" lg="6">
                                        <v-text-field disabled v-model="selectedAccount.account_holder" label="口座名義"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-tab-item>
                        </v-tabs-items>
                        <v-divider></v-divider>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn v-show="registerOrUpdate" @click="postNewAccount"   color="success">登録</v-btn>
                            <v-btn v-show="!registerOrUpdate" @click="updateNewAccount" color="warning">更新</v-btn>
                        </v-card-actions>         
                    </v-card>
                </v-dialog>
                        </v-app-bar>

                <v-row v-for="(settle,index) in contentsOfSettlements" :key="index">
                    <v-col>
                        <v-card>
                            <v-card-text>
                                <v-row> 
                                    <v-col>
                                        {{settle.creditor_name}}
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        総額：{{settle.total_amount}}円
                                        月額：{{settle.monthly_amount}}円
                                        初回：{{settle.first_amount}}
                                        初回支払い:{{settle.start_date}}
                                        毎月：{{settle.monthly_payment_due_date}}
                                        回数：{{settle.number_of_payments}}回
                                        懈怠設定：{{settle.type_of_delay}}
                                        懈怠利率：{{settle.delayed_interest_rate}} %
                                    </v-col>
                                    <v-col>
                                        <v-btn @click="createPaymentSchedules(index)">予定作成</v-btn>
                                        <v-btn @click="openEditSettlementUpdateDialog(settle)">和解内容編集</v-btn>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        メモ：{{settle.account_comment}}
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                                <v-row>
                                    <v-col>
                                        手数料：{{settle.commission}}
                                        顧問料：{{settle.advisory_fee}}
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        イレギュラー
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-system-bar>
                                            <v-checkbox
                                                v-model="settle.irregular"
                                                label="イレギュラー"
                                                disabled
                                            ></v-checkbox>
                                            <v-checkbox
                                                v-model="settle.pension"
                                                label="年金"
                                                disabled
                                            ></v-checkbox>
                                            <v-checkbox
                                                v-model="settle.interest"
                                                label="将来利息"
                                                disabled
                                            ></v-checkbox>
                                            <v-checkbox
                                                v-model="settle.bonus"
                                                label="ボーナス"
                                                disabled
                                            ></v-checkbox>
                                            <v-checkbox
                                                v-model="settle.addition"
                                                label="合算"
                                                disabled
                                            ></v-checkbox>
                                        </v-system-bar>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        銀行：{{settle.bankcode}}支店：{{settle.branchcode}}種別:{{settle.kind}}番号{{settle.account_number}}口座名義{{settle.account_holder}}
                                    </v-col>
                                </v-row>       
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <!-- 支払い計画作成のdialog -->
        <v-dialog max-width="800" v-model="createScheduleDialog" persistent>
            <v-card>
                <v-app-bar flat>
                    予定作成
                    <v-spacer></v-spacer>
                    <v-btn @click="registerPaymentSchedules()">確定</v-btn>
                    <v-spacer></v-spacer>
                    <v-icon @click.stop="createScheduleDialog = false; schedules = []">mdi-close</v-icon>
                </v-app-bar>
                <v-card-text>
                    <v-data-table
                    :headers="schedulesHeaders"
                    :items="schedules"
                    >
                    <template v-slot:item.date="props">
                      <v-edit-dialog
                      :return-value.sync="props.item.date"
                    >
                      {{ props.item.date }}
                      <template v-slot:input>
                        <v-text-field
                          v-model="props.item.date"
                          label="日付"
                          single-line
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                    </template>

                    <template v-slot:item.amount="props">
                      <v-edit-dialog
                      :return-value.sync="props.item.amount"
                    >
                      {{ props.item.amount }}
                      <template v-slot:input>
                        <v-text-field
                          v-model="props.item.amount"
                          label="金額"
                          single-line
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
                    </template>

                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-dialog>
        </v-container>


        <!-- 支払い予定の部分 -->
        </v-tab-item>
        <v-tab-item>
            <v-container>
                <v-row>
                    <v-col>
                        <v-app-bar>
                            <v-btn @click="deleteAllPs">予定削除</v-btn>
                            <v-spacer></v-spacer>
                            予定：残債務{{sumPaymentSchedules.sumAmount}}　予定：手数料{{sumPaymentSchedules.sumAdvisoryFee+sumPaymentSchedules.sumCommission}}
                        </v-app-bar>
                        <v-app-bar>
                            <v-text-field
                            v-model="filterPs"
                            label="フィルター"
                            class="mx-4"
                            >
                        </v-text-field>
                        </v-app-bar>
                        <v-data-table
                        v-model="selectedPs"
                        :headers="paymentSchedulesHeaders"
                        :items="paymentSchedules"
                        item-key="payment_schedule_id"
                        :items-per-page="-1"
                        :search="filterPs"
                        selectable-key="isSelectable"
                        show-select
                        show-group-by
                        >
                            <!-- メモ欄編集 -->
                            <template v-slot:item.date="{item}">
                                <v-edit-dialog
                                    v-model="editDialogPaymentScheduleDate"
                                    large
                                    @save="savePs(item)"
                                    :return-value.sync="item.date"
                                >   
                                    {{item.date}}
                                    <template v-slot:input>
                                        <v-text-field
                                            v-model="item.date"
                                            label="メモ"
                                            single-line
                                            type="date"
                                        ></v-text-field>
                                    </template>
                                </v-edit-dialog>
                            </template>

                            <!-- 金額欄編集 -->
                            <template v-slot:item.amount="{item}">
                                <v-edit-dialog
                                    v-model="editDialogPaymentScheduleAmount"
                                    large
                                    @save="savePs(item)"
                                    :return-value.sync="item.amount"
                                >   
                                    {{item.amount}}
                                    <template v-slot:input>
                                        <v-text-field
                                            v-model="item.amount"
                                            label="金額"
                                            single-line
                                            type="number"
                                        ></v-text-field>
                                    </template>
                                </v-edit-dialog>
                            </template>

                            <!-- メモ欄編集 -->
                            <template v-slot:item.memo="{item}">
                                <v-edit-dialog
                                    v-model="editDialogPaymentScheduleMemo"
                                    large
                                    @save="savePs(item)"
                                    :return-value.sync="item.memo"
                                >   
                                    {{item.memo}}
                                    <template v-slot:input>
                                        <v-text-field
                                            v-model="item.memo"
                                            label="メモ"
                                            single-line
                                        ></v-text-field>
                                    </template>
                                </v-edit-dialog>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-container>
        </v-tab-item>

        <!-- 入金予定のタブ -->
        <v-tab-item>
            <v-container>
                <v-row>
                    <v-col>
                        <v-app-bar>
                            <v-btn @click="registerComeInRecordsDialog = true">入金予定登録</v-btn>
                            <v-btn @click="deleteAllCis">予定一括削除登録</v-btn>
                            <v-spacer></v-spacer>入金予定合計：{{sumCis}}　入金回数{{cisCount.isNotSelectable}}/{{cisCount.isSelectable + cisCount.isNotSelectable}}
                            <div>
                                <v-dialog v-model="registerComeInRecordsDialog">
                                <v-card>
                                    <v-card-text>
                                        <v-row>
                                            <v-col col="6" xs="6">
                                                <v-date-picker v-model="newSchedule.payment_day"></v-date-picker>
                                            </v-col>
                                            <v-col>
                                                <v-row>
                                                <v-col>
                                                    {{sumPaymentSchedules}}
                                                    {{Number(customer.accounts_receivable) - (Number(customer.deposit) + Number(customer.advance_payment) + Number(customer.temporary_receipt))}}
                                                    必要総額{{Number(sumPaymentSchedules.sumTotal) + Number(customer.accounts_receivable) - (Number(customer.deposit) + Number(customer.advance_payment) + Number(customer.temporary_receipt))}}<br>
                                                    月額ベース：{{sumPaymentSchedules.sumTotal / newSchedule.amount}}回<br>
                                                    回数ベース：{{sumPaymentSchedules.sumTotal / newSchedule.repeat_count}}円
                                                </v-col>
                                                </v-row>
                                                <v-row>
                                                <v-col col="12" xs="12" md="12" lg="12">
                                                    <v-text-field v-model="newSchedule.amount" type="number" label="金額" suffix="　円"></v-text-field>
                                                </v-col>
                                                <v-col col="12" xs="12" md="12" lg="12">
                                                    <v-text-field v-model="newSchedule.repeat_count" type="number" label="繰り返し" suffix="　回"></v-text-field>
                                                </v-col>
                                                <v-col col="12" xs="12" md="12" lg="12">
                                                    <v-select
                                                    v-model="newSchedule.due_date"
                                                    label="支払日"
                                                    :items="dueDate"
                                                    ></v-select>
                                                </v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn @click="postNewScheduleAuto">自動登録</v-btn>
                                        <v-btn @click="postNewSchedule">登録</v-btn>
                                    </v-card-actions>
                                </v-card>
                                </v-dialog>
                            </div>
                        </v-app-bar>
                        <v-data-table
                        v-model="selectedCustomerCis"
                        :headers="customerCisHeaders"
                        :items="customerCis"
                        item-key="come_in_schedules_id"
                        selectable-key="isSelectable"
                        :items-per-page="-1"
                        show-select
                        show-group-by
                        >

                            <!-- 編集スロット 支払い日-->
                            <template v-slot:item.payment_day="{item}">
                                <v-edit-dialog
                                    v-model="editDialogPaymentDay"
                                    large
                                    @save="saveCis(item)"
                                    :return-value.sync="item.payment_day"
                                >   
                                    {{item.payment_day}}
                                    <template v-slot:input>
                                        <v-text-field
                                            v-model="item.payment_day"
                                            label="支払日"
                                            single-line
                                            type="Date"
                                        ></v-text-field>
                                    </template>
                                </v-edit-dialog>
                            </template>

                            <!-- 金額 -->
                            <template v-slot:item.expected_amount="{item}">
                                <v-edit-dialog
                                    v-model="editDialogExpectedAmount"
                                    large
                                    @save="saveCis(item)"
                                    :return-value.sync="item.expected_amount"
                                >   
                                    {{item.expected_amount}}
                                    <template v-slot:input>
                                        <v-text-field
                                            v-model="item.expected_amount"
                                            label="入金金額"
                                            single-line
                                            type="number"
                                        ></v-text-field>
                                    </template>
                                </v-edit-dialog>
                            </template>

                            <!-- メモ -->
                            <template v-slot:item.memo="{item}">
                                <v-edit-dialog
                                    v-model="editDialogMemo"
                                    large
                                    @save="saveCis(item)"
                                    :return-value.sync="item.memo"
                                >   
                                    {{item.memo}}
                                    <template v-slot:input>
                                        <v-text-field
                                            v-model="item.memo"
                                            label="メモ"
                                            single-line
                                            type="text"
                                        ></v-text-field>
                                    </template>
                                </v-edit-dialog>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-container>
        </v-tab-item>

        <!-- 顧客情報のタブ -->
        <v-tab-item>
            <v-card>
                <v-card-text>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-text-field label="受任番号" disabled :value="customer.customer_id"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="LU番号" disabled :value="customer.lu_id"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field label="氏名" v-model="customer.name"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="カナ" v-model="customer.kana"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="口座摘要" v-model="customer.bank_account_name"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row><v-col>
                        <v-textarea label="顧客メモ" outlined v-model="customer.memo" counter="100"></v-textarea>
                    </v-col></v-row>
                </v-container>
                </v-card-text>
                <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="updateCustomerDetail">更新</v-btn>
                </v-card-actions>
            </v-card>
        </v-tab-item>

        <!-- 会計情報 -->
        <v-tab-item>
            <v-card>
                <v-toolbar>
                    <v-btn @click="openMakeSales">売上計上</v-btn>
                </v-toolbar>
            <v-container>
                    <v-row>
                        <v-col>
                            <v-text-field label="債務整理売掛金" disabled suffix=" 円" :value="customer.accounts_receivable"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="支払い済み債務" disabled suffix=" 円" :value="customer.confirm_payment"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field label="預かり金" suffix=" 円" :value="customer.deposit" @click="openEditDepositDialog"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="前受金" suffix=" 円" :value="customer.advance_payment" @click="openEditAdvancePaymentDialog"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="仮受金" suffix=" 円" :value="customer.temporary_receipt" @click="openEditTemporaryDialog"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field label="入金予定金額合計" disabled suffix=" 円" :value="sumCis" ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="予定：必要金額" disabled suffix=" 円" :value="(sumPaymentSchedules.sumTotal)" ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="予定：残債務額合計" disabled suffix=" 円" :value="sumPaymentSchedules.sumAmount" ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="予定：手数料金額(税込)合計" disabled suffix=" 円" :value="sumPaymentSchedules.sumCommission" ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="予定：顧問料(税込)合計" disabled suffix=" 円" :value="sumPaymentSchedules.sumAdvisoryFee" ></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-tab-item>

        <!-- 仕訳情報 -->
        <v-tab-item>
            <v-card>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-app-bar>
                                <v-spacer></v-spacer>
                                <v-btn @click="getJournalBook('journal_book')">検索<v-icon>mdi-magnify</v-icon></v-btn>
                                <v-btn @click="getJournalBook('journal_book_for_receivable')">売掛検索<v-icon>mdi-magnify</v-icon></v-btn>
                            </v-app-bar>
                            <v-data-table
                            :items="journalBook"
                            :headers="journalBookHeaders"
                            :items-per-page="-1"
                            >
                                        <template v-slot:item.memo="{item}">
                                            <v-edit-dialog
                                                v-model="editDialogMemo"
                                                large
                                                @save="saveMemo(item)"
                                                :return-value.sync="item.memo"
                                            >   
                                                {{item.memo}}
                                                <template v-slot:input>
                                                    <v-text-field
                                                        v-model="item.memo"
                                                        label="メモ"
                                                        single-line
                                                    ></v-text-field>
                                                </template>
                                            </v-edit-dialog>
                                        </template>
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
            </v-card>
        </v-tab-item>
        </v-tabs-items>

        <!-- 売上計上のダイアログ -->
        <v-dialog v-model="makeSalesDialog">
            <v-card>
                <v-card-title>売上計上</v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-select :items="whichType" v-model="salesType" label="方針"></v-select>
                            </v-col>
                            <v-col>
                                <v-select :items="salesItems" v-model="makeSales.subaccount" label="売上種別"></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field label="金額(税込み)" type="number" suffix=" 円" v-model="makeSales.amount"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select :items="importFromCreditorItems" v-model="importFromCreditor" return-object label="債権者" item-text="creditor_name" item-value="creditor_id"></v-select>
                            </v-col>
                            <v-col>
                                <v-text-field label="仕訳メモ" v-model="makeSales.memo" hint="債権者IDと名前は自動で入ります。"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="postMakeSales(false)">売上確定</v-btn>
                    <v-btn @click="postMakeSales(true)" color="warning"  v-show="isAdmin">反対仕訳</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <!-- 預り金の編集ダイアログ -->
        <v-dialog v-model="editDepositDialog">
            <v-card>
                <v-card-title>預り金　→　仮受金</v-card-title>
                <v-card-subtitle>
                    預り金残り：{{Number(customer.deposit) - Number(editedDepositValue)}}                
                </v-card-subtitle>
                <v-card-text>
                    <v-text-field label="預り金" type="number" suffix=" 円" v-model="editedDepositValue"></v-text-field>
                    <v-text-field label="仕訳メモ" v-model="editedDepositMemo"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="editedDeposit(false)">インポート</v-btn>
                    <v-btn @click="editedDeposit(true)" color="warning"  v-show="isAdmin">反対仕訳</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- 前受金の編集ダイアログ -->
        <v-dialog v-model="editAdvancePaymentDialog">
            <v-card>
                <v-card-title>前受金　→　仮受金</v-card-title>
                <v-card-subtitle>
                    前受金残り：{{Number(customer.advance_payment) - Number(editedAdvancePaymentValue)}}                
                </v-card-subtitle>
                <v-card-text>
                    <v-text-field label="前受金" type="number" suffix=" 円" v-model="editedAdvancePaymentValue"></v-text-field>
                    <v-text-field label="仕訳メモ" v-model="editedAdvancePaymentMemo"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="editedAdvancePayment(false)">インポート</v-btn>
                    <v-btn @click="editedAdvancePayment(true)" color="warning"  v-show="isAdmin">反対仕訳</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 仮受金の振替ダイアログ -->
        <v-dialog v-model="editTemporaryDialog">
            <v-card>
                <v-tabs v-model="editTemporaryDialogTabs">
                    <v-tab>仮受金→預り金</v-tab>
                    <v-tab>仮受金→売掛金</v-tab>
                    <v-tab><span class="red--text">売掛金→仮受金</span></v-tab>
                    <v-tab>仮受金→本人返金</v-tab>
                </v-tabs>
                <v-tabs-items v-model="editTemporaryDialogTabs">
                    <v-tab-item>
                        <v-card>
                            <v-card-title>仮受金→預り金</v-card-title>
                            <v-card-subtitle>
                                仮受金残り：{{Number(customer.temporary_receipt) - (Number(editedTemporaryValues.deposit) + Number(editedTemporaryValues.advance_payment))}}
                                <v-btn @click="depositAutoTransfer">来月までの</v-btn>
                            </v-card-subtitle>
                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="預かり金" type="number" suffix=" 円" v-model="editedTemporaryValues.deposit"></v-text-field>
                                    </v-col>
                                    <v-col>
                                        <v-text-field label="前受金" type="number" suffix=" 円" v-model="editedTemporaryValues.advance_payment"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field label="仕訳メモ" v-model="editedTemporaryValues.memo"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-actions>
                            <v-spacer></v-spacer>
                                <v-btn @click="editTemporary2deposit">編集</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card>
                            <v-card-title>仮受金→売掛金</v-card-title>
                            <v-card-subtitle>
                                仮受金残り：{{Number(customer.temporary_receipt) - Number(editedTemporaryValues.accounts_receivable)}}
                                売掛金残り：{{Number(customer.accounts_receivable) - Number(editedTemporaryValues.accounts_receivable)}}
                                <v-btn @click="accountsReceivableAutoTransfer">全額</v-btn>
                            </v-card-subtitle>
                            <v-card-text>
                            
                            <v-row>
                                <v-col>
                                    <v-text-field label="売掛金" type="number" suffix=" 円" v-model="editedTemporaryValues.accounts_receivable"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col> 
                                    <v-text-field label="仕訳メモ" v-model="editedTemporaryValues.memo"></v-text-field>
                                </v-col>
                            </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn @click="editTemporary2receivable">編集</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <!-- 売掛金→仮受金 -->
                    <v-tab-item>
                        <v-card>
                            <v-card-title><span class="red--text">売掛金→仮受金</span></v-card-title>
                            <v-card-subtitle>
                                仮受金残り：{{Number(customer.temporary_receipt) - Number(editedTemporaryValues.accounts_receivable)}}
                                売掛金残り：{{Number(customer.accounts_receivable) - Number(editedTemporaryValues.accounts_receivable)}}
                                <strong class="red">※売掛金が増えます。基本的にはやらないでください※</strong>
                            </v-card-subtitle>
                            <v-card-text>
                            <v-row>
                                <v-col>
                                    <v-text-field label="売掛金" type="number" suffix=" 円" v-model="editedTemporaryValues.accounts_receivable"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field label="仕訳メモ" v-model="editedTemporaryValues.memo"></v-text-field>
                                </v-col>
                            </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn v-show="isAdmin" @click="editReceivable2Temporary">編集</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                    <!-- 仮受金→本人返金 -->
                    <v-tab-item>
                        <v-card>
                            <v-card-title><span>仮受金→本人返金</span></v-card-title>
                            <v-card-subtitle>
                                仮受金残り：{{Number(customer.temporary_receipt) - Number(refund.amount)}}
                                <strong class="red">※実際の返金処理は手動で必要です。※</strong>
                            </v-card-subtitle>
                            <v-card-text>
                            <v-row>
                                <v-col>
                                    <v-select label="出金銀行" v-model="refund.bank" :items="refundAccounts"></v-select>
                                    <v-text-field label="返金額" type="number" suffix=" 円" v-model="refund.amount"></v-text-field>
                                    <v-text-field label="出金日" type="date" suffix=" 円" v-model="refund.date"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field label="仕訳メモ" v-model="refund.memo"></v-text-field>
                                </v-col>
                            </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn v-show="isAdmin" @click="doRefund">編集</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </v-card>
        </v-dialog>
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
const moment = require('moment')
export default {
    layout : 'pa',
    data(){
        return{
            customerId:0,
            customer:{},
            customerCis:[],
            paymentSchedules:[],
            sumPaymentSchedules:{},
            selectedPs:[],
            //dialog関係
            dialog:false,
            createScheduleDialog:false,
            registerComeInRecordsDialog:false,
            editTemporaryDialog:false,
            editDialogPaymentScheduleDate:false,
            editDialogPaymentScheduleAmount:false,
            editDialogPaymentScheduleMemo:false,
            editDialogPaymentDay:false,
            editDialogExpectedAmount:false,
            editDialogMemo:false,

            /////売上計上///////////
            makeSalesDialog:false,
            makeSales:{subaccount:'',amount:'',memo:''},
            salesType:'',
            whichType:['債務整理','過払い','破産'],
            importFromCreditor:{},
            //////////
            /////預り金編集関係/////
            editDepositDialog:false,
            editedDepositValue:0,
            editedDepositMemo:'',
            //////////
            /////前受金編集関係/////
            editAdvancePaymentDialog:false,
            editedAdvancePaymentValue:0,
            editedAdvancePaymentMemo:'',
            //////////
            /////仮受金
            refund:{amount:0,date:moment().format('YYYY-MM-DD'),memo:'',bank:'ﾐﾂｲｽﾐﾄﾓ'},
            refundAccounts:['ﾐﾂｲｽﾐﾄﾓ','四国','ペイペイ'],
            //////////////////////////
            targetText:'',
            activePicker:false,
            startDate:'',
            tabs:null,
            editTemporaryDialogTabs:null,
            registerTabs:null,
            //Form data
            // customer:{},
            creditor:'',
            totalAmount:null,
            monthlyAmount:null,
            numberOfPayments:null,
            monthlyPaymentDueDate:'',
            firstAmount:'初回',
            delayedInterestRate:0,
            typeOfDelay:'2回',
            //irregular
            irregular:false,
            pension:'',
            interest:false,
            bonus:false,
            addition:false,
            commission:1000,
            advisoryFee:500,
            accountComment:'',
            //口座部分
            bankname:'',
            bankcode:null,
            branchname:'',
            branchcode:null,
            kind:null,
            accountNumber:'',
            accountHolder:'',

            //Bonus詳細
            summerBonusAmount:null,
            summerBonusDate:null,
            winterBonusAmount:null,
            winterBonusDate:null,

            //items
            dueDate:['末日',1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
            banks:[],
            summer:[4,5,6,7,8,9],
            winter:[10,11,12,1,2,3],
            typeOfDelayArray:['2回','2回分','1回','1回分','3回','3回分','その他'],
            pensionValues:['偶数','奇数',''],
            selectedAccount:{},
            progressItems:['代行中(整理済み)','代行中(整理途中)','業務終了(全社完済)','業務終了(途中辞任)','業務終了(自己返済)'],
            //snack bar
            snack:'',
            snackColor:'',
            snackText:'',

            // ここから和解内容

            //和解内容編集ダイアログ用
            registerOrUpdate:true,       //trueは新規登録 falseはupdate
            updateTargetId:'',           //OPENする時にPA_IDを一時保管して置くためのID
            /////////////////////

            //支払い予定の部分用
            schedules:[],
            schedulesHeaders:[
                {text:'日付',   value:'date'},
                {text:'金額',   value:'amount'},
            ],
            filterPs:'',    //出金予定のフィルター用検索文字列
            paymentSchedulesHeaders:[
                {text:'date',     value:'date'},
                {text:'実入金日', value:'paid_date'},
                {text:'債権者',   value:'creditor_name'},
                {text:'金額',     value:'amount'},
                {text:'顧問料',   value:'advisory_fee'},
                {text:'手数料',   value:'commission'},
                {text:'メモ',     value:'memo'}
            ],

            //入金予定の部分用
            newSchedule:{
                payment_day:null,
                repeat_count:1,
                due_date:'末日',
                amount:1000
            },
            sumCis:0,
            cisCount:{isSelectable:0,isNotSelectable:0},
            customerCisHeaders:[
                {text:'予定日',         value:'payment_day'},
                {text:'実入金日',       value:'actual_deposit_date'},
                {text:'実入金額',       value:'actual_deposit_amount'},
                {text:'予定金額',       value:'expected_amount'},
                {text:'メモ',       value:'memo'},
            ],
            selectedCustomerCis:[],
            updateValue:{},
            editedTemporaryValues:{deposit:0,advance_payment:0,temporary_receipt:0, accounts_receivable:0,memo:''},
            
            ////////////////////////
            //journal_book用
            journalBook:[],
            journalBookHeaders:[
                { text:'元帳',              value:'motocho'},
                { text:'日付',              value:'accounting_date'},
                { text:'借方勘定科目',      value:'debit_account'},
                { text:'借方勘定補助科目',  value:'debit_subaccount'},
                { text:'貸方勘定科目',      value:'credit_account'},
                { text:'貸方勘定補助科目',  value:'credit_subaccount'},
                { text:'借方',              value:'debit'},
                { text:'貸方',              value:'credit'},
                { text:'番号',              value:'customer_id'},
                { text:'名前',              value:'name'},
                { text:'メモ',              value:'memo'},
            ],
            editDialgMemo:false,

            ////▲▲▲▲▲▲▲▲▲////////////
            //validate rules
            required: value => !!value || "必ず入力してください",
            limit_length: value => value.length <= 10 || "10文字以内です。",
            num:value => !isNaN(value) || "数値のみ可" 
        }
    },
    computed:{
        customers(){
            return this.$store.getters['pa/getCustomers']
        },
        creditors(){
            return this.$store.getters['getCreditors']
        },

        //和解登録時の口座関係を良い感じに加工するやーつ。
        accounts(){
            const data = this.banks.filter((account)=>{
                return account.creditor_id == this.creditor
            })
            const givenData = data.map((account)=>{
                account.selectItem = account.bankname + ':' + account.bankcode + ' / ' + account.branchname + ':' + account.branchcode + '/口座種別:' + account.kind + '/'+ account.account_holder
                return account
            })
            console.log(givenData)
            return givenData
        },
        contentsOfSettlements(){
            return this.$store.getters['pa/getContentsOfSettlements']
        },
        importFromCreditorItems(){
            const item = {creditor_id:'0',creditor_name:'その他'}
            let settle = this.$store.getters['pa/getContentsOfSettlements'].map(ele=>{return ele})
            settle.push(item)
            return settle
        },
        isAdmin(){
            return this.$auth.user ? (this.$auth.user.isAdmin === 1 ? true : false ) : false
        },
        salesItems(){
            let salesItem = []
            switch(this.salesType){
                case '債務整理':
                    salesItem.push('着手金(債)','成功報酬(債)','事務手数料(債)','出張費用(債)','裁判費用(債)','内容証明(債)','代行手数料','顧問料')
                break
                case '過払い':
                    salesItem.push('基本報酬(過)','減額報酬(過)','回収報酬(過)','事務手数料(過)','裁判費用(過)','出張費用(過)','強制執行(過)','相続人調査費用(過)','遺産分割協議書作成費用(過)')
                break
                case '破産':
                    salesItem.push('破産申立','個人再生申立','立替金(破産)')
                break
            }
            return salesItem
        }
    },
    methods:{
        refreshCustomer(){
        this.$axios.get('api/payment_agency/customer/detail',{params:{id:this.$route.params.id}})
            .then((response)=>{this.customer = response.data[0]})
        },
        refresheditedTemporaryValues(){
            this.editedTemporaryValues = {deposit:0,advance_payment:0,temporary_receipt:0, accounts_receivable:0,memo:''}
        },
        searchCustomer(){
            this.$store.dispatch('pa/searchCustomers',this.targetText)
        },
        goCustomerPage(e){
           this.$router.push('/payment_agency/customers/'+ Number(e.customer_id))
        },
        goback(){
            this.$router.push('/payment_agency/customers')
        },
        getPaymentSchedules(){
            this.$axios.get('api/payment_agency/customer/payment_schedules',{params:{ id:this.customerId, from:null, until:null, isPaidDate:null, isExpectedDate:null }})
            .then(response=>{
                const ps = response.data
                let sumAmount     = 0
                let sumAdvisoryFee = 0
                let sumCommission  = 0
                const filterd = ps.map(item=>{
                    if(item.expected_date === null){
                        item.isSelectable = true
                        sumAmount      += item.amount
                        sumAdvisoryFee += item.advisory_fee * 1.1
                        sumCommission  += item.commission * 1.1
                    } else {
                        item.isSelectable = false
                    }
                    return item
                })
                console.log('sumamount',sumAmount)
            this.sumPaymentSchedules = {sumAmount:sumAmount, sumAdvisoryFee:sumAdvisoryFee, sumCommission:sumCommission,sumTotal:sumAmount+sumAdvisoryFee+sumCommission}
            this.paymentSchedules = filterd
            })

        },
        getCustomerCis(){
            //select可能かどうかのpropsを追加して返す。
            this.$axios.get('api/payment_agency/customer/cis',{params:{id:this.customerId}})
            .then(response=>{
                const cis = response.data
                const count = {isSelectable:0,isNotSelectable:0}
                const filterd = cis.map(item=>{
                    if(item.come_in_records_id === null){
                        item.isSelectable = true
                        this.sumCis += Number(item.expected_amount)
                        count.isSelectable++
                    } else {
                        item.isSelectable = false
                        count.isNotSelectable++
                    }
                    return item
                })
            this.cisCount = count
            this.customerCis = filterd
            })
        },
        postNewAccount(){
            //口座（和解）の新規登録処理
            if(this.accountNumber == ''){return alert('入力が不完全です')}
            const data = [
                parseInt(this.customer.customer_id,10),
                this.creditor,
                this.totalAmount,
                this.monthlyAmount,
                this.numberOfPayments,
                this.monthlyPaymentDueDate,
                this.firstAmount,
                this.startDate,
                this.typeOfDelay,
                this.delayedInterestRate,
                this.irregular,
                this.pension,
                this.interest,
                this.bonus,
                this.addition,
                this.commission,
                this.advisoryFee,
                this.accountComment,
                this.selectedAccount.bankcode,
                this.selectedAccount.branchcode,
                this.selectedAccount.kind,
                this.accountNumber,
                this.selectedAccount.account_holder,
                this.summerBonusAmount,
                this.summerBonusDate,
                this.winterBonusAmount,
                this.winterBonusDate
            ]
            this.$axios.post('/api/payment_agency/new_account',data).then(response =>{
                console.log(response)
                if(response.data.error){
                    return alert(response.data.message)
                }
                this.dialog = false
                alert('登録が終わりました!')
                location.reload()
            })
        },

        //支払い予定を作成する際に「予定作成」ボタンを推した時の処理。
        createPaymentSchedules(index){
            this.createScheduleDialog = true
            const settle = this.contentsOfSettlements[index]
            let schedules =[{paymentAccountId:settle.payment_account_id,amount:settle.first_amount,date:moment(settle.start_date).format('YYYY/MM/DD')}]
            const duedate = settle.monthly_payment_due_date === '末日'? 31 : settle.monthly_payment_due_date
            let baseDate = moment(settle.start_date)
            for(let i = 2; i <= settle.number_of_payments; i++){
                let nextDate = moment(baseDate).add(i-1,'month').format('YYYY/MM/DD')
                if(duedate == 31){
                    nextDate = moment(nextDate).endOf('month').format('YYYY/MM/DD')
                }
                schedules.push(
                    {
                        paymentAccountId:settle.payment_account_id,
                        amount:settle.monthly_amount,
                        date:nextDate
                    }
                )
            }
            console.log(schedules)
            //最終回だけ端数計算して数字を変更する。
            const total = settle.total_amount
            const num = settle.number_of_payments-2
            const subtotal = settle.monthly_amount * num + settle.first_amount
            console.log(subtotal)
            const lastAmount = total - subtotal
            schedules[schedules.length-1].amount = lastAmount
            this.schedules = schedules
        },

        //支払い予定をＤＢ登録する処理。
        registerPaymentSchedules(){
            //登録して良いかのValidation組む必要があるが、まず  は登録する。最悪あとから編集の方を先に作ればOKのはず。
            // let data = this.schedules.map(ele => [ele.paymentAccountId,ele.amount,ele.date])
            // console.log(data)
            this.$axios.post('api/payment_agency/customer/register_payment_schedules',this.schedules)
            .then(response =>{
                if(response.data.errno){
                    return alert('DB Error: \nCode: '+ response.data.code +'\neErrNo: '+ response.data.errno +'\nMes: '+ response.data.sqlMessage)
                }
                alert('登録が終わりました!')
                this.getPaymentSchedules()
                this.createScheduleDialog = false
                this.tabs = 1
            })
        },

        //Payment schedules の削除
        deleteAllPs(){
            const doOrNot = confirm('本当に削除しますか？')
            if(doOrNot === false ){ return }
            let ids = new Array()
            this.selectedPs.forEach(item=> {return ids.push(item.payment_schedule_id)})
            this.$axios.delete('/api/payment_agency/customer/payment_schedules',{data:{id:ids,customerId:this.customer.customer_id}})
            .then((response)=>{
                if(response.data.error){ return alert(response.data.message)}
                console.log(response.data)
                alert(response.data.affectedRows + '件削除しました。')
                this.selectedPs = []
                const option ={id:this.customer.customer_id,from:null,until:null}
                this.getPaymentSchedules()
            })
        },

        //Come In Schedulesの削除
        deleteAllCis(){
            const doOrNot = confirm('本当に削除しますか？')
            if(doOrNot === false ){ return }
            let ids = new Array()
            this.selectedCustomerCis.forEach(item=> {return ids.push(item.come_in_schedules_id)})
            this.$axios.delete('/api/payment_agency/customer/cis',{data:{id:ids,customerId:this.customer.customer_id}})
            .then((response)=>{
                if(response.data.error){ return alert(response.data.message)}
                console.log(response.data)
                alert(response.data.affectedRows + '件削除しました。')
                this.selectedCustomerCis = []
                this.getCustomerCis()
            })
        },

        //支払い予定の作成
        postNewScheduleAuto(){
            const total = this.sumPaymentSchedules.sumTotal + Number(this.customer.accounts_receivable) - (Number(this.customer.deposit) + Number(this.customer.advance_payment) + Number(this.customer.temporary_receipt))
            const monthly  = this.newSchedule.amount
            const number   = Math.ceil(total / monthly)
            const fraction = total % monthly
            if(number > 120){ return this.popupSnackBar('Error!! 自動で一度に立てられるのは120回までです!!','warning')}
            const doNot = !confirm('毎月 ' + monthly + '円を　'+(number - 1)+'回\n最後に端数'+fraction+'円の\n合計' + number + '回で予定を立てますか？')
            if(doNot){ return this.popupSnackBar('キャンセルしました。','warning')}
                this.newSchedule = {amount:monthly,repeat_count:number,payment_day:this.newSchedule.payment_day,due_date:this.newSchedule.due_date}
                
                //ここからはpostNewScheduleをコピー
            const newSchedule = this.newSchedule
            if(newSchedule.payment_day === null){ return this.popupSnackBar('日付が選択されてません！','warning')}
            //予定を回数分作る
            let schedules =[{
                id:this.customer.customer_id,
                amount:newSchedule.amount,
                date:moment(newSchedule.payment_day).format('YYYY/MM/DD')
            }]
            const duedate = newSchedule.due_date === '末日'? 31 : newSchedule.due_date
            let baseDate = moment(newSchedule.payment_day)
            const year = baseDate.year()
            const month = baseDate.month()+1
            console.log(schedules)
            let nextDate = moment(year+'/'+month+'/'+duedate).format('YYYY/MM/DD')
            for(let i = 2; i <= newSchedule.repeat_count; i++){
                nextDate = moment(baseDate).add(i-1,'month').format('YYYY/MM/DD')
                schedules.push(
                    {
                        id:this.customer.customer_id,
                        amount:newSchedule.amount,
                        date:nextDate
                    }
                )
            }
            //autoの処理として最終回の支払い金額を端数に変更する。
            schedules[schedules.length-1].amount = fraction
            /////////////
            console.log(schedules)
            this.$axios.post('/api/payment_agency/customer/cis',schedules)
            .then((response)=>{
                if(response.data.error){return alert(response.data.message)}
                this.registerComeInRecordsDialog = false
                this.getCustomerCis()
                this.popupSnackBar('登録しました')
            })
                ///////////ここまで///////////////
        },
        postNewSchedule(){
            const newSchedule = this.newSchedule
            if(newSchedule.payment_day === null){ return this.popupSnackBar('日付が選択されてません！','warning')}
            //予定を回数分作る
            let schedules =[{
                id:this.customer.customer_id,
                amount:newSchedule.amount,
                date:moment(newSchedule.payment_day).format('YYYY/MM/DD')
            }]
            const duedate = newSchedule.due_date === '末日'? 31 : newSchedule.due_date
            let baseDate = moment(newSchedule.payment_day)
            const year = baseDate.year()
            const month = baseDate.month()+1
            console.log(schedules)
            let nextDate = moment(year+'/'+month+'/'+duedate).format('YYYY/MM/DD')
                        for(let i = 2; i <= newSchedule.repeat_count; i++){
                nextDate = moment(baseDate).add(i-1,'month').format('YYYY/MM/DD')
                schedules.push(
                    {
                        id:this.customer.customer_id,
                        amount:newSchedule.amount,
                        date:nextDate
                    }
                )
            }
            console.log(schedules)
            this.$axios.post('/api/payment_agency/customer/cis',schedules)
            .then((response)=>{
                if(response.data.error){return alert(response.data.message)}
                this.registerComeInRecordsDialog = false
                this.getCustomerCis()
                this.popupSnackBar('登録しました')
            })
        },
        /////////売上編集ダイアログ//////////////////////////////////////////////////////
        openMakeSales(){
            this.makeSalesDialog = true
        },
        postMakeSales(e){
            if(this.makeSales.amount <= 0 || this.importFromCreditor === ''){return alert('数字が空？\nもしくは読込元を選択してください。')}
            let doNot = !confirm('本当に登録しますか？')
            if(doNot){ return alert('キャンセル')}
            const memoStrings = '[' + this.importFromCreditor.creditor_id + ':' + this.importFromCreditor.creditor_name + '] '+ this.makeSales.memo
            let data = {amount:this.makeSales.amount, memo:memoStrings, customerId:this.customerId, subaccount:this.makeSales.subaccount,creditorsId:this.importFromCreditor.creditor_id}
            if(e){
                data.option = true
                doNot = !confirm('これは反対仕訳です、間違いありませんか？')
            }
            if(doNot ){ return alert('キャンセル')}
            this.$axios.post('api/payment_agency/customer/make_sales/',data)
            .then(response=>{
                if(response.data.error){ return alert(response.data.message)}
                this.popupSnackBar(response.data)
                this.refreshCustomer()
                this.makeSales = {subaccount:'',amount:'',memo:''}
                this.editReceivableDialog = false
                this.importFromCreditor = ''
                this.salesType = ''
            })
        },
        ////////////////////////////////////////////////

        /////////預り金編集ダイアログ関係///////////////////////////////////////
        openEditDepositDialog(){
            this.editDepositDialog = true
        },
        editedDeposit(e){
            if(this.editedDepositValue === 0 ){return alert('数字が空？')}
            let doNot = !confirm('本当に登録しますか？')
            if(doNot){ return alert('キャンセル')}
            let data = {value:this.editedDepositValue, memo:this.editedDepositMemo, customerId:this.customerId,importFrom:this.importFrom}
            if(e){
                data.option = true
                doNot = !confirm('これは反対仕訳です、間違いありませんか？')
            }
            if(doNot ){ return alert('キャンセル')}
            this.$axios.post('api/payment_agency/customer/editedDeposit',data)
            .then(response=>{
                if(response.data.error){ return alert(response.data.message)}
                this.popupSnackBar(response.data)
                this.refreshCustomer()
                this.editDepositDialog = false
                this.editedDepositValue = 0
            })
        },
        ////////////////////////////////////////////////

        /////////前受金編集ダイアログ関係///////////////////////////////////////
        openEditAdvancePaymentDialog(){
            this.editAdvancePaymentDialog = true
        },
        editedAdvancePayment(e){
            if(this.editedAdvancePaymentValue === 0 ){return alert('数字が空？')}
            let doNot = !confirm('本当に登録しますか？')
            if(doNot){ return alert('キャンセル')}
            let data = {value:this.editedAdvancePaymentValue, memo:this.editedAdvancePaymentMemo, customerId:this.customerId,importFrom:this.importFrom}
            if(e){
                data.option = true
                doNot = !confirm('これは反対仕訳です、間違いありませんか？')
            }
            if(doNot ){ return alert('キャンセル')}
            this.$axios.post('api/payment_agency/customer/editedAdvancePayment',data)
            .then(response=>{
                if(response.data.error){ return alert(response.data.message)}
                this.popupSnackBar(response.data)
                this.refreshCustomer()
                this.editAdvancePaymentDialog = false
                this.editedAdvancePaymentValue = 0
            })
        },
        ////////////////////////////////////////////////

        //仮受金編集ダイアログ関係///////////////////////
        openEditTemporaryDialog(){
            this.editedTemporaryValues.temporary_receipt = this.customer.temporary_receipt
            this.editTemporaryDialog = true
            console.log('openeditTemporaryDialog')
            this.registerOrUpdate = true
        },
        editTemporary2deposit(){
            if(this.editedTemporaryValues.advance_payment === 0 && this.editedTemporaryValues.deposit === 0){ return alert('両方ともゼロ円です。')}
            const customer = this.customer
            let ev = this.editedTemporaryValues
            //入力された前受金と預り金　= 合計
            const total = Number(ev.advance_payment) + Number(ev.deposit)
            //仮受金-合計＝DiffResult
            const diffResult = Number(customer.temporary_receipt) - total
            ev.temporary_receipt = total
            ev.customerId = customer.customer_id
            console.log('ev:',ev)
            console.log(customer.temporary_receipt,total,diffResult)
            if(diffResult >= 0 ){
                this.$axios.post('api/payment_agency/customer/temp2deposit',ev)
                .then(response=>{
                    this.popupSnackBar(response.data)
                    this.refreshCustomer()
                    this.refresheditedTemporaryValues()
                    this.editTemporaryDialog = false
                    })
            } else {
                console.log(ev)
                alert('編集しません。')
            }
        },
        editTemporary2receivable(){
            if( this.editedTemporaryValues.accounts_receivable === 0){ return alert('ゼロ円です。')}
            const customer = this.customer
            let ev = this.editedTemporaryValues
            const diffResult = Number(customer.temporary_receipt) - ev.accounts_receivable
            ev.temporary_receipt = ev.accounts_receivable
            ev.customerId = customer.customer_id
            console.log('ev:',ev,'diffResult >= 0',diffResult >= 0,'customer.temporary_receipt !== ev.temporary_receipt',customer.temporary_receipt !== ev.temporary_receipt)
            if(diffResult >= 0){
                this.$axios.post('api/payment_agency/customer/temp2receivable',ev)
                .then(response=>{
                    this.popupSnackBar(response.data)
                    this.refreshCustomer()
                    this.refresheditedTemporaryValues()
                    this.editTemporaryDialog = false
                    })
            } else {
                console.log(ev)
                alert('編集しません。')
            }
        },
        editReceivable2Temporary(){
            const result = confirm('本当によろしいですか？')
            if(result){
            const customer = this.customer
            let ev = this.editedTemporaryValues
            ev.temporary_receipt = ev.accounts_receivable
            ev.customerId = customer.customer_id
            if(customer.temporary_receipt !== ev.temporary_receipt){
                this.$axios.post('api/payment_agency/customer/receivable2Temporary',ev)
                .then(response=>{
                    this.popupSnackBar(response.data)
                    this.refreshCustomer()
                    this.refresheditedTemporaryValues()
                    this.editTemporaryDialog = false
                })
            } else {
                console.log(ev)
                alert('編集しません。')
            }
            }
        },
        //一ヶ月以内の支払い金額の自動計算ホタン
        depositAutoTransfer(){
            const receipt = Number(this.customer.temporary_receipt)
            const filterdSchedules = this.paymentSchedules.filter(item=>{
                const date = moment(item.date)
                if(date.isBefore(moment().add(1,'M')) && item.paid_date === null ){
                    return true
                }
            })
            let deposit = 0
            let advance_payment = 0
            filterdSchedules.forEach(item=>{
                deposit += item.amount
                advance_payment += Number(item.commission) * 1.1
                advance_payment += Number(item.advisory_fee) * 1.1
            })
            console.log(filterdSchedules)
            this.editedTemporaryValues.deposit = deposit
            this.editedTemporaryValues.advance_payment = advance_payment
        },
        //売掛金の残りを自動挿入
        accountsReceivableAutoTransfer(){
            //売掛金 > 仮受金
            console.log(this.customer.accounts_receivable,this.customer.temporary_receipt)
            if(Number(this.customer.accounts_receivable) > this.customer.temporary_receipt){
                this.editedTemporaryValues.accounts_receivable = Number(this.customer.temporary_receipt)
            } else {
                this.editedTemporaryValues.accounts_receivable = this.customer.accounts_receivable
            }
        },
        doRefund(){
            const doNot = !confirm('編集しますか？')
            if(doNot){ return }
            const data = {amount:this.refund.amount,memo:this.refund.memo,customerId:this.customerId,date:this.refund.date+' 00:00:00',bank:this.refund.bank}
            this.$axios.post('api/payment_agency/customer/refund',data)
            .then(response=>{
                if(response.data.error){
                    this.popupSnackBar('失敗しました。','warning')
                    alert(response.data.message)
                    return
                    }
                this.popupSnackBar(response.data)
                this.refreshCustomer()
                this.editTemporaryDialog = false
            })
        },
        ///////仮受金の話はここまで/////////////////////////////////////////////////////////////
        saveCis(e){
            console.log(e)
            const doNot = !confirm('編集しますか？')
            if(doNot){ return }
            this.$axios.put('api/payment_agency/customer/cis',e)
            .then(response=>{
                if(response.data.error){
                     alert(response.data.message)
                    this.popupSnackBar('失敗しました。','warning')
                     }
                this.popupSnackBar('成功しました。')
            })
        },
        savePs(e){
            console.log(e)
            const doNot = !confirm('編集しますか？')
            if(doNot){ return }
            this.$axios.put('api/payment_agency/customer/payment_schedules',e)
            .then(response=>{
                if(response.data.error){
                     alert(response.data.message)
                    this.popupSnackBar('失敗しました。','warning')
                     }
                this.popupSnackBar('成功しました。')
            })
        },
        updateProgress(){
            this.$axios.put('api/payment_agency/customer/progress',{id:this.customer.customer_id, progress:this.customer.progress})
            .then((response)=>{
                if(response.data.error){ return alert(response.data.message)}
                console.log(response)
                this.popupSnackBar('進捗を変更しました。')
            })
        },
        updateCustomerDetail(){
            console.log(this.customer)
            this.$axios.put('api/payment_agency/customer/detail',{customer:this.customer})
            .then((response)=>{
                if(response.data.error){ return alert(response.data.message)}
                console.log(response)
                this.popupSnackBar('進捗を変更しました。')
            })
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
        },
        openEditSettlementUpdateDialog(e){
            this.dialog = true
            this.registerOrUpdate = false
            this.selectedAccount.bankcode = e.bankcode
            this.selectedAccount.branchcode = e.branchcode
            this.selectedAccount.kind = e.kind
            this.accountNumber = e.account_number
            this.selectedAccount.account_holder = e.account_holder
                this.customer.customer_id = e.customer_id
                this.creditor = e.creditor_id
                this.totalAmount = e.total_amount
                this.monthlyAmount = e.monthly_amount
                this.numberOfPayments = e.number_of_payments
                this.monthlyPaymentDueDate = e.monthly_payment_due_date
                this.firstAmount = e.first_amount
                this.startDate = e.start_date
                this.typeOfDelay = e.type_of_delay
                this.delayedInterestRate = e.delayed_interest_rate
                this.irregular = e.irregular
                this.pension = e.pension
                this.interest = e.interest
                this.bonus = e.bonus
                this.addition = e.addition
                this.commission = e.commission
                this.advisoryFee = e.advisory_fee
                this.accountComment = e.account_cmment
                this.summerBonusAmount = e.summer_bonus_amount
                this.summerBonusDate   = e.summer_bonus_month
                this.winterBonusAmount = e.winter_bonus_amount
                this.winterBonusDate   = e.winter_bonus_month
            //
            this.updateTargetId = e.payment_account_id
        },
        updateNewAccount(){
            //口座（和解）の新規登録処理
            if(this.accountNumber == ''){return alert('入力が不完全です')}
            const data = [
                parseInt(this.customer.customer_id,10),
                this.creditor,
                this.totalAmount,
                this.monthlyAmount,
                this.numberOfPayments,
                this.monthlyPaymentDueDate,
                this.firstAmount,
                this.startDate,
                this.typeOfDelay,
                this.delayedInterestRate,
                this.irregular,
                this.pension,
                this.interest,
                this.bonus,
                this.addition,
                this.commission,
                this.advisoryFee,
                this.accountComment,
                this.selectedAccount.bankcode,
                this.selectedAccount.branchcode,
                this.selectedAccount.kind,
                this.accountNumber,
                this.selectedAccount.account_holder,
                this.summerBonusAmount,
                this.summerBonusDate,
                this.winterBonusAmount,
                this.winterBonusDate,
                //登録時と違って、最後にPA＿idを入れる必要がある。
                this.updateTargetId
            ]
            this.$axios.put('/api/payment_agency/payment_account',data).then(response =>{
                console.log(response)
                if(response.data.error){
                    return alert(response.data.message)
                }
                this.dialog = false
                alert('更新が終わりました!')
                location.reload()
            })
        },
        ///////////////////////////////////////
        //journal_book
        getJournalBook(table){
            const options = {
                until:null,
                from:null,
                table:table,
                customerId:this.customerId
            }
            this.$axios.get('api/payment_agency/journal_book/',{params:{options:options}})
            .then((response)=>{
                console.log('response:',response)
                if(response.data.error){ return response.data.message }
                this.journalBook = response.data
            })
        },
        //journal_bookのメモ編集用
        saveMemo(e){
        console.log(e)
        e.options = Object.keys(e)[0]
        const doNot = !confirm('編集しますか？')
        if(doNot){ return }
        this.$axios.put('api/payment_agency/journal_book',e)
        .then(response=>{
            if(response.data.error){
                console.log(response.data)
                alert(response.data.message)
                this.popupSnackBar('失敗しました。','warning')
            }
            console.log(response.data)
            this.popupSnackBar(response.data)
            })
        },
    },
    created(){
        (async()=>{
        const id = this.$route.params.id
        this.customerId = id
        const options = {
            searchType:'jyunin'
        }
        this.getCustomerCis()
        this.getPaymentSchedules()
        await this.$store.dispatch('pa/searchCustomers',{targetText:id,options:options})
        await this.$store.dispatch('getDbCreditors')
        await this.$store.dispatch('pa/getDbCreditorsAccounts')
        await this.$store.dispatch('pa/getDbContentsOfSettlements',id)
        this.refreshCustomer()
        this.banks = await this.$store.getters['pa/getCreditorsAccounts']
        this.newSchedule.customer_id = id
        })()
    }
}
</script>