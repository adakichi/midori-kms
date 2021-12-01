const express = require("express");
const app = express();
const mysql = require('mysql')
const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt =require('jsonwebtoken')

//databaseへのコネクト
const db = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'XonurO',
    database: 'comic_list'
  })
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


import {chatworkConf} from '../midori-kms_config'


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
          name:user[0].user_id
        }
        console.log(payload)
        console.log('---Done post login process---')
        const token = jwt.sign(payload, 'secret')
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
    const insertSql = 'INSERT INTO USERS (user_id, password) VALUES (?,?)'
    bcrypt.hash(req.body.password, saltRounds, (err,hash)=>{
      db.query(insertSql, [req.body.userId, hash],(err)=>{
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
//検索用エンドポイント
app.post('/biztel/search',(req,res)=>{
  console.log('\n--- BIZTEL search ---')
  console.log(req.body)
  res.set('Content-Type: text/csv; charset=us-ascii')
  res.set('Content-Type', 'text/csv; charset=us-ascii')
  res.send(Buffer.from('test太郎,リードユー'))
  console.log('---x---x---x---x---')
})

//応答時エンドポイント
app.post('/biztel/pickup',(req,res)=>{
  console.log('\n--- BIZTEL pickup ---')
  console.log(req.body.tel)
  console.log(req.body.called)
  res.set('Content-Type: text/csv; charset=us-ascii')
  res.set('Content-Type', 'text/csv; charset=us-ascii')
  res.send(Buffer.from('OK'))
  console.log('---x---x---x---x---')
})

//切断時エンドポイント
app.post('/biztel/hangup',(req,res)=>{
  console.log('\n--- BIZTEL hangup ---')
  console.log(req.body.tel)
  console.log(req.body.called)
  res.set('Content-Type: text/csv; charset=us-ascii')
  res.set('Content-Type', 'text/csv; charset=us-ascii')
  res.send(Buffer.from('OK'))
  console.log('---x---x---x---x---')
})

// データベースのendは不要です。
// db.end()

module.exports = {
    path: "/api/",
    handler: app
}