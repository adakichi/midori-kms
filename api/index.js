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
app.get('/payment_agency/cir/',(err,res)=>{
  let sql = 'SELECT come_in_records_id, customer_id, come_in_name,'
      sql = sql + 'actual_deposit_amount, DATE_FORMAT(actual_deposit_date, "%Y/%m/%d") as actual_deposit_date, come_in_schedule_id '
      sql = sql + 'delete_flag, DATE_FORMAT(created_at,"%Y/%m/%d %H:%i:%s") as created_at, importfile_id FROM come_in_records'
  db.query(sql,(err,rows,fields)=>{
    if(err){res.send(err)}
    console.log('\n--- /payment_agency/cir/ ---\napi server:\n---x---x---x---x---')
    res.send(rows)
  })
})

//post come_in_records
//まず関数
const convertInsertValArray = function(objData){
  return objData.map(obj=>{
    const customerId = obj.customer_id === ''? null : obj.customer_id
    return [
      customerId,
      obj.come_in_name,
      obj.actual_deposit_amount,
      obj.actual_deposit_date,
      1
    ]
  })
}

//
app.post('/payment_agency/cir/', (req,res)=>{
  console.log('\n --- post pa/cir ---')
  const importfileSql = ' insert into importfile_for_come_in_records (name, download_date, total_amount, count, bankname) values (?,?,?,?,?);'
  console.log('fileinfo:')
  console.log(req.body.fileinfo)
  const fileinfoArray =[
    req.body.fileinfo.name,
    req.body.fileinfo.downloadDate,
    req.body.fileinfo.totalAmount,
    req.body.fileinfo.count,
    req.body.fileinfo.bankName
  ] 
  db.beginTransaction((err)=>{
    if(err){console.log(err); throw err }
    db.query(importfileSql,fileinfoArray, (err,row,fields)=>{
      if(err){
        console.log(err)
        return db.rollback(()=>{
          throw err
        })
      }
      console.log(' > insert fileinfo is OK')
      const insertValArray = convertInsertValArray(req.body.data)
      console.log(' > insert val ->')

      //※バルクインサートの方が早いらしいのでSQLの[(?)]を追記するループを作成。
      let cirSql = ' insert into come_in_records (customer_id,come_in_name, actual_deposit_amount, actual_deposit_date, importfile_id) VALUES (?)'
      for(let i = 1; i < insertValArray.length ; i++){
        cirSql = cirSql + ',(?)'
      }
      cirSql = cirSql + ';'
      console.log(cirSql)
      db.query(cirSql,insertValArray,(err2,row2,fields2)=>{
        if(err2){
          console.log('failed insrtVal')
          console.log(err)
          return db.rollback(()=>{
            throw err2
          })
        }
        db.commit((err)=>{
          if(err){
            console.log('failed Commit!!')
            return db.rollback(()=>{
              throw err
            })
          }
          console.log('success!')
          res.send('OK')
        })
      })
    })
  })
})

//get come in schedules
app.get('/payment_agency/cis/',(req,res)=>{
  console.log(req.query)
  let from = ''
  let until = ''
  if(req.query.from || req.query.until){
    console.log(req.query)
    from = req.query.from
    until = req.query.until
  } else {
    from = moment().format('YYYY-MM-DD')
    until = moment().add(30,'days').format('YYYY-MM-DD')
  }
  let sql = 'SELECT customer_id, date_format(payment_day, "%Y/%m/%d")as payment_day, expected_amount, come_in_records_id FROM come_in_schedules '
      sql = sql + 'WHERE payment_day BETWEEN ? AND ?;'
  db.query(sql,[from,until],(err,rows,fields)=>{
    if(err){res.send(err)}
    console.log('\n--- /payment_agency/cis/ ---\napi server:\n---x---x---x---x---')
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

//customers の検索
app.get('/payment_agency/customers/',(req,res)=>{
  console.log('\n--- get/customers---')
  const sql = 'SELECT * FROM customers WHERE customer_id = ?'
  const value = req.query.text
  console.log(' ID:'+value)
  db.query(sql,value,(err,rows,fields)=>{
    if(err){throw err}
    console.log('--- sucess ---')
    res.send(rows)
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
  let sql = 'SELECT payment_account_id, customer_id, pa.creditor_id, creditors.creditor_name, total_amount, monthly_amount, number_of_payments, monthly_payment_due_date, first_amount, DATE_FORMAT(start_date,"%Y/%m/%d %H:%i:%s") as start_date, '
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
  const sql = 'SELECT come_in_schedules_id, customer_id, date_format(payment_day, "%Y/%m/%d")as payment_day, expected_amount, come_in_records_id FROM come_in_schedules WHERE customer_id = ?'
  db.query(sql,id,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})

//顧客毎の支払い予定　登録
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

//支払い予定を取得
app.get('/payment_agency/customer/payment_schedules',(req,res)=>{
  console.log('\n---get Customer payment_schedules ---')
  const id = req.query.id
  const from = req.query.from
  const until = req.query.until
  const isPaidDate = req.query.isPaidDate
  const isExpectedDate = req.query.isExpectedDate
  let sql = ''
  let values = []
  if(id == 0){
    sql = 'SELECT ps.payment_schedule_id, ps.payment_account_id,ps.amount,date_format(ps.date, "%Y/%m/%d")as date, date_format(ps.paid_date,"%Y%m%d")as paid_date , date_format(ps.expected_date,"%Y%m%d")as expected_date ,cu.name,'
    sql = sql + 'bankcode, branchcode, kind, account_number, account_holder FROM payment_schedules as ps '
    sql = sql + 'INNER JOIN payment_accounts as pa ON ps.payment_account_id = pa.payment_account_id INNER JOIN customers as cu ON pa.customer_id = cu.customer_id '
    sql = sql + 'WHERE ps.date BETWEEN ? AND ? '
    values.push(from)
    values.push(until)
    if(isPaidDate == 'true'){
      sql = sql + 'AND ps.paid_date is NOT NULL '
    } else if(isExpectedDate == 'true'){
      sql = sql + 'AND ps.expected_date is NOT NULL AND ps.paid_date is NULL '
    }
    sql = sql + 'ORDER BY date;'
  } else {
    sql = 'SELECT ps.payment_schedule_id, ps.payment_account_id,ps.amount,date_format(ps.date, "%Y/%m/%d")as date, date_format(ps.paid_date,"%Y%m%d")as paid_date, date_format(ps.expected_date,"%Y%m%d")as expected_date, pa.creditor_id FROM payment_schedules as ps INNER JOIN payment_accounts as pa ON ps.payment_account_id = pa.payment_account_id WHERE customer_id = ? ORDER BY date;'
    values.push(id)
  }
  db.query(sql,values,(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})


//支払い予定を仮出金にする。OR　取り消し
app.put('/payment_agency/payment_schedules',(req,res)=>{
  console.log('\n---Put payment_schedules ---')
  const ids = req.body.ids
  const date = req.body.date
  console.log(req.body)
  const sql = ' UPDATE payment_schedules SET expected_date = ? WHERE payment_schedule_id IN (?);'
  db.query(sql,[date,ids],(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})

//出金予定を確定させる OR 取り消し
app.put('/payment_agency/confirm_payment_schedules',(req,res)=>{
  console.log('\n---Put Confirm payment_schedules ---')
  const ids = req.body.ids
  const date = req.body.date
  const sql = ' UPDATE payment_schedules SET paid_date = ? WHERE payment_schedule_id IN (?);'
  db.query(sql,[date,ids],(err,rows,fields)=>{
    if(err){console.log(err); throw err}
    console.log('--- sucess ---')
    res.send(rows)    
  })
})

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
  res.send(err)
})

module.exports = {
    path: "/api/",
    handler: app
}