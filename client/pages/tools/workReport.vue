<template>
    <div>
        <v-row justify="center" aligh-content="center">
            <v-col cols=12 sm=9 md=9 lg=6 xl=6 >
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
                v-model="selectedDivision"
                :options="$auth.user ? $auth.user.division : null"
                ></v-select>
                </v-card-title>
            <v-card-text>
                <v-form ref="form" @submit.prevent>
                    <!-- 新規用 -->
                    <v-row v-show="isShinki">
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
                    <v-row v-show="isShinki">
                        <v-col>
                            <v-text-field
                            v-model="counter.shinki.mail"
                            label="メール"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.shinki.chat"
                            label="チャット"
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
                    <v-row v-show="selectedDivision === '調査'? true :false">
                        <v-col>
                            <v-text-field
                            v-model="counter.chousa.fax"
                            label="fax"
                            type="number"
                            suffix="分"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.chousa.pdf"
                            label="pdf"
                            type="number"
                            suffix="分"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.chousa.furiwake"
                            label="履歴振分"
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
                            v-model="counter.kanryou.kanryoushoruiData"
                            label="完了書類(データ作成)"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.kanryou.kanryoushoruiPrint"
                            label="完了書類(印刷)"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row v-show="selectedDivision === '完了'? true :false">
                        <v-col>
                            <v-text-field
                            v-model="counter.kanryou.mail"
                            label="郵送袋詰"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.kanryou.mailWcheck"
                            label="郵送Wチェック"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.kanryou.pdf"
                            label="PDF"
                            type="number"
                            suffix="分"
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- カスタマー -->
                    <v-row v-show="selectedDivision === 'カスタマー'? true :false">
                        <v-col>
                            <v-text-field
                            v-model="counter.customer.kaden"
                            label="架電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.customer.jyuden"
                            label="受電"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.customer.koumen"
                            label="交面"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            v-model="counter.customer.chat"
                            label="チャット"
                            type="number"
                            suffix="件"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-textarea
                            v-model="report"
                            outlined
                            :hint="divisionFormat.hint"
                            label="メモ">
                            </v-textarea>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-file-input
                         label="ファイル添付"
                         @change="setFile"
                        ></v-file-input>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-show="!isTempFile" @click="submit">送信</v-btn>
                <v-btn v-show="isTempFile" @click="fileSend">送信(ファイル有り)</v-btn>
                <!-- <v-btn @click="fileGet">ファイルget</v-btn> -->
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
            users:[],
            name:'',
            counter:{},
            file:null,
            selectedDivision:{},
            division:[
                { text:"新規(過払い)", value:"新規(過払い)"},
                { text:"新規(WEB相続)", value:"新規(WEB相続)"},
                { text:"調査", value:"調査"},
                { text:"中決", value:"中決"},
                { text:"交面", value:"交面"},
                { text:"破産", value:"破産"},
                { text:"交渉", value:"交渉"},
                { text:"完了", value:"完了"},
                { text:"カスタマー", value:"カスタマー"},
                { text:"相続", value:"相続"},
                { text:"札幌", value:"札幌"},
                { text:"松山", value:"松山"},
                { text:"高知", value:"高知"},
                { text:"無所属", value:"無所属"},
                ],
            //各課の件数カウント用　わかりづらいので、OBJECTにして一つにまとめます。
            counter:{
                shinki:         {kaden:'', jyuden:'', seiyaku:'',mail:'',chat:''},
                chousa:         {keisan:'', kaden:'', kaihuu:'', bantuke:'',fax:'',pdf:'',furiwake:''},
                chuketuKomen:   {chuketu:'', kaden:'', jisseki:'', ishikaku:''},
                koushou:        {kaden:'', jyuden:'', wakai:'', saikoushou:''},
                kanryou:        {kanryoushoruiData:'',kanryoushoruiPrint:'', mail:'', mailWcheck:'', pdf:''},
                customer:       {kaden:'', jyuden:'', koumen:'',chat:''}
            },
            report:''
        }
    },
    methods:{
            routerPush(path){
                this.$router.push(path)
            },
            submit(){
                const doNot = !window.confirm(this.selectedDivision + '宛です。\n本当に送信しますか？')
                if(doNot){ return }     //キャンセルの処理
                const body = this.messageBody
                axios.post('/api/cw/send',{
                    content: body,
                    division:this.selectedDivision
                }).then((response) =>{
                    console.log(response)
                    alert('送信おわりました！')
                    const doYes = confirm('ログアウトしますか？')
                    if(doYes){
                        this.logout()
                        alert('お疲れ様でした。')
                    } else {
                        alert('帰る前にログアウトしてくださいね。\n※忘れても大丈夫です。')
                    }
                }).catch((error)=>{
                    console.log('error:')
                    console.log(error)
                    alert(error)
                })
            },
            setFile(e){
                console.log(e)
                this.file = e
            },
            fileSend(){
                const doNot = !window.confirm(this.selectedDivision + '宛です。\n本当に送信しますか？')
                if(doNot){ return }     //キャンセルの処理
                let params = new FormData
                params.append('file',this.file)
                params.append('filename','テレワーク用の日報')
                params.append('content',this.messageBody)
                params.append('division',this.selectedDivision)
                console.log(this.file)
                console.log(params)
                this.$axios.post('api/cw/sendfile',params,{ headers: {'Content-Type': 'multipart/form-data'}})
                .then(response=>{
                    if(response.data.error){ return response.data.message}
                        console.log(response)
                        alert('送信おわりました。')
                        const doYes = confirm('ログアウトしますか？')
                        if(doYes){
                            this.logout()
                            alert('お疲れ様でした。')
                        } else {
                            alert('帰る前にログアウトしてくださいね。\n※忘れても大丈夫です。')
                        }
                    })
            },
            fileGet(){
                this.$axios.get('api/cw/send/file')
                .then(r=>{console.log(r);alert(r.data.file_id)})                    
            },
            logout(){
                const data = { user: this.$auth.user}
                this.$auth.logout({data:data})
            },
            getUsers(){
                const uri = '/api/auth/user/allUsers/all/continuation'
                this.$axios.get(uri)
                .then(response => {
                    this.users = response.data
                })
            }

        },
        computed:{
            divisionFormat(){
                let hint =''
                switch(this.selectedDivision){
                    case '新規(過払い)':
                        hint = '吉澤さんに送信されます'
                        break;
                    case '新規(WEB・相続)':
                        hint = '吉澤さんに送信されます'
                        break;
                    case '調査':
                        hint = '調査グループに送信されます'
                        break;
                    case '交面':
                        hint = '交面/中決 グループに送信されます'
                        break;
                    case '交渉':
                        hint = '交渉 グループに送信されます'
                        break;
                    case '完了':
                        hint = '完了グループチャットに送信されます。'
                        break;
                    case 'カスタマー':
                        hint = 'カスタマーグループチャットに送信されます。'
                        break;
                    case '相続':
                        hint = '相続グループチャットに送信されます。'
                        break;
                }
                return {hint:hint}
            },
            messageBody(){
                let body = "[info][title]" + this.name + "[/title]"
                let counterStrings = ''
                let To = ''
                this.toArray.forEach(item=>{
                    To += '[To:' + item.cw_to_id + ']' + item.name
                })
                switch(this.selectedDivision){
                    case '新規(過払い)':
                        counterStrings = '\n[info]架電：'+ this.counter.shinki.kaden +'受電：'+ this.counter.shinki.jyuden+'件\n成約：'+ this.counter.shinki.seiyaku +'件'+'件\nメール：'+ this.counter.shinki.mail +'件'+'件\nチャット：'+ this.counter.shinki.shat +'件' + '\n[/info]'
                        break;
                    case '新規(WEB相続)':
                        counterStrings = '\n[info]架電：'+ this.counter.shinki.kaden +'受電：'+ this.counter.shinki.jyuden+'件\n成約：'+ this.counter.shinki.seiyaku +'件'+'件\nメール：'+ this.counter.shinki.mail +'件'+'件\nチャット：'+ this.counter.shinki.shat +'件' + '\n[/info]'
                        break;
                    case '調査':
                        counterStrings  = '\n[info]計算：'+ this.counter.chousa.keisan +'件\n架電：'+this.counter.chousa.kaden+'件\n郵送開封：'+this.counter.chousa.kaihuu+'分\n番付：'+ this.counter.chousa.bantuke +'分\nfax：'+ this.counter.chousa.fax +'分\nPDF：'+ this.counter.chousa.pdf +'分\n履歴振分：'+ this.counter.chousa.furiwake +'分' + '\n[/info]'
                        break;
                    case '交面':
                        counterStrings = '\n[info]中決：'+ this.counter.chuketuKomen.chuketu +'件\n交面架電：'+ this.counter.chuketuKomen.kaden +'件\n交面実績：' + this.counter.chuketuKomen.jisseki + '件\n意思確認：'+ this.counter.chuketuKomen.ishikaku +'件' + '\n[/info]'
                        break;
                    case '中決'://上記交面と一緒です。
                        counterStrings = '\n[info]中決：'+ this.counter.chuketuKomen.chuketu +'件\n交面架電：'+ this.counter.chuketuKomen.kaden +'件\n交面実績：' + this.counter.chuketuKomen.jisseki + '件\n意思確認：'+ this.counter.chuketuKomen.ishikaku +'件' + '\n[/info]'
                        break;
                    case '交渉':
                        counterStrings = '\n[info]交渉架電：'+this.counter.koushou.kaden+'件\n交渉受電：'+ this.counter.koushou.jyuden +'件\n和解：' + this.counter.koushou.wakai + '件\n再交渉：'+ this.counter.koushou.saikoushou + '件\n' + '\n[/info]'
                        break;
                    case '完了':
                        counterStrings = '\n[info]完了作成：'+ this.counter.kanryou.kanryoushoruiData +'件\n完了書類印刷：'+ this.counter.kanryou.kanryoushoruiPrint +'件\n郵送袋詰：' + this.counter.kanryou.mail +'件\n郵送Wchek：' + this.counter.kanryou.mailWcheck +'件\nPDF：' + this.counter.kanryou.pdf + '分' + '\n[/info]'
                        break;
                    case 'カスタマー':
                        counterStrings = '\n[info]架電：'+ this.counter.customer.kaden +'件\n受電：'+ this.counter.customer.jyuden +'件\n交面実績：' + this.counter.customer.koumen + '件\n:チャット：' + this.counter.customer.chat + '\n[/info]'
                        break;
                    case '相続':
                        counterStrings = ''
                        break;
                    case '札幌':
                        counterStrings = ''
                        break;
                    case '松山':
                        counterStrings = ''
                        break;
                    case '高知':
                        counterStrings = ''
                        break;
                }
                if(this.selectedDivision == '新規(過払い)' || this.selectedDivision == '新規(WEB相続)'){
                    return body = body + counterStrings + '\n[hr]業務報告\n' + this.report + "[/info]"
                } else {
                    return body = body + counterStrings + '\n[hr]業務報告\n' + this.report + "[/info]" + To
                }
            },
            toArray(){
                let resultArray = []
                resultArray = this.users.filter(item=>{
                    if(this.selectedDivision == 'カスタマー'){
                        if(item.division == 'カスタマー' || item.division == '交面' ){return true}      
                    } else if(this.selectedDivision == '交面'){
                        if(item.division == 'カスタマー' || item.division =='交面' || item.division =='中決'){return true} 
                    } else if(this.selectedDivision == '中決'){
                        if(item.division == '交面' || item.division == '中決' ){ return true}
                    } else {
                        return item.division == this.selectedDivision
                    }
                })
                return resultArray
            },
            isChuketuKomen(){
                if(this.selectedDivision === '中決' ||this.selectedDivision === '交面' ){
                    return true
                } else {
                    return false
                }
            },
            isShinki(){
                if(this.selectedDivision === '新規(過払い)' ||this.selectedDivision === '新規(WEB相続)' ){
                    return true
                } else {
                    return false
                }
            },
            isTempFile(){
                if(this.file === null){
                    return false
                } else {
                    return true
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
            this.getUsers()
        }
    }
</script>