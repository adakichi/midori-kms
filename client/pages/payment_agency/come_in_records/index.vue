<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-app-bar-title>
                        入金実績：come in records
                    </v-app-bar-title>
                    <v-spacer></v-spacer>
                <v-btn @click="goImport">インポート</v-btn>
                <v-btn @click="upda">こうしん</v-btn>
                </v-app-bar>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="match">Match</v-btn>
            </v-col>
        </v-row>    
        <v-row>
            <v-col>
                <v-data-table
                v-model="selected"
                :headers="headers"
                :items="comeInRecordsList"
                item-key="come_in_records_id"
                :items-per-page="-1"
                class="elevation-1"
                :search="search"
                show-select
                show-group-by
                dense
                >
                <template v-slot:top>
                <v-text-field
                v-model="search"
                label="Search(まだうごかんばい)"
                class="mx-4"
                >
                </v-text-field>
                </template>
                    <template v-slot:item.delete_flag="{item}">
                        <v-simple-checkbox
                        v-model="item.delete_flag === 0 ?false:true"
                        disabled
                        >
                        </v-simple-checkbox>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
function zenkana2Hankana(str) {
    var kanaMap = {
         "ガ": "ｶﾞ", "ギ": "ｷﾞ", "グ": "ｸﾞ", "ゲ": "ｹﾞ", "ゴ": "ｺﾞ",
         "ザ": "ｻﾞ", "ジ": "ｼﾞ", "ズ": "ｽﾞ", "ゼ": "ｾﾞ", "ゾ": "ｿﾞ",
         "ダ": "ﾀﾞ", "ヂ": "ﾁﾞ", "ヅ": "ﾂﾞ", "デ": "ﾃﾞ", "ド": "ﾄﾞ",
         "バ": "ﾊﾞ", "ビ": "ﾋﾞ", "ブ": "ﾌﾞ", "ベ": "ﾍﾞ", "ボ": "ﾎﾞ",
         "パ": "ﾊﾟ", "ピ": "ﾋﾟ", "プ": "ﾌﾟ", "ペ": "ﾍﾟ", "ポ": "ﾎﾟ",
         "ヴ": "ｳﾞ", "ヷ": "ﾜﾞ", "ヺ": "ｦﾞ",
         "ア": "ｱ", "イ": "ｲ", "ウ": "ｳ", "エ": "ｴ", "オ": "ｵ",
         "カ": "ｶ", "キ": "ｷ", "ク": "ｸ", "ケ": "ｹ", "コ": "ｺ",
         "サ": "ｻ", "シ": "ｼ", "ス": "ｽ", "セ": "ｾ", "ソ": "ｿ",
         "タ": "ﾀ", "チ": "ﾁ", "ツ": "ﾂ", "テ": "ﾃ", "ト": "ﾄ",
         "ナ": "ﾅ", "ニ": "ﾆ", "ヌ": "ﾇ", "ネ": "ﾈ", "ノ": "ﾉ",
         "ハ": "ﾊ", "ヒ": "ﾋ", "フ": "ﾌ", "ヘ": "ﾍ", "ホ": "ﾎ",
         "マ": "ﾏ", "ミ": "ﾐ", "ム": "ﾑ", "メ": "ﾒ", "モ": "ﾓ",
         "ヤ": "ﾔ", "ユ": "ﾕ", "ヨ": "ﾖ",
         "ラ": "ﾗ", "リ": "ﾘ", "ル": "ﾙ", "レ": "ﾚ", "ロ": "ﾛ",
         "ワ": "ﾜ", "ヲ": "ｦ", "ン": "ﾝ",
         "ァ": "ｧ", "ィ": "ｨ", "ゥ": "ｩ", "ェ": "ｪ", "ォ": "ｫ",
         "ッ": "ｯ", "ャ": "ｬ", "ュ": "ｭ", "ョ": "ｮ",
         "。": "｡", "、": "､", "ー": "ｰ", "「": "｢", "」": "｣", "・": "･"
    }
    var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    return str
            .replace(reg, function (match) {
                return kanaMap[match];
            })
            .replace(/゛/g, 'ﾞ')
            .replace(/゜/g, 'ﾟ');
};


const getNextMonth = function(){
    let today = new Date()
    today.setDate(today.getDate()+27)
    const nextMonth = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate()
    return nextMonth
}

const matchCis = function(cis,cir){
    //cisとcirのマッチング処理
    //１．cirに受任番号がある場合
        //受任番号マッチ　→　カナマッチ　→　filterd
    //２．cirに受任番号が無い場合
        //カナマッチ　    →　金額マッチ　→　filterd

    //受任番号でマッチ
    const matcheJyuninNum = function(jyuninNum,cisArray){
        return cisArray.filter((ele)=>{
            return jyuninNum === ele.customer_id
        })
    }

    //名前の間のスペースはトリミングする。※銀行によってスペースがあったりなかったりする為。
    const matcheName = function(name,cisArray){
        return cisArray.filter((ele)=>{
            return zenkana2Hankana(name.replace(/\s+/g, "")) === zenkana2Hankana(String(ele.kana).replace(/\s+/g, ""))
        })
    }

    //金額でマッチング
    const matcheAmount = function(amount,cisArray){
        return cisArray.filter((ele)=>{
            return amount === ele.amount
        })
    }

    //マッチングしたものをcisから削除する(重複をさける為)
    const matchedCisDelete = function(matchedCis,cisArray){
        return cisArray.filter((ele,index)=>{
            if(ele.come_in_schedules_id !== matchedCis.come_in_schedules_id){
                return true
            } else {
                console.log('del cis id:'+ matchedCis.come_in_schedules_id)
            }
        })
    }

    let filtered = []
    cir.forEach((cirlItem)=>{

        if(cirlItem.customer_id){
        //①入金に受任番号があるかないか。

            const customerIdMatchedArray = matcheJyuninNum(cirlItem.customer_id,cis)
            if(customerIdMatchedArray.length !== 0){
            //受任番号がマッチした配列について「カナ」のマッチング処理
                const nameMatchedArray = matcheName(cirlItem.come_in_name,customerIdMatchedArray)

                if(nameMatchedArray.length !== 0){
                //「カナ」もマッチした場合にfilterdに追加。
                    filtered.push({cir:cirlItem,cis:nameMatchedArray[0]})
                    cis = matchedCisDelete(nameMatchedArray[0],cis)
                }
                return
            } else {
            //受任番号がマッチしなかった場合はとりあえず、マッチングさせない。（数が増えてきたら検討する）
                console.log('no matched [cir id]: '+ cirlItem.come_in_records_id)
                return
            }
        } else {
            //②受任番号が無い場合
            const nameMatchedArray = matcheName(cirlItem.come_in_name,cis)

            if(nameMatchedArray.length !== 0){
            //カナがマッチした配列について、金額でマッチング
                const amountMatched = matcheAmount(cirlItem.amount,nameMatchedArray)

                if(amountMatched.length !== 0){
                //金額もマッチングした場合filterdに追加。
                    filtered.push({cir:cirlItem,cis:amountMatched[0]})
                    cis = matchedCisDelete(amountMatched[0],cis)
                }
                return
            } else {
            //カナがマッチしなかったら終了。
                console.log('no matched [cir id]: '+ cirlItem.come_in_records_id)
                return
            }
        }
    })
    return filtered
}

export default {
    layout : 'pa',
    data(){
        return{
            search:'',
            selected:[],
            headers:[
                {
                    text:'id',
                    align:'start',
                    sortable:false,
                    value:'come_in_records_id',
                    groupable:false
                },
                { text:'customer_id',           value:'customer_id'},
                { text:'come_in_name',          value:'come_in_name'},
                { text:'actual_deposit_amount', value:'actual_deposit_amount', groupable:false},
                { text:'actual_deposit_date',   value:'actual_deposit_date'},
                { text:'come_in_schedules_id',  value:'come_in_schedules_id', groupable:false},
                { text:'delete_flag',           value:'delete_flag'},
                { text:'created_at',            value:'created_at'}
            ]
        }
    },
    computed:{
        comeInRecordsList(){
            const data = this.$store.getters['pa/getCIR']
            if(Array.isArray(data)){
                return data
            } else {
                return []
            }
        },
        cis(){
            return this.$store.getters['pa/getCIS']
        }
    },
    methods:{
        upda(){
            this.$store.dispatch('pa/actComeInRecords')
        },
        goImport(){
            this.$router.push('/payment_agency/come_in_records/import')
        },
        match(){
            const cir = this.comeInRecordsList
            const cis  = this.cis
            const matched = matchCis(cis,cir)
            console.log(matched)
            //マッチした配列をapi/indexに投げて、登録処理を作る。
            this.$axios.put('api/payment_agency/matching',matched)
            .then((response)=>{
                console.log(response.data)
            })
        }
    },  
    created(){
        this.upda()
        const nextMonth = getNextMonth()
        const options = {
            id:0,
            until:nextMonth,
        }
        this.$store.dispatch('pa/actComeInSchedules',options)
    }
}
</script>