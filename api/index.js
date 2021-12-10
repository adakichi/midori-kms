const express = require("express");
const app = express();
const mysql = require('mysql')
const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt =require('jsonwebtoken')
const cors = require('cors')
import {dbConfig,chatworkConf} from '../midori-kms_config'

app.use(cors())

//databaseへのコネクト
const db = mysql.createConnection(dbConfig)
  db.connect((err)=>{
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
          name:user[0].name
        }
        console.log(payload)
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
  app.get('\n/auth/logout',(req,res)=>{
    console.log(req.body)
    console.log('\n--- post /auth/logout/ ---\n' + req.body + ' がログアウトしました。\n--- --- --- ---')
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


////以下payment Agency用////
//get come_in_records
app.get('/payment_agency/cir/',(err,res)=>{
  const sql = 'SELECT * FROM come_in_records'
  db.query(sql,(err,rows,fields)=>{
    if(err){res.send(err)}
    console.log('\n--- /payment_agency/cir/ ---\napi server:\n---x---x---x---x---')
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

module.exports = {
    path: "/api/",
    handler: app
}