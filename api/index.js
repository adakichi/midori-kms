const express = require("express");
const app = express();


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



module.exports = {
    path: "/api/",
    handler: app
}