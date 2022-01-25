const moment = require('moment')

function createDownloadATag(exportText,...csvTitle){
    const today = new Date()
    const todayStrings =today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate() + ' ' + today.getHours() + today.getMinutes() + today.getSeconds()
    const textName = 'ExpCsv ' + csvTitle + todayStrings + '.csv'
    const blob = new Blob([exportText],{type:'text/plain'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = textName
    return link
}

const matchCis = function(cis,cir){
    //cisとcirのマッチング処理
    //１．cirに受任番号がある場合
        //受任番号マッチ　
            //カナマッチ
            //カナマッチがゼロの場合bank_account_nameとマッチング
                //日にちが　27日よりも以前であれば　→　filterd
    //２．cirに受任番号が無い場合 もしくは１．でマッチしなかった場合
        //カナマッチ
        //カナマッチがゼロの場合bank_account_nameとマッチング
            //金額マッチ
                //日にちが　27日よりも以前であれば　→　filterd

    //受任番号でマッチ
    const matchJyuninNum = function(jyuninNum,cisArray){
        return cisArray.filter((ele)=>{
            return jyuninNum === ele.customer_id
        })
    }

    //名前の間のスペースはトリミングする。※銀行によってスペースがあったりなかったりする為。
    const matchName = function(name,cisArray){
        return cisArray.filter((ele)=>{
            return zenkana2BigHankana(name.replace(/\s+/g, "")) === zenkana2BigHankana(String(ele.kana).replace(/\s+/g, ""))
        })
    }

    const matchBankAccountName = function(name,cisArray){
        return cisArray.filter((ele)=>{
            return zenkana2BigHankana(name.replace(/\s+/g, "")) === zenkana2BigHankana(String(ele.bank_account_name).replace(/\s+/g, ""))
        })
    }

    //金額でマッチング
    const matchAmount = function(amount,cisArray){
        return cisArray.filter((ele)=>{
            return amount === ele.amount
        })
    }

    //日付のマッチング。CIRの日付から27日後　よりも前の場合のみマッチングさせる
    const matchDate = function(cirDate,cisDate){
        const cirMoment = moment(cirDate)
        const cisMoment = moment(cisDate).add(-27,'days')
        //cisを27日減算した場合にcirよりも古い日付になればマッチしてOKにする（true)を返す。
        console.log('matchDate判定：',cisMoment.isBefore(cirMoment))
        return cisMoment.isBefore(cirMoment)
    }

    //マッチングしたものをcisから削除する(重複をさける為)
    const matchedCisDelete = function(matchedCis,cisArray){
        return cisArray.filter((ele,index)=>{
            if(ele.come_in_schedules_id !== matchedCis.come_in_schedules_id){
                return true
            } else {

            }
        })
    }

    let filtered = []
    cir.forEach((cirlItem)=>{
        //もしもCIS_IDにすでに登録があればマッチング処理はしない
        console.log('処理する？判定：',cirlItem.come_in_schedules_id === null)
        if(cirlItem.come_in_schedules_id){ return }
        console.log('処理：',cirlItem.come_in_schedules_id)
        //制御用です。
        let isMatched = false

        if(cirlItem.customer_id){
        //①入金に受任番号があるかないか。

            const customerIdMatchedArray = matchJyuninNum(cirlItem.customer_id,cis)

            if(customerIdMatchedArray.length !== 0){
            //受任番号がマッチした配列について「カナ」のマッチング処理
                let nameMatchedArray = matchName(cirlItem.come_in_name,customerIdMatchedArray)
                //ひとつもマッチしなかった場合bank_account_nameとマッチングをかけ
                if(nameMatchedArray.length == 0){
                    nameMatchedArray = matchBankAccountName(cirlItem.come_in_name,customerIdMatchedArray)
                }

                if(nameMatchedArray.length !== 0){
                //「カナ」もマッチした場合にfilterdに追加。
                    console.log('matched:',cirlItem.actual_deposit_date,nameMatchedArray[0].payment_day)
                    if(matchDate(cirlItem.actual_deposit_date,nameMatchedArray[0].payment_day)){
                        filtered.push({cir:cirlItem,cis:nameMatchedArray[0]})
                        cis = matchedCisDelete(nameMatchedArray[0],cis)    
                    }
                }
                return
            }
        } 
        
        if(isMatched === false ) {
            //②受任番号が無い場合
            console.log('受任番号が無い場合のmatched:',cirlItem.come_in_name)
            let nameMatchedArray = matchName(cirlItem.come_in_name,cis)
            console.log('nameMatchedArray判定:',nameMatchedArray.length !== 0)
            console.log('nameMatchedArray:',nameMatchedArray)
            //ひとつもマッチしなかった場合bank_account_nameとマッチングをかける
            if(nameMatchedArray.length == 0){
                nameMatchedArray = matchBankAccountName(cirlItem.come_in_name,cis)
                console.log('bank match後：',nameMatchedArray)
            }

            if(nameMatchedArray.length !== 0){
            //カナがマッチした配列について、金額でマッチング
                const amountMatched = matchAmount(cirlItem.amount,nameMatchedArray)

                if(amountMatched.length !== 0){
                //金額もマッチングした場合filterdに追加。

                console.log('is match?:',cirlItem.actual_deposit_date,amountMatched[0].payment_day)
                   if(matchDate(cirlItem.actual_deposit_date,amountMatched[0].payment_day)){
                        filtered.push({cir:cirlItem,cis:amountMatched[0]})
                        cis = matchedCisDelete(amountMatched[0],cis)
                   }
                }
                return
            } else {
            //カナがマッチしなかったら終了。
                // console.log('no matched [cir id]: ', cirlItem.come_in_records_id)
                return
            }
        }

    })
    return filtered
}

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////



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

function hankana2Zenkana(str) {
    var kanaMap = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・'
    };

    var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    return str
            .replace(reg, function (match) {
                return kanaMap[match];
            })
            .replace(/ﾞ/g, '゛')
            .replace(/ﾟ/g, '゜');
};


//////////////銀行の変換用に小文字は大文字へ////////////////////////
function zenkana2BigHankana(str) {
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
         "ァ": "ｱ", "ィ": "ｲ", "ゥ": "ｳ", "ェ": "ｴ", "ォ": "ｵ",
         "ッ": "ﾂ", "ャ": "ﾔ", "ュ": "ﾕ", "ョ": "ﾖ",
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

const objIsEmpty = function(target){
    return !Object.keys(target).length
}

const getNextMonth = function(){
    return moment().add(27,'days').format('YYYY-MM-DD')
}

const getMonthAfterNext = function(){
    return moment().add(2,'M').format('YYYY-MM-DD')
}

const getLastMonth = function(){
    return moment().add(-27,'days').format('YYYY-MM-DD')
}


///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

export {
    createDownloadATag,
    matchCis,
    ////////////////////
    zenkana2BigHankana,
    zenkana2Hankana,   
    hankana2Zenkana,
    objIsEmpty,
    getNextMonth,
    getMonthAfterNext,
    getLastMonth
}