<template>
    <div>
        <v-row justify="center" aligh-content="center">
            <v-col cols=12 sm=8 md=8 lg=5 xl=12 >
        <v-card>
            <v-toolbar color="accent">
            <v-toolbar-title>業務報告書</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="routerPush('/tools/tools_index')">戻る</v-btn>
            </v-toolbar>
            <v-card-title>
                <v-select 
                filled
                :items="division"
                label="所属"
<<<<<<< HEAD
                v-model="selectedDivision"
                :options="$auth.user ? $auth.user.division : null"
                ></v-select>
                </v-card-title>
=======
                v-model="selectedDivision"></v-select>
            </v-card-title>
>>>>>>> main
            <v-card-text>
                <v-form ref="form" @submit.prevent>
                    <!-- 新規用 -->
                    <v-row v-show="selectedDivision === '新規'? true :false">
                        <v-col>
                            <v-text-field
                            v-model="counter.shinki.kaden"
                            label="架電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.shinki.jyuden"
                            label="受電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.shinki.seiyaku"
                            label="成約"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- 調査 -->
                    <v-row v-show="selectedDivision === '調査'? true :false">
                        <v-col>
                            <v-text-field
                            v-model="counter.chousa.keisan"
                            label="計算"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.chousa.kaden"
                            label="架電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.chousa.kaihuu"
                            label="郵便開封"
                            type="number"
                            suffix="分"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.chousa.bantuke"
                            label="番付"
                            type="number"
                            suffix="分"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <!-- 中決/交面 -->
                    <v-row v-show="isChuketuKomen">
                        <v-col>
                            <v-text-field
                            v-model="counter.chuketuKomen.chuketu"
                            label="中決"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.chuketuKomen.kaden"
                            label="交面架電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.chuketuKomen.jisseki"
                            label="交面実績"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.chuketuKomen.ishikaku"
                            label="意思確"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- 交渉 -->
                    <v-row v-show="selectedDivision === '交渉'? true :false">
                        <v-col>
                            <v-text-field
                            v-model="counter.koushou.kaden"
                            label="架電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.koushou.jyuden"
                            label="受電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.koushou.wakai"
                            label="和解"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.koushou.saikoushou"
                            label="再交渉"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- 完了 -->
                    <v-row v-show="selectedDivision === '完了'? true :false">
                        <v-col>
                            <v-text-field
                            v-model="counter.kanryou.kaden"
                            label="架電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.kanryou.jyuden"
                            label="受電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.kanryou.kanryoushorui"
                            label="完了書類作成"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- 債務整理 -->
                    <v-row v-show="selectedDivision === '債務整理'? true :false">
                        <v-col>
                            <v-text-field
                            v-model="counter.saimuseiri.kaden"
                            label="架電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.saimuseiri.jyuden"
                            label="受電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.saimuseiri.chat"
                            label="チャット"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.saimuseiri.chousa"
                            label="調査"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.saimuseiri.ginkou"
                            label="銀行"
                            type="number"
                            suffix="分"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-textarea
                            v-model="report"
                            :hint="divisionFormat.hint"
                            label="メモ">
                            </v-textarea>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="submit">送信</v-btn>
            </v-card-actions>
        </v-card>
        </v-col>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    auth:true,
    data() {
        return {
            name:'',
            counter:{},
            selectedDivision:{},
            division:[
                { text:"新規", value:"新規"},
                { text:"調査", value:"調査"},
                { text:"中決", value:"中決"},
                { text:"交面", value:"交面"},
                { text:"交渉", value:"交渉"},
                { text:"完了", value:"完了"},
                { text:"債務整理", value:"債務整理"},
                ],
            //各課の件数カウント用　わかりづらいので、OBJECTにして一つにまとめます。
            counter:{
                shinki:         {kaden:'', jyuden:'', seiyaku:'',},
                chousa:         {keisan:'', kaden:'', kaihuu:'', bantuke:''},
                chuketuKomen:   {chuketu:'', kaden:'', jisseki:'', ishikaku:''},
                koushou:        {kaden:'', jyuden:'', wakai:'', saikoushou:''},
                kanryou:        {kaden:'', jyuden:'', kanryoushorui:''},
                saimuseiri:     {kaden:'', jyuden:'', chat:'', chousa:'', ginkou:''}
            },
            report:''
        }
    },
    methods:{
            routerPush(path){
                this.$router.push(path)
            },
            submit(){
                const result = window.confirm(this.selectedDivision + '宛です。\n本当に送信しますか？')
                if(result){
                let body = "[info][title]" + this.name + "[/title]"
                let counterStrings = ''
                switch(this.selectedDivision){
                    case '新規':
                        counterStrings = '架電：'+ this.counter.shinki.kaden +'受電：'+ this.counter.shinki.jyuden+'件\n成約：'+ this.counter.shinki.seiyaku +'件'
                        break;
                    case '調査':
                        counterStrings  = '計算：'+ this.counter.chousa.keisan +'件\n架電：'+this.counter.chousa.kaden+'件\n郵送開封：'+this.counter.chousa.kaihuu+'分\n番付：'+ this.counter.chousa.bantuke +'分\n[hr]業務報告\n'
                        break;
                    case '交面':
                        counterStrings = '中決：'+ this.counter.chuketuKomen.chuketu +'件\n交面架電：'+ this.counter.chuketuKomen.kaden +'件\n交面実績：' + this.counter.chuketuKomen.jisseki + '件\n意思確認：'+ this.counter.chuketuKomen.ishikaku +'件\n[hr]業務報告\n'
                        break;
                    case '交渉':
                        counterStrings = '交渉架電：'+this.counter.koushou.kaden+'件\n交渉受電：'+ this.counter.koushou.jyuden +'件\n和解：' + this.counter.koushou.wakai + '件\n再交渉：'+ this.counter.koushou.saikoushou + '件\n[hr]業務報告\n'
                        break;
                }

                    body = body + '[info]' + counterStrings + '[/info][hr]業務報告\n' + this.report + "[/info]"
                    axios.post('/api/cw/send',{
                        content: body,
                        division:this.selectedDivision
                    }).then((response) =>{
                        let strings = ''
                        response.data.forEach(element => {
                            console.log(element)
                            strings = strings + element.message_id + '\n'
                        });
                        if(strings){strings = '送信成功\n'+ 'message_ids\n' + strings}
                        alert(strings)
                    }).catch((error)=>{
                        console.log('error:')
                        console.log(error)
                        alert(error)
                    }).then(console.log('submit:Done!'))
                    }
                }
        },
        computed:{
            divisionFormat(){
                let hint =''
                switch(this.selectedDivision){
                    case '新規':
                        hint = '吉澤さんに送信されます'
                        break;
                    case '調査':
                        hint = '調査 全員に送信されます'
                        break;
                    case '交面':
                        hint = '交面 全員に送信されます'
                        break;
                    case '交渉':
                        hint = '交渉 全員に送信されます'
                        break;
                }
                return {hint:hint}
            },
            isChuketuKomen(){
                if(this.selectedDivision === '中決' ||this.selectedDivision === '交面' ){
                    return true
                } else {
                    return false
                }
            }
        },
        created(){
            if(this.$auth.user){
                this.selectedDivision = this.$auth.user.division
                this.name = this.$auth.user.name
            } else {
                this.name = 'guest'
            }
        }
    }
</script>