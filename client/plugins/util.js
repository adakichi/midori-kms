const moment = require('moment')

function createDownloadATag(exportText,...csvTitle){
    const today = new Date()
    const todayStrings =today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate() + ' ' + today.getHours() + today.getMinutes() + today.getSeconds()
    console.log('title',csvTitle)
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
    // 2022/10/05 安達 27日後ではなくて、10日後までにして、自動で前受金＆預り金への振替がどれだけ減らせるか実験する。
    // 2022/10/06 安達 これはCISではなくてCIRにしか使ってなかったので-27に戻す
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
        console.log('\n\n-----ここから処理始めます：',cirlItem)
        //もしもCIS_IDにすでに登録があればマッチング処理はしない
        if(cirlItem.come_in_schedules_id){ return }
        //制御用です。
        let isMatched = false

        if(cirlItem.customer_id){
        //①入金に受任番号があるかないか。
        console.log('受任番号あり処理：',cirlItem.customer_id)

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
            //※注意 そもそも名前が無い場合はbank_accout_nameが空のものとマッチングしてしまうので、come_in_nameが空のものを除く。
            if(nameMatchedArray.length == 0 && cirlItem.come_in_name !== ""){
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

const getIdsFromPaymentSchedules = function(schedulesArray){
    let ids = schedulesArray.map(obj =>{
        return obj.customer_id
    })
    //重複削除
    const duplicateDeletion = Array.from(new Set(ids))
    return duplicateDeletion
}

//カスタマーの配列と選択された配列を比較してdeposit（預り金）より多ければOKとする。
//※重要※ リファクタリング案件　計算量を無視してます。（めんどい、というか今は完成スケジュール重視）重たくなったら、createSumPaidObjectとcreateAfterPaymentArray の結合というか　一回の計算量でおわるようにしてください。
function judgePay(selectedArray,customersArray){
    console.log('cusotmersArray:',customersArray)
    //実際の出金　OK/NG の判断処理
    let afterPaymentArray = createAfterPaymentArray(selectedArray,customersArray)
    return afterPaymentArray
}

//※judgePay　用の関数 if(預かり金 > 支払い金額小計 && 仮出金していない) を判断する。すでに仮出金済みの案件
//  その上で支払い金額をcustomersのdepositから引く＆ selectedArrayを支払いOKとする
function createAfterPaymentArray(selectedArray,customersArray){
    console.log('selectedArray:',selectedArray)
    let customersObject = customersArrayToObject(customersArray)
    const judgedSelectedArray = selectedArray.map(schedule =>{
        const customerId = schedule.customer_id
        const amount     = parseInt(schedule.amount,10)
        const advisoryFee= parseInt(schedule.advisory_fee,10)    * 1.1
        const commission = parseInt(schedule.commission,10)       * 1.1
        const memo       = schedule.memo
        
        //depositとamount && (adovisoryFee + commission) とadvance_payment を比較する。かつ まだ仮出金になってないことの確認
        if(customersObject[customerId].deposit >= amount && customersObject[customerId].advance_payment >= (advisoryFee + commission) && schedule.expected_date === null ){
            //depositからamountを減算
            customersObject[customerId].deposit -= amount
            //advance_paymentから　advisoryFeeとcommissionを減算
            customersObject[customerId].advance_payment -= advisoryFee + commission
            //小計に加算
            customersObject[customerId].sumAmount += amount
            customersObject[customerId].sumCommission += commission
            customersObject[customerId].sumAdvisoryFee += advisoryFee
            //confirm_payment(支払い済み金額)にamountを加算
            customersObject[customerId].confirm_payment += amount
            //scheduleに出金　可否を追加
            schedule.isCanPay = true
        } else {
            schedule.isCanPay = false
        }
        //支払いに必要な金額を追加
        customersObject[customerId].requiredAmount += (amount + advisoryFee + commission)
        customersObject[customerId].requiredDeposit         += amount
        customersObject[customerId].requiredAdvancePayment  += (advisoryFee + commission)
        customersObject[customerId].diff                    = (customersObject[customerId].temporaryReceiptBeforeJudge + customersObject[customerId].depositBeforeJudge + customersObject[customerId].advancePaymentBeforeJudge) - customersObject[customerId].requiredAmount  //仮受金から支払いに必要な金額を引いたもの（差額）

        //メモがあれば スケジュールのメモをまとめて人毎のメモに入れる。
        if(memo !== ''){
            customersObject[customerId].memo += '/' + schedule.creditor_name + ':' +  memo
        }

        schedule.recordKubun = 1
        switch(schedule.kind){
            case '普通':
                schedule.kind = 1
                break
            case '当座':
                schedule.kind = 2
                break
            case '貯蓄':
                schedule.kind = 4   
                break
        }

        return schedule
    })
    return {customersObject:customersObject,judgedSelectedArray:judgedSelectedArray}
}
    //※createAfterPaymentArray用の関数 customerArrayをオブジェクトにする。
    // filter等で何度も処理すると計算量が大きくなる気がするためオブジェクトに返還してから処理する
    function customersArrayToObject(customersArray){
        let customerObject = {}
        customersArray.forEach((customer)=>{
            customer.sumAmount = 0
            customer.sumCommission = 0
            customer.sumAdvisoryFee = 0
            customer.depositBeforeJudge = customer.deposit
            customer.accountsReceivableBeforeJudge = customer.accounts_receivable
            customer.advancePaymentBeforeJudge     = customer.advance_payment
            customer.temporaryReceiptBeforeJudge   = customer.temporary_receipt
            customer.requiredAmount                = 0
            customer.requiredDeposit               = 0
            customer.requiredAdvancePayment        = 0
            customerObject[customer.customer_id]   = customer
        })
        return customerObject
    }

//※judgePay　用の関数 一件づつの支払いを人ごとにまとめる。
function createSumPaidObject(selectedArray){
    let sumPaidObject = {}
    selectedArray.forEach((schedule)=>{
        const customerId = parseInt(schedule.customer_id,10)
        const amount     = parseInt(schedule.amount,10)
        const advisoryFee= parseInt(schedule.advisory_fee,10)
        const commission  = parseInt(schedule.commission,10)
        if(sumPaidObject[customerId]){
            sumPaidObject[customerId].amount        += amount 
            sumPaidObject[customerId].advisoryFee   += advisoryFee 
            sumPaidObject[customerId].commission     += commission 
        } else {
            sumPaidObject[customerId] = {customerId:customerId,amount:amount,advisoryFee:advisoryFee,commission:commission}
        }
    })
    return sumPaidObject    
}

//転送api用にreq.body.divisionで送信先を変える関数
import {chatworkConf} from '../../midori-kms_config'
function forwardingAddress (division){
    let toRoomId = []
    let from = ''
    switch (division){
        case '新規(過払い)':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.yoshizawa_robot
            break;
        case '新規(WEB相続)':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.yoshizawa_robot
            break;
        case '調査':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.chousaRoom
            break;
        case '中決':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.koumenChuketuRoom
            break;
        case '交面':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.koumenChuketuRoom
            break;
        case '破産':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.b2terashima
            toRoomId[1] = chatworkConf.rooms.b2ikemura
            toRoomId[2] = chatworkConf.rooms.b2tamatushima
            toRoomId[2] = chatworkConf.rooms.b2shigyou
            toRoomId[3] = chatworkConf.rooms.b2adachi
            break;
        case '交渉':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.KoushouRoom
            break;
        case '完了':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.KanryouRoom
            break;
        case 'カスタマー':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.KanryouRoom
            break;
        case '相続':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.SouzokuRoom
            break;
        case '札幌':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.SapporoRoom
            break;
        case '松山':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.MatuyamaRoom
            break;
        case '高知':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.KouchiRoom
            break;
        case '無所属':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.b2adachi
            toRoomId[1] = chatworkConf.rooms.b2terashima
            toRoomId[2] = chatworkConf.rooms.b2ikemura
            toRoomId[3] = chatworkConf.rooms.b2tamatushima
            toRoomId[4] = chatworkConf.rooms.b2shigyou
            break;
        }
            
    return {from: from, to: toRoomId}
}

//id_vueで、積立設定の際に必要な残り金額の計算
const sumPs = function(ps){
    let sumAmount     = 0
    let sumAdvisoryFee = 0
    let sumCommission  = 0
    ps.forEach(ele=>{
        //isSelecetable がTrueってことはまだ出金していないってこと。
        console.log('ele',ele)
        if(ele.isSelectable){
            sumAmount     += ele.amount
            sumAdvisoryFee += ele.advisory_fee
            sumCommission  += ele.commission
        }
    })
    return {sumAmount:sumAmount, sumAdvisoryFee:sumAdvisoryFee, sumCommission:sumCommission,sumTotal:Number(sumPaymentSchedules.sumAmount) + Number(sumPaymentSchedules.sumAdvisoryFee) + Number(sumPaymentSchedules.sumCommission)}
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

const getNextWeek = function(){
    return moment().add(7,'days').format('YYYY-MM-DD')
}

const getToday = function(){
    return moment().format('YYYY-MM-DD')
}

const getDateTime = function(){
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

export {
    createDownloadATag,
    matchCis,
    getIdsFromPaymentSchedules,
    judgePay,
    forwardingAddress,
    sumPs,
    ////////////////////
    zenkana2BigHankana,
    zenkana2Hankana,   
    hankana2Zenkana,
    objIsEmpty,
    getNextMonth,
    getMonthAfterNext,
    getLastMonth,
    getNextWeek,
    getToday,
    getDateTime
}