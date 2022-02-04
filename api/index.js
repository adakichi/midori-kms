const express = require("express");
const app = express();
const mysql = require('mysql')
const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt =require('jsonwebtoken')
const cors = require('cors')
const moment = require('moment')
const fs = require('fs')
import {dbConfig,chatworkConf} from '../midori-kms_config'
const domain = require('express-domain-middleware')

import {sqls} from '../client/plugins/sqls.js'
import {matchCis,objIsEmpty} from '../client/plugins/util.js'

app.use(cors())
app.use(domain)

//fs を使ってログファイル作成
const out = fs.createWriteStream('log/' + moment().format('YYYYMMDD HHmmss') + 'info.log')
const err = fs.createWriteStream('log/' + moment().format('YYYYMMDD HHmmss') + 'error.log')
const logger = new console.Console(out,err)
logger.log(moment().format('YYYY/MM/DD HH:mm:ss') + ' サーバー起動')
//databaseへのコネクト
const db = mysql.createConnection(dbConfig)
  db.connect((err)=>{
    console.log('>db.connect')
    if(err){
      console.error('error connecting: ' + err.stack)
      return
    }
    console.log('Connected id: ' + db.threadId)
  })


// kokokara
const path = require('path')
const axios = require("axios")
const bodyParser = require('body-parser')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
// kokomade


app.get("/", function(req,res){
    console.log('get:/')
    res.send("Hello world")
})

//ログイン
app.post('/auth/login',(req,res)=>{
    console.log('\n---start post login process---\n' + Date())
    if(!req.body.password){
      console.log('パスワードが空の為返却します。\n---stop post login process---\n')
      return res.send({"message": "パスワードが空です！"})
    }
    const userId = req.body.userId
    console.log('req user id:' + userId)
    const reqpass = req.body.password
    const sql = "SELECT * FROM users WHERE user_id = ?"
    db.query(sql, userId,(err,user,fields)=>{
      console.log('>db.query (/auth/login/)')
      if(err){
        console.log('  query error\n---stop post login process---')
        return res.json({"message": err.message})
      }
      if(!user[0]){
        console.log('not match user\n---stop post login process---')
        return res.json({"message": "nameもしくはPASSが間違っています"})
      }
      console.log('query sucess!!\nstart compare ->')
      bcrypt.compare(req.body.password, user[0].password,((err,result)=>{
        if(err){
          console.log('compare error')
          console.log(err)
          console.log('---stop post login process---')
          return res.json({"error":err})
        }
        if(!result){
          console.log(' compare is false')
          console.log('---stop post login process---')
          return res.json({ "message" : "一致しませんでした。"})
          // return res.json({"message": "password is correct"})
        }
        const payload = {
          id:user[0].id,
          userId:user[0].user_id,
          name:user[0].name,
          isAdmin:user[0].admin
        }
        console.log('---compare sucess---\n')
        logger.log(moment().format('YYYY/MM/DD HH:mm:ss') + '>' + user[0].name + ' がログインしました。')
        console.log(moment().format('YYYY/MM/DD HH:mm:ss') + '>' + user[0].name + ' がログインしました。')
        console.log('---Done post login process---')
        const token = jwt.sign(payload, 'secret',{expiresIn:'12h'})
        res.json({token})
      }))
    })
  })
  
//tokenが正しいかの問い合わせ
  app.get('/auth/user/',(req,res) => {
    console.log('\n--- auth user ---')
    const bearToken = req.headers['authorization']
    const bearer = bearToken.split(' ')
    const token = bearer[1]
    jwt.verify(token,'secret',(err,user)=>{
      if(err){
        console.log('auth user denied\n---x---x---x---')
        return res.json({message:"error:token is undefined"})
      }else{
        console.log('auth user admitted\n---------------')
        return res.json({
              user
            })
      }
    })
  })

//ログアウト後の動作
  app.post('/auth/logout',(req,res)=>{
    logger.log(moment().format('YYYY/MM/DD HH:mm:ss')+ '>' + req.body.auth + ' がログアウトしました。')
    console.log('\n--- post /auth/logout/ ---\n' + moment().format('YYYY/MM/DD HH:mm:ss')+ '>' + req.body.auth + ' がログアウトしました。\n--- --- --- ---')
    res.redirect('/user/login')
  })
  
//新規登録
  app.post('/auth/register/',(req,res)=>{
    console.log('\n--- request(POST) auth/register/ start---\n' + Date())
    console.log(req.body.userId)
    const insertSql = 'INSERT INTO USERS (name, user_id, password) VALUES (?,?,?)'
    bcrypt.hash(req.body.password, saltRounds, (err,hash)=>{
      db.query(insertSql, [req.body.name, req.body.userId, hash],(err)=>{
        if(err){
          console.log(' db.query Error\n err: ' + err.message + '\n--- Done process ---')
          return res.json({"message": "登録できませんでした。\nError : " + err.message})
        }
        console.log(' Sucess Create New User\n--- Done process ---')
        return res.json({
          "message":"新規登録が成功しました。\n message : create User successfully",
          "data":[req.body.userId,req.body.email]
        })
      })
    })
  })
  

//ChatWorkとの
app.get("/cw/send",function(req,res,next){
    console.log("get:cw/send")
    let myname = "jhon doe"
    axios.get(chatworkConf.baseUrl + '/me' ,{
        headers: {
            'X-ChatWorkToken' : "8ff0ee570bbcc44f8d576bce19932b63"
        }
    })
        .then(function(response){
            console.log(response.data)
            res.send(response.data)
        })
        .catch(error => {
            console.log(error)
        })
})

//転送api用にreq.body.divisionで送信先を変える関数
  function forwardingAddress (division){
    let toRoomId = []
    let from = ''
    switch (division){
        case '新規':
            from = chatworkConf.token.robot
            toRoomId[0] = chatworkConf.rooms.yoshizawa_robot
            break;
        case '交面':
            from = chatworkConf.token.adachi
            toRoomId[0] = chatworkConf.rooms.tozawa
            toRoomId[1] = chatworkConf.rooms.watanabesyouhei
            toRoomId[2] = chatworkConf.rooms.hasegawa
            break;
        }
    return {from: from, to: toRoomId}
}

//chatworkへの転送api
app.post("/cw/send",function(req,res,next){
    console.log('\nPOST:/cw/send\n---start cw send process---')
    console.log('  division: ' + req.body.division)
    const division = forwardingAddress(req.body.division)
    const body = req.body.content
    const roomIds = division.to
    const cwToken = division.from
    let params = new URLSearchParams()
    params.append('body',body)
    params.append('self_unread',1)
    const urls =  roomIds.map((roomId)=>{
        return chatworkConf.baseUrl + '/rooms/' + roomId + '/messages'
    })
    console.log(params)
    console.log('  axios.all:start!!')
    const axioses = urls.map(function(url){
        return axios.post(url,params,{
            headers: {'X-ChatWorkToken' : cwToken}
        })
    })
    let responseData = []
    Promise.all(
        axioses
        ).then((responses)=> {
            console.log('  done:promise')
            if(responses){
                responseData = responses.map((re)=>{
                    return re.data
                })
                console.log('--- Done!! cw send process ---')
                res.send(responseData)
            }
        }).catch((errors)=> {
            if(errors){
                responseData = errors.map((error)=>{
                    return error.data
                })                
                res.send(errors)
            }
        })
})





//BIZTEL CTIの連携用API

//顧客番号でSAIZOのURLを返す関数

//検索用エンドポイント
app.post('/biztel/search',(req,res)=>{
  console.log('\n--- BIZTEL search ---')
  const sql = 'SELECT jyuninNumber FROM saizoSearch WHERE phoneNumber = ?'
  db.query(sql, req.body.tel,(err,num,fields)=>{
    console.log()
    let jyuninNum = ''
    if(!num){
      console.log('該当無し')
      jyuninNum = '該当無し'
    } else {
      console.log('該当あり')
      jyuninNum = '受任：' + num[0].jyuninNumber
    }
    console.log(num)
    res.set('Content-Type: text/csv; charset=us-ascii')
    res.set('Content-Type', 'text/csv; charset=us-ascii')
    res.send(Buffer.from(jyuninNum))
    console.log('---x---x---x---x---')  
  })
})

//応答時エンドポイント
app.post('/biztel/pickup',(req,res)=>{
  console.log('\n--- BIZTEL pickup ---')
  const sql = 'SELECT kokyakuId FROM saizoSearch WHERE phoneNumber = ?'
  db.query(sql, req.body.tel,(err,num,fields)=>{
    console.log()
    let saizoUrl = ''
    if(!num){
      console.log('該当無し')
      saizoUrl = 'http://172.16.12.38/saizo/'
    } else {
      saizoUrl = 'http://172.16.12.38/saizo/customerInfoList/customerInfo/' + num[0].kokyakuId
    }
    console.log(saizoUrl)
    res.redirect(saizoUrl)
    console.log('---x---x---x---x---')  
  })
})

//切断時エンドポイント
app.post('/biztel/hangup',(req,res)=>{
  console.log('\n--- BIZTEL hangup ---')
  console.log(req.body.called + 'is HangUp')
  
  res.send(Buffer.from('OK'))
  console.log('---x---x---x---x---')
})





////---- 以下payment Agency用 ----////
//get come_in_records
app.get('/payment_agency/cir/',(req,res)=>{
  console.log('\n ---get payment_agensy/cir ---')
  const options = JSON.parse(JSON.stringify(req.query))
  const sql = sqls.get_payment_agency_cir(options)
  db.query(sql,(err,rows,fields)=>{
    if(err){res.send(err)}
    console.log('\n--- /payment_agency/cir/ ---\napi server:\n---x---x---x---x---')
    res.send(rows)
  })
})

//post come_in_records
app.post('/payment_agency/cir/', (req,res)=>{
  //最初にfileinfoの登録をしたあとにcirの登録。（fileinfoのId取得の為)
  console.log('\n --- post pa/cir ---')
  //登録データが空だった場合エラーとして返す
  if(objIsEmpty(req.body.data)){ return res.send({error:true,message:'データがありません!!'})}
  const convertedImportFile = sqls.post_payment_agency_cir.convertImportFile(req.body.fileinfo)
    let importfileSql = convertedImportFile.sql
    let fileinfoArray = convertedImportFile.valuesArray
    const selectFileSql = convertedImportFile.selectFileSql
    const selectFileVal = convertedImportFile.selectFileVal
  console.log('fileinfo:',fileinfoArray)
  db.beginTransaction((err)=>{
    if(err){ throw err }
    //importFileに重複が無いか確認の為select
    let fileNumber = ''
    db.query(selectFileSql,selectFileVal,(err,duplicateRow,field)=>{
      if(err){
        console.log(err)
        return db.rollback(()=>{
          throw err
        })
      }
      if(duplicateRow.length > 0){ 
        fileNumber = duplicateRow[0].importfile_id
        importfileSql = convertedImportFile.updateFileSql
        fileinfoArray = convertedImportFile.updateFileVal
        console.log('\nid:',duplicateRow[0].importfile_id)
        fileinfoArray.push(fileNumber)
        console.log('\nduplicate->',fileNumber)
      }
      console.log('insert importfile:',importfileSql,fileinfoArray)
      db.query(importfileSql,fileinfoArray, (err,row,fields)=>{
        if(err){
          console.log(err)
          return db.rollback(()=>{
            throw err
          })
        }
        if(fileNumber === ''){
          fileNumber = row.insertId
        }
        console.log(' > insert fileinfo is OK')
        console.log(' > insert val -> ' + fileNumber)
        const convertedCir   = sqls.post_payment_agency_cir.convertCir(req.body.data, fileNumber)
          const insertValArray = convertedCir.valuesArray
          const cirSql         = convertedCir.sql
        console.log('insertValarray:',insertValArray.length)
        db.query(cirSql,insertValArray,(err2,row2,fields2)=>{
          if(err2){
            console.log('failed insrtVal')
            console.log(err)
            return db.rollback(()=>{
              throw err2
            })
          }
          const updateImportfileSql = 'UPDATE importfile_for_come_in_records SET imported_number = (SELECT count(importfile_id) FROM come_in_records WHERE importfile_id = ?) WHERE importfile_id = ?;'
          db.query(updateImportfileSql,[fileNumber,fileNumber],(err3,rows3,fields3)=>{
            if(err3){throw err3 }
            db.commit((err)=>{
              if(err){
                console.log('failed Commit!!')
                return db.rollback(()=>{
                  throw err
                })
              }
              console.log('success!')
              row2.importfileId = fileNumber
              res.send(row2)
            })
          })
        })
      })      
    })
  })
})

//importfilesのdataを取得する
app.get('/payment_agency/cir/importfile',(req,res)=>{
  console.log('--- get importfile ---')
  const options = JSON.parse(JSON.stringify(req.query))
  const sql = sqls.importfile_select(options)
  console.log(sql)
  db.query(sql,(err,rows,fields)=>{
    if(err){ throw err }
    console.log('--- success!!(get importfile) ' + rows.length + '件 ---')
    res.send(rows)
  })
})

//入金実績の読み込み時のCIS と CIRのマッチング処理
app.post('/payment_agency/matching',(req,res)=>{
  //insert したimportfile_idとbaseDateがくる。
  console.log('\n--- post payment_agency/matching ----')
  const baseDate = req.body.baseDate
  const fileId = req.body.importfileId
  const cisOptions = {
    until:moment(baseDate).add(27,'days').format('YYYY-MM-DD')
  }
  const cirOptions = {
    importfileId:fileId,
    paid:'false'
  }
  const getCirSql = sqls.get_payment_agency_cir(cirOptions)
  const getCisSql = sqls.get_payment_agency_cis(cisOptions)
  console.log('cir sql:',getCirSql)
  console.log('-------------------')
  console.log('cis sql:',getCisSql)
  //マッチング用のCIRをimportfileの番号で取得
  db.query(getCirSql,(err,row,field)=>{
    if(err){throw err}
    const cir = row
    console.log('cir:',cir.length)
    if(cir.length === 0 ){ throw 'id:' + fileId + 'は全て紐づけ済みです。'}

    //マッチング用のCISを取得
    db.query(getCisSql,baseDate,(err2,row2,fields)=>{
      if(err2){throw err2}
      const cis = row2
      console.log('cis:',cis.length)

      //マッチング処理
      console.log('\nmatcheCis投入cir:',cir)
      const matchedArray = matchCis(cis,cir)
      console.log('\n\nmatchedArray count:',matchedArray.length,'\nmatchedArray:',matchedArray)
      //マッチング処理された配列でDB登録処理
      Promise.all(matchedArray.map(arr=>{
        return matchingTransaction(arr)
      })).then((response)=>{
        console.log(response)
        res.send(response)
      })  
    })
  })
})

//CIS と CIRのマッチング処理
app.put('/payment_agency/matching',(req,res)=>{
  console.log('\n---put pg matching ---')
  console.log('req.body.length:',req.body.length)
  Promise.all(req.body.map(arr=>{
    return matchingTransaction(arr)
  })).then((response)=>{
    console.log('promise all result response:',response)
    res.send(response)
  })
})

  //app.put('/payment_agency/matching'用の関数
  //cisの取得 マッチングさせたい日の1か月よりも前の予定を取得する
  const beforeAndAfterCis = function(baseDate){
    let today = new Date()
    today.setDate(today.getDate()+27)
    const until = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate()
    const options = {
      id:0,
      until:until
    }
    return this.$axios.get('api/payment_agency/cis/',options)
  }

  ////////////////////////////////////////////
  //繰り返し用のSQLのFunction
  const matchingTransaction = function(data){
    console.log('func matchingTransaction')
    //1.cis　登録
    //2.cir　登録
      //5.1customerのデータを取得して,売掛金があるか判定する
      //5.2customerの出金予定27日以内のスケジュールと取得
        //スケジュールから、立替金/顧問料/手数料の合計を取得する
        //上記合計が入金額より大きい場合は全て預り金に入れて処理を終わる
      //入金額が次回支払い予定よりも大きい場合は
        //顧問料・手数料を[仮受金]へ
          //売掛がある場合に、以下の処理


    //3.journal bookに会計処理登録

    //5.commit
    return new Promise((resolve,reject) => {
      const cisId         = data.cis.come_in_schedules_id
      const customerId    = data.cis.customer_id
      const cirId         = data.cir.come_in_records_id
      const cirAmount     = data.cir.actual_deposit_amount
      const cisVal = [cirId,cisId]
      const cisSql = 'UPDATE come_in_schedules SET come_in_records_id = ?  WHERE come_in_schedules_id = ?;'
      const cirVal = [cisId,customerId,cirId]
      const cirSql = 'UPDATE come_in_records SET come_in_schedules_id = ? ,customer_id = ? WHERE come_in_records_id = ?;'
      //gl系DBに会計処理登録
      const glSql = sqls.gl_deposit.debitSql
      const glVal = ['預金',cirAmount,customerId]    //勘定科目・金額・受任番号　の順番
      //customerのdepositを増やす処理
      const customerDepositIncreseSql = sqls.gl_deposit.customerDepositIncreseSql
      const customerDepositIncreseVal = [cirAmount,customerId]       //金額・受任番号　の順番
      db.beginTransaction((err)=>{
        if(err){ throw err}
        
        //1.CIS　DB登録
        db.query(cisSql,cisVal,(err1,row1,fields1)=>{
          if(err1){
            console.log(err1)
            return db.rollback(()=>{
              throw err1
            })
          }
          console.log('row1',row1)
          //2.CIR DB登録
          db.query(cirSql,cirVal,(err2,row2,fields2)=>{
            if(err2){
              console.log(err2)
              return db.rollback(()=>{
                throw err2
              })
            }
            console.log('row2',row2)
            const selectCustomersSql = 'SELECT * FROM customers WHERE customer_id = ?;'
            db.query(selectCustomersSql,customerId,(err5,rows5,fields5)=>{
              if(err5){
                console.log(err5)
                return db.rollback(()=>{
                  throw err5
                })
              }
              console.log('rows5:',rows5)
              const accountsReceivable = rows5[0].accounts_receivable
              let temporaryReceipt = cirAmount //入金額
              
              //5.1 customerの直近27日以内のpayment_scheduleを取得 valueはcustomer_id,cisの支払い予定日の27日後の日付
              const selectSchedulesSql = 'SELECT * FROM payment_schedules as ps LEFT OUTER JOIN payment_accounts as pa ON ps.payment_account_id = pa.payment_account_id WHERE pa.customer_id = ? AND ps.date <= ?;'
              const after27days = moment(data.cis.payment_day).add(27,'d').format('YYYY-MM-DD')
              console.log('customerID,after27days',[customerId,after27days])
              db.query(selectSchedulesSql,[customerId,after27days],(err6,rows6,fields6)=>{
                if(err6){
                  console.log(err6)
                  return db.rollback(()=>{
                    throw err6
                  })
                }
                console.log('Done rows6!\n')
                //5.2 合計値を取得　totalAdvanceMoney,totalCommision,totalAdovisoryFee,と３つの合計subTotal
                const resultGetSubTotals = getSubTotals(rows6)
                console.log('resultGetSubTotals:',resultGetSubTotals)
                let depositInsertValue          = 0 //預り金
                let advancePaymentInsertValue   = 0 //前受金
                let temporaryReceiptInsertValue = 0 //仮受金
                let accountsReceivableInsertValue = 0 //売掛金の減らす額
                if(temporaryReceipt < resultGetSubTotals.subTotal){
                  //入金額よりも次回支払い金額の方が大きい場合は全て仮受金に入れて処理を終わる
                  temporaryReceiptInsertValue = temporaryReceipt
                  temporaryReceipt = 0
                } else {
                  //入金額よりも次回支払い金額が小さい場合は、前受け金と預かり金に分ける
                  advancePaymentInsertValue   = resultGetSubTotals.totalAdovisoryFee + resultGetSubTotals.totalCommision //手数料と顧問料の合計を前受け金に。
                  depositInsertValue          = resultGetSubTotals.totalAdvanceMoney
                  //前受け金と預かり金を入金額から引く
                  temporaryReceipt -= (advancePaymentInsertValue + depositInsertValue)
                  
                  //売掛金がある場合には残りの入金額を売掛金に充てる。
                  if(accountsReceivable > 0){
                    
                    if(accountsReceivable < temporaryReceipt){
                      //入金額の残額が売掛金よりも多ければ売掛がゼロになるまで。
                      accountsReceivableInsertValue = accountsReceivable
                      temporaryReceipt -= accountsReceivable
                    } else if(accountsReceivable > temporaryReceipt){
                      //売掛金の方が多ければ入金額の残額全て。
                      accountsReceivableInsertValue = temporaryReceipt
                      temporaryReceipt -= temporaryReceipt

                    }
                  }
                }
                //5.3 各変数にcustomers登録用の数字が入ってるはずなので、これをcusotmersに登録する。
                const updateCustomersSql = 'UPDATE customers SET accounts_receivable = accounts_receivable - ?, deposit = deposit + ?, advance_payment = advance_payment + ?, temporary_receipt = temporary_receipt + ? WHERE customer_id = ?;'
                const updateCustomersValue = [accountsReceivableInsertValue, depositInsertValue, advancePaymentInsertValue, temporaryReceiptInsertValue, customerId]
                console.log('update customers values:',updateCustomersValue)
                db.query(updateCustomersSql,updateCustomersValue,(err7,rows7,fields7)=>{
                  if(err7){
                    console.log('err7:',err7)
                    return db.rollback(()=>{
                      throw err7
                    })
                  }
                  console.log('rows7:',rows7)
                  //3. journal book に仕分を登録
                  const journalBookData = convPostJournalBook(cirId,updateCustomersValue,customerId)
                  console.log('journalbookdata:',journalBookData)
                  db.query(journalBookData.sql,journalBookData.values,(err8,rows8,fields8)=>{
                    if(err8){
                      console.log('err8:',err8)
                      return db.rollback(()=>{
                        throw err8
                      })
                    }
                    console.log('rows8:',rows8)
                    db.commit((err)=>{
                      if(err){
                        console.log('failed Commit!!')
                        return db.rollback(()=>{
                          throw err
                        })
                      }
                      console.log('success!')
                      console.log('data cir:',data.cir)
                      resolve(data.cir.file_row_number)
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  }
  ////ここまで-----上記用の関数が下記に続きます---------------
  //関数１）取得したpayment_schedulesから立替金と顧問料と手数料を取得して合計金額を吐き出します。
  function getSubTotals(schedules){
    let totalAdvanceMoney = 0
    let totalCommision = 0
    let totalAdovisoryFee = 0
    schedules.forEach(schedule=>{
      totalAdvanceMoney += schedule.amount
      totalCommision    += (schedule.commision    * 1.1)
      totalAdovisoryFee += (schedule.advisory_fee * 1.1)
    })
    return {
      totalAdvanceMoney:totalAdvanceMoney,
      totalCommision:totalCommision,
      totalAdovisoryFee:totalAdovisoryFee,
      subTotal:totalAdvanceMoney + totalCommision + totalAdovisoryFee
    }
  }
  //関数２）journal bookへの登録
  function convPostJournalBook(cirId,valuesArray, customerId){
    //(valuesArray)updateCustomersValue = [accountsReceivableInsertValue, depositInsertValue, advancePaymentInsertValue, temporaryReceiptInsertValue]

    const motocho = 'cir'+cirId
    const sql = 'INSERT INTO journal_book (motocho, debit_account, debit, credit_account, credit, customer_id) VALUES (?);'
    let postJournalVals = []
    console.log('valuesArray:',valuesArray)
    //売掛金 accounts_receivableInsertValue
    if(valuesArray[0] > 0){
      postJournalVals.push([motocho, '預金', valuesArray[0], '売掛金', valuesArray[0], customerId])
    }

    //預り金 depositInsertValue
    if(valuesArray[1] > 0){
      postJournalVals.push([motocho, '預金', valuesArray[1], '預り金', valuesArray[1], customerId])
    }

    //前受金 advancePaymentInsertValue
    if(valuesArray[2] > 0){
      postJournalVals.push([motocho, '預金', valuesArray[2], '前受金', valuesArray[2], customerId])
    }

    //仮受金 temporaryReceiptInsertValue
    if(valuesArray[3] > 0){
      postJournalVals.push([motocho, '預金', valuesArray[3], '仮受金', valuesArray[3], customerId])
    }
    return {sql:sql,values:postJournalVals}
  }
  /////関数ここまで////////////////////////////////////////////////////

app.delete('/payment_agency/matching',(req,res)=>{
  console.log('\n---Delete pg matching ---')
  Promise.all(req.body.map(arr=>{
    return cancelMatchingTransaction(arr)
  })).then((response)=>{
    console.log('promise all result response:',response)
    res.send(response)
  })
})
///////////////////////////////////////////////////
//delete payment_agency matching用（キャンセル用）
function cancelMatchingTransaction(targetObject){
  console.log('targetObject:',targetObject)
  //targetはCIR
  //1.cirから 以下を削除 come_in_schedules_id, customer_id 
  //2.cisから 以下を削除 come_in_records_id
  //3.journal bookからCIR_idでjournalを取り出す。
  //4.journalを使ってcustomerの預り金、前受金、仮受金、売掛金を戻す作業。
  //5.journalをdelete(delete flagにtrue)
  const customerId = targetObject.customer_id
  return new Promise((resolve,reject)=>{
    db.beginTransaction((err)=>{
      if(err){ throw err}

      //1.cirの処理
      const cirSql = 'UPDATE come_in_records SET come_in_schedules_id = null, customer_id = null WHERE come_in_records_id = ?;'
      db.query(cirSql,targetObject.come_in_records_id,(err1,rows1,fields1)=>{
        if(err1){
          console.log('err1:',err1)
          return db.rollback(()=>{ throw err1 })
        }
        console.log('rows1:',rows1)

        //2.cisの処理
        const cisSql = 'UPDATE come_in_schedules SET come_in_records_id = null WHERE come_in_schedules_id = ?;'
        db.query(cisSql,targetObject.come_in_schedules_id,(err2,rows2,fields2)=>{
          if(err2){
            console.log('err2:',err2)
            return db.rollback(()=>{ throw err2 })
          }
          console.log('rows2:',rows2)
          
          //3.journal book から取り出し。
          const selectJournalSql = 'SELECT * FROM journal_book WHERE motocho = ? AND delete_flag = 0;'
          db.query(selectJournalSql,'cir'+targetObject.come_in_records_id,(err3,rows3,fields3)=>{
            if(err3){
              console.log('err3:',err3)
              return db.rollback(()=>{ throw err3 })
            }
            console.log('rows3:',rows3)
            const journalArray = rows3

            //4.journalでcustomersの金額もろもろを巻き戻し。
            const updateCustomersSql = 'UPDATE customers SET accounts_receivable = accounts_receivable + ?, deposit = deposit - ?, advance_payment = advance_payment - ?, temporary_receipt = temporary_receipt - ? WHERE customer_id = ?;'
            let updateCustomersValue = subTotalJournals(journalArray)
            console.log('updateCustomersValue:',updateCustomersValue)
            updateCustomersValue.push(customerId)
            db.query(updateCustomersSql,updateCustomersValue,(err4,rows4,fields4)=>{
              if(err4){
                console.log('err4:',err4)
                return db.rollback(()=>{ throw err4 })
              }
              console.log('rows4:',rows4)
              
              //5.journal_bookをdeleteにする
              const deleteJournalSql = 'UPDATE journal_book SET delete_flag = 1 WHERE journal_book_id = ?;'
              const journalIds = journalArray.map(journal => {return journal.journal_book_id})
              console.log('journalIds:',journalIds)
              db.query(deleteJournalSql,journalIds,(err5,rows5,fields5)=>{
                if(err5){
                  console.log('err5:',err5)
                  return db.rollback(()=>{ throw err5 })
                }
                console.log('rows5:',rows5)
  
                db.commit((err)=>{
                  if(err){
                    console.log('failed Commit!!')
                    return db.rollback(()=>{
                      throw err
                    })
                  }
                  console.log('success!')
                  console.log('cir id:',targetObject.come_in_records_id)
                  resolve(targetObject.come_in_records_id)
                })
              })
            })
      })
        })
      })
    })
  })
}

  //JOURNAL arrayから仮受金、前受金、預り金、売掛金を取り出す。
  function subTotalJournals(journalArray){
    let depositInsertValue          = 0 //預り金
    let advancePaymentInsertValue   = 0 //前受金
    let temporaryReceiptInsertValue = 0 //仮受金
    let accountsReceivableInsertValue = 0 //売掛金に戻す額
    journalArray.forEach(journal=>{
      switch(journal.credit_account){
        case '売掛金':
          accountsReceivableInsertValue += journal.credit
        break
        case '預り金':
          depositInsertValue += journal.credit
        break
        case '前受金':
          advancePaymentInsertValue += journal.credit
        break
        case '仮受金':
          temporaryReceiptInsertValue += journal.credit
        break
      }
    })
    return [accountsReceivableInsertValue, depositInsertValue, advancePaymentInsertValue, temporaryReceiptInsertValue]
  }

//////関数ここまで////////////////////////////////////////////////

//get come in schedules
app.get('/payment_agency/cis/',(req,res)=>{
  console.log(req.query)
  const options = JSON.parse(JSON.stringify(req.query))
  const sql = sqls.get_payment_agency_cis(options)
  db.query(sql,(err,rows,fields)=>{
    if(err){throw err}
    console.log('\n--- Get /payment_agency/cis/ ---\napi server:\n---x---x---x---x---')
    res.send(rows)
  })
})

//post come_in_schedules
app.post('/payment_agency/cis/',(req,res)=>{
  console.log('\n--- pg cis ---')
  const values = Object.entries(req.body).map(([key,value])=>{ return value })
  console.log(values)
  const sql = 'INSERT INTO come_in_schedules (customer_id, payment_day, expected_amount) VALUES (?,?,?);'
  db.query(sql,values,(err,rows,fields)=>{
    if(err){ throw err}
    console.log('--- sucess pg/cis ---')
    res.send(rows)
  })
})

//customer 特定の顧客の検索
//カスタマーの詳細取得用
app.get('/payment_agency/customer/detail',(req,res)=>{
  console.log('\n--- get/customer detail---')
  const id = req.query.id
  const sql = sqls.searchCustomerDetail()
  db.query(sql,id,(err,rows,fields)=>{
    if(err){throw err}
    console.log('rows:',rows)
    console.log('--- sucess ---')
    res.send(rows)
  })
})

//customers の検索
//text に検索文字列 optionsにTYPE等
app.get('/payment_agency/customers/',(req,res)=>{
  console.log('\n--- get/customers---')
  const value = req.query.text
  const options = JSON.parse(req.query.options)
  const convertedData = sqls.searchCustomers(value,options)
  db.query(convertedData.sql,convertedData.value,(err,rows,fields)=>{
    if(err){throw err}
    console.log('rows:',rows)
    console.log('--- sucess ---')
    res.send(rows)
  })
})

//customersの登録（新規顧客登録）
app.post('/payment_agency/customers/',(req,res)=>{
  console.log('\n--- post customers ---')
  console.log(req.body)
  const values = [req.body.customer_id,req.body.name,req.body.kana,req.body.lu_id]
  let sql = 'INSERT INTO customers (customer_id,name,kana,lu_id) VALUES (?,?,?,?);'
  db.query(sql,values,(err,row,fields)=>{
    if(err){throw err}
    console.log('---sucess---')
    res.send('登録しました。')
  })
})

//post NewAccount 支払いの新件登録
app.post('/payment_agency/new_account',(req,res)=>{
  console.log('\n--- post new account ---')
  console.log(req.body)
  let sql = 'INSERT INTO payment_accounts (customer_id, creditor_id, total_amount, monthly_amount, number_of_payments, monthly_payment_due_date, first_amount, start_date, delayed_interest_rate'
      sql = sql + 'irregular, pension, interest, bonus, addition, commision, advisory_fee, account_comment, '
      sql = sql + 'bankcode, branchcode, kind, account_number, account_holder, summer_bonus_amount, summer_bonus_month, winter_bonus_amount, winter_bonus_month) '
      sql = sql + 'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);'
  db.query(sql,req.body,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)
  })
})

//顧客ごとの和解内容
app.get('/payment_agency/customer/settlements',(req,res)=>{
  console.log('\n--- get Customer settlements ---')
  const id = req.query.id
  let sql = 'SELECT payment_account_id, customer_id, pa.creditor_id, creditors.creditor_name, total_amount, monthly_amount, number_of_payments, monthly_payment_due_date, first_amount, DATE_FORMAT(start_date,"%Y/%m/%d") as start_date, type_of_delay, delayed_interest_rate, '
      sql = sql + 'irregular, pension, interest, bonus, addition, commision, advisory_fee, account_comment, '
      sql = sql + 'bankcode, branchcode, kind, account_number, account_holder, summer_bonus_amount, summer_bonus_month, winter_bonus_amount, winter_bonus_month '
      sql = sql + 'from payment_accounts as pa inner join creditors on pa.creditor_id = creditors.creditor_id  where pa.customer_id = ? ;'
  db.query(sql,id,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)
  })
})

//顧客毎の入金予定　取得
app.get('/payment_agency/customer/cis',(req,res)=>{
  console.log('\n---get Customer Cis ---')
  const id = req.query.id
  let sql = 'SELECT come_in_schedules_id, customer_id, date_format(payment_day, "%Y/%m/%d")as payment_day, '
      sql = sql + 'expected_amount, come_in_records_id FROM come_in_schedules WHERE customer_id = ? '
      sql = sql + 'ORDER BY payment_day'
  db.query(sql,id,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})

//顧客毎の入金予定　登録
app.post('/payment_agency/customer/cis',(req,res)=>{
  console.log('\n--- POST customer cis ---')
  console.log(req.body)
  console.log('------------')
  const values = req.body.map((obj)=>[obj.id,obj.amount,obj.date])
  console.log(values)
  const sql = 'INSERT INTO come_in_schedules (customer_id, expected_amount, payment_day) VALUES ?;'
  db.query(sql,[values],(err,rows,fields)=>{
    if(err){ throw err}
    console.log('--- sucess ---')
    res.send(rows)
  })
})


//顧客毎の入金予定の削除
app.delete('/payment_agency/customer/cis',(req,res)=>{
  console.log('\n---Delete Customer Cis: ' + req.body.id + ' ---')
  const id = req.body.id
  console.log(id)
  const sql = 'DELETE FROM come_in_schedules WHERE come_in_schedules_id = ?;'
  db.query(sql,id,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})

//顧客毎ページでの支払い予定登録
app.post('/payment_agency/customer/register_payment_schedules',(req,res)=>{
  console.log('\n--- register_payment_schedules ---')
  console.log(req.body)
  console.log('------------')
  const values = req.body.map((obj)=>[obj.paymentAccountId,obj.amount,obj.date])
  console.log(values)
  const sql = 'INSERT INTO payment_schedules (payment_account_id, amount, date) VALUES ?;'
  db.query(sql,[values],(err,rows,fields)=>{
    if(err){ throw err}
    console.log('--- sucess ---')
    res.send(rows)
  })
})

//カスタマー毎の支払い予定を取得
app.get('/payment_agency/customer/payment_schedules',(req,res)=>{
  console.log('\n---get Customer payment_schedules ---')
  const options = JSON.parse(JSON.stringify(req.query))
  const id = options.id
  const sql    = sqls.get_payment_agency_customer_payment_schedules()
  db.query(sql,id,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})

//出金処理時に、顧客ごとの預り金がどれくらいあるか比べる為、顧客番号の配列をvaluesとして、depositのみ取得して返す。
app.get('/payment_agency/payment_schedules/customers_deposit',(req,res)=>{
  console.log('--- Get pa/ps/customer deposit ---')
  const ids = JSON.parse(JSON.stringify(req.query.ids))
  const sql = sqls.get_payment_agency_payment_schedules_customers_deposit(ids)
  console.log('ids length:',ids.length)
  db.query(sql,ids,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})

//全件の支払い予定を取得
app.get('/payment_agency/payment_schedules',(req,res)=>{
  console.log('\n---get All payment_schedules ---')
  const options = JSON.parse(JSON.stringify(req.query))
  const convertedData = sqls.get_payment_agency_payment_schedules(options)
    const values = convertedData.values
    const sql    = convertedData.sql
  db.query(sql,values,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})


//支払い予定を仮出金にする。
//customersのdepositを減らす処理まで必要
app.put('/payment_agency/payment_schedules/temporary_pay',(req,res)=>{
  console.log('\n---Put payment_schedules/temporary_pay ---')
  const okArray = req.body.okArray
  const date = req.body.date
  const customersSubTotal = req.body.editCustomersArray
  Promise.all(okArray.map(editedScheduleObject=>{
    return temporaryPayTransaction(editedScheduleObject,date)
  }),date).then((response)=>{
    console.log(response)
    res.send(response)
  })  
})

//仮出金の際のトランザクション
const temporaryPayTransaction = function(editedScheduleObject,date){
  return new Promise((resolve,reject)=>{
  //手順0 既に仮出金か確認 → table(paymentschedulesのexpected_date,expected_amount,expected_commision,expected_advisory_fee,を登録（仮支払い日、仮金額、仮手数料、仮顧問料)
          //だめならerrを投げよう。投げ方わからんけど。
  //手順1 table(paymentschedulesのexpected_date,expected_amount,expected_commision,expected_advisory_fee,を登録（仮支払い日、仮金額、仮手数料、仮顧問料)
  //手順2 table(customersのaccounts_receivable, deposit, advance_payment, temporary_receipt, confirm_payment)
  const customerId = editedScheduleObject.customer_id
  const editedScheduleId = editedScheduleObject.payment_schedule_id
  db.beginTransaction((err)=>{
    if(err){ throw err}
    //手順0
    const selectExpectedsIsNullSql = ' SELECT payment_schedule_id FROM payment_schedules WHERE payment_schedule_id = ? AND (expected_date IS NULL OR expected_amount IS NULL OR expected_commision IS NULL OR expected_advisory_fee IS NULL) AND paid_date is null'
    db.query(selectExpectedsIsNullSql,editedScheduleId,(err0,rows,fields)=>{
      if(err0 || rows.length === 0){
        console.log(err0)
        return db.rollback(()=>{
          throw err0
        })
      }

        //手順1
        const updateScheduleSql = ' UPDATE payment_schedules SET expected_date =?, expected_amount = ?, expected_commision = ?, expected_advisory_fee = ? WHERE payment_schedule_id = ?;'
        const updateDataArray = [
          date,
          editedScheduleObject.amount,
          editedScheduleObject.commision,
          editedScheduleObject.advisory_fee,
          editedScheduleId          
        ]
            db.query(updateScheduleSql, updateDataArray,(err2,rows2,fields2)=>{
          if(err2){
            console.log(err2)
            return db.rollback(()=>{
              throw err2
            })
          }

          //手順2
          const updateCustomersSql = 'UPDATE customers SET deposit = deposit - ?, advance_payment = advance_payment - ?, confirm_payment = confirm_payment + ? WHERE customer_id = ?;'
          const updateCustomersValue = [
            editedScheduleObject.amount,  //業者への支払い金額　→　預り金額から減算
            ((editedScheduleObject.commision * 1.1) + (editedScheduleObject.advisory_fee * 1.1)),    //　→　前受金から減算
            editedScheduleObject.amount,  //業者への支払い金額　→　既に支払った金額に加算
            customerId
          ]

          console.log('sql:',updateCustomersSql,'value:',updateCustomersValue)
          db.query(updateCustomersSql,updateCustomersValue,(err3,rows3,fields3)=>{
            if(err3){
              console.log(err3)
              return db.rollback(()=>{
                throw err3
              })
            }
            console.log('rows3: ',rows3)
            db.commit((err4)=>{
              if(err4){
                console.log('failed Commit!!')
                return db.rollback(()=>{
                  throw err4
                })
              }
              console.log('Commit success!')
              resolve(editedScheduleObject)
            })            
          })
        })
    })
  })

  })
}

//支払い予定を取り消し
//customersのdepositを戻す処理まで必要
app.delete('/payment_agency/payment_schedules/temporary_pay',(req,res)=>{
  console.log('\n---Delete payment_schedules/temporary_pay ---')
  const selected = req.body.selected
  Promise.all(selected.map(editedScheduleObject=>{
    return cancelTemporaryPayTransaction(editedScheduleObject)
  })).then((response)=>{
    res.send(response)
  })  
})

//仮出金を取り消す際のトランザクション
const cancelTemporaryPayTransaction = function(editedScheduleObject){
  return new Promise((resolve,reject)=>{
  //手順0 既に仮出金か確認 → table(paymentschedulesのexpected_date,expected_amount,expected_commision,expected_advisory_fee,を登録（仮支払い日、仮金額、仮手数料、仮顧問料)
          //だめならerrを投げよう。投げ方わからんけど。
  //手順1 table(paymentschedulesのexpected_date,expected_amount,expected_commision,expected_advisory_fee,をnull（仮支払い日、仮金額、仮手数料、仮顧問料)
  //手順2 table(customersのdepositを増やす)
  const customerId = editedScheduleObject.customer_id
  const editedScheduleId = editedScheduleObject.payment_schedule_id
  db.beginTransaction((err)=>{
    if(err){ throw err}
    //手順0
    const selectExpectedsIsNotNullSql = ' SELECT payment_schedule_id FROM payment_schedules WHERE payment_schedule_id = ? AND (expected_date IS NOT NULL OR expected_amount IS NOT NULL OR expected_commision IS NOT NULL OR expected_advisory_fee IS NOT NULL) AND paid_date is null;'
    db.query(selectExpectedsIsNotNullSql,editedScheduleId,(err0,rows,fields)=>{
      if(err0 || rows.length === 0){
        console.log('err:',err0)
        return db.rollback(()=>{
          throw err
        })
      }

        //手順1
        const updateScheduleSql = ' UPDATE payment_schedules SET expected_date = null, expected_amount = null, expected_commision = null, expected_advisory_fee = null WHERE payment_schedule_id = ?;'          
            db.query(updateScheduleSql, editedScheduleId,(err2,rows2,fields2)=>{
          if(err2){
            console.log('err2:',err2)
            return db.rollback(()=>{
              throw err2
            })
          }

          //手順2
          const updateCustomersSql = 'UPDATE customers SET deposit = deposit + ?, advance_payment = advance_payment + ?, confirm_payment = confirm_payment - ? WHERE customer_id = ?;'
          const updateCustomersValue = [
            editedScheduleObject.amount,  //業者への支払い金額　→　預り金額から減算
            ((editedScheduleObject.commision * 1.1) + (editedScheduleObject.advisory_fee * 1.1)),    //　→　前受金から減算
            editedScheduleObject.amount,  //業者への支払い金額　→　既に支払った金額に加算
            customerId
          ]
          
          db.query(updateCustomersSql,updateCustomersValue,(err3,rows3,fields3)=>{
            if(err3){
              console.log(err3)
              return db.rollback(()=>{
                throw err3
              })
            }

            db.commit((err4)=>{
              if(err4){
                console.log('failed Commit!!')
                return db.rollback(()=>{
                  throw err4
                })
              }
              console.log('Commit success!')
              resolve(editedScheduleObject)
            })            
          })
        })
    })
  })

  })
}


//出金予定を確定させる
app.put('/payment_agency/payment_schedules/confirm',(req,res)=>{
  console.log('\n---Put Confirm payment_schedules ---')
  const ids = req.body.ids
  const date = req.body.date
  Promise.all(ids.map(id=>{
    return confirmPaymentScheduleTransaction(id,date)
  }),date).then((response)=>{
    console.log('--- sucess ---')
    res.send(response)
  })  
})

//出金予定を確定させるトランザクション
const confirmPaymentScheduleTransaction = function(id,date){
  return new Promise((resolve,reject)=>{
  //手順0 既に（仮出金済み && paid_dateがNULL）か確認 → table(paymentschedulesのexpected_date,expected_amount,expected_commision,expected_advisory_fee,is not null && paid_date is null
          //だめならerrを投げよう。投げ方わからんけど。
  //手順1 paid_date に処理日付を。
  const confirmScheduleId = id
  db.beginTransaction((err)=>{
    if(err){ throw err}
    //手順0
    const selectExpectedsIsNotNullAndPaidDateIsNullSql = ' SELECT payment_schedule_id FROM payment_schedules WHERE payment_schedule_id = ? AND (expected_date IS NOT NULL OR expected_amount IS NOT NULL OR expected_commision IS NOT NULL OR expected_advisory_fee IS NOT NULL) AND paid_date IS NULL;'
    db.query(selectExpectedsIsNotNullAndPaidDateIsNullSql,confirmScheduleId,(err0,rows,fields)=>{
      if(err0 || rows.length === 0){
        console.log('err:',err0)
        return db.rollback(()=>{
          throw err
        })
      }

        //手順1
        const confirmScheduleSql = ' UPDATE payment_schedules SET paid_date = ? WHERE payment_schedule_id = ?;'          
            db.query(confirmScheduleSql, [date, confirmScheduleId],(err1,rows2,fields2)=>{
            if(err1){
              console.log('err2:',err1)
              return db.rollback(()=>{
                throw err1
              })
            }
            db.commit((err2)=>{
              if(err2){
                console.log('failed Commit!!')
                return db.rollback(()=>{
                  throw err2
                })
              }
            console.log('Commit success!')
            resolve(id)
            })
          })
        })
      })
  })
}


//出金確定の取り消し
app.delete('/payment_agency/payment_schedules/confirm',(req,res)=>{
  console.log('\n---Delete Confirm /payment_schedules ---')
  const ids = req.body.ids
  console.log('req body:',req.body)
  Promise.all(ids.map(id=>{
    return cancelConfirmPaymentScheduleTransaction(id)
  })).then((response)=>{
    console.log('--- sucess ---')
    res.send(response)
  })  
})

//出金予定を確定させるトランザクション
const cancelConfirmPaymentScheduleTransaction = function(id){
  return new Promise((resolve,reject)=>{
  //手順0 既に（仮出金済み && paid_dateがNOT NULL）か確認 → table(paymentschedulesのexpected_date,expected_amount,expected_commision,expected_advisory_fee,is not null && paid_date is null
          //だめならerrを投げよう。投げ方わからんけど。
  //手順1 paid_date にnullを。
  const confirmScheduleId = id
  db.beginTransaction((err)=>{
    if(err){ throw err}
    //手順0
    const selectExpectedsIsNotNullAndPaidDateIsNotNullSql = ' SELECT payment_schedule_id FROM payment_schedules WHERE payment_schedule_id = ? AND (expected_date IS NOT NULL OR expected_amount IS NOT NULL OR expected_commision IS NOT NULL OR expected_advisory_fee IS NOT NULL) AND paid_date IS NOT NULL;'
    db.query(selectExpectedsIsNotNullAndPaidDateIsNotNullSql,confirmScheduleId,(err0,rows,fields)=>{
      if(err0 || rows.length === 0){
        console.log('err:',err0)
        return db.rollback(()=>{
          throw err
        })
      }

        //手順1
        const confirmScheduleSql = ' UPDATE payment_schedules SET paid_date = null WHERE payment_schedule_id = ?;'          
            db.query(confirmScheduleSql, confirmScheduleId,(err1,rows2,fields2)=>{
            if(err1){
              console.log('err2:',err1)
              return db.rollback(()=>{
                throw err1
              })
            }
            db.commit((err2)=>{
              if(err2){
                console.log('failed Commit!!')
                return db.rollback(()=>{
                  throw err2
                })
              }
            console.log('Commit success!')
            resolve(id)
            })
          })
        })
      })
  })
}



// ---- Creditors 債権者情報   -------
app.get('/creditors/',(req,res)=>{
  console.log('\n---- get creditors ----')
  const sql = 'select * from creditors'
  db.query(sql,(err,rows,fields)=>{
    if(err){throw err}
    console.log('---success get creditors ---')
    res.send(rows)
  })
})

//債権者の口座情報
app.get('/creditors_accounts/',(req,res)=>{
  console.log('\n---- get creditors_accounts ----')
  const sql = 'select * from creditors_accounts'
  db.query(sql,(err,rows,fields)=>{
    if(err){throw err}
    console.log('---success get creditors_accounts ---')
    res.send(rows)
  })
})

//---- issuesのDB通信用 ----//
//issues取得
app.get('/issues/',(req,res)=>{
  console.log('\n--- get /issues/ ---')
  const sql = 'SELECT * FROM issues;'
  db.query(sql,(err,rows,fields)=>{
    if(err){return console.log(err)}
    res.send(rows)
    console.log('---x---x---x---x---')
  })
})

//issues登録
app.post('/issues/',(req,res)=>{
  console.log('\n--- post /issues/ ---')
  const data = [
    req.body.data.title,
    req.body.data.description,
    req.body.data.author  
  ]
  const sql = 'INSERT INTO issues (title, description, author) values (?,?,?) ;'
  db.query(sql, data, (err,rows,fields)=>{
    if(err){return console.log(err)}
    console.log(' 新規登録成功\n---x---x---x---x---')
    return res.send('OK')
  })
})

//issue取得
app.get('/issue',(req,res)=>{
  const id = parseInt(req.query.id,10)
  console.log('\n--- get /issues/ id:' + id + '---')
  let sql = 'SELECT msg.*, name from issues_messages as msg '
      sql = sql + 'inner join users on msg.author = users.user_id '
      sql = sql + 'WHERE issue_id = ? ORDER BY msg.created_at;'
  db.query(sql,id,(err,rows,fields)=>{
    if(err){
      console.log(err)
      return res.send(err)
    }
    console.log(' 取得成功\n---x---x---x---x---')
    return res.send(rows)
  })
})

//issueにNew Message投稿
app.post('/issue',(req,res)=>{
  console.log(req.body)
  const issueId = parseInt(req.body.id,10)
  console.log('\n--- post /issues/ id:' + issueId + '---')
  const author = req.body.author
  const message = req.body.message
  const data = [issueId, author, message]
  console.log(data)
  let sql = 'INSERT INTO issues_messages (issue_id, author, message) VALUES (?,?,?);'
    db.query(sql,data,(err,rows,fields)=>{
    if(err){
      console.log(err)
      return res.send(err)
    }
    console.log(' 取得成功\n---x---x---x---x---')
    return res.send(rows)
  })
})

//issueのメッセージ更新
app.put('/issue',(req,res)=>{
  console.log(req.body)
  const issueId = parseInt(req.body.issueId,10)
  const messageId = parseInt(req.body.messageId,10)
  console.log('\n--- put /issues/ issue:' + issueId + ', message id:' + messageId + '---')
  const message = req.body.message
  const data = [message, issueId, messageId]
  let sql = 'UPDATE issues_messages SET message = ? WHERE issue_id = ? AND issues_messages_id = ?;'
    db.query(sql,data,(err,rows,fields)=>{
    if(err){
      console.log(err)
      return res.send(err)
    }
    console.log(' 取得成功\n---x---x---x---x---')
    return res.send(rows)
  })
})

// データベースのendは不要です。
// db.end()
db.on('error',function(err){
  if(err){
    console.log(err)
    logger.error(err)
    throw err
  }
})

//Error handoler
app.use(function(err,req,res,next){
  logger.error(new Error(err))
  console.log('domain Error : ' + err)
  const data = {
    error:true,
    message:'Error:\n' + err
  }
  res.send(data)
})

module.exports = {
    path: "/api/",
    handler: app
}