<template>
    <v-container>
        <v-row>
            <h1>シフト</h1>
        </v-row>
        <p><v-icon color="yellow">mdi-star</v-icon>サブリーダー　<v-icon color="yellow">mdi-star</v-icon><v-icon color="yellow">mdi-star</v-icon>リーダー</p>
        <v-row>
            <v-col v-for="d in divisions"  :key="d">
                <v-checkbox v-model="selectDivision" :label="d" :value="d"></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-card>
                <v-simple-table fixed-header height="350" dense>
                    <template v-slot:default>
                    <thead>
                        <tr>
                        <th>
                            名前
                        </th>
                        <th v-for="n in 31" :key="n">{{n}}日</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in selectUsers" :key="user.id">
                            <td>{{user.name}}</td>
                            <td v-for="i in 31" :key="i"  @click="whatday(i,user)">{{i}}</td>
                        </tr>
                    </tbody>
                    </template>
                </v-simple-table>
            </v-card>
        </v-row>
    </v-container>
</template>

<script>
import moment from 'moment'
const phonebook = require('../../../client/assets/data/phone_book.json')
export default {
                data(){
                    return{
                        users:[],
                        divisions:['新規(過払い)','新規(WEB相続)','調査','中決','交面','破産','交渉','完了','カスタマー','相続','無所属','札幌','名古屋','岡山','広島','松山','高知','熊本'],
                        selectDivision:[],
                        panel:[0,1,2,3,4,5,6,7,8],
                        isOpen : {
                            customer:false,
                            backoffice:false,
                            negotiation:false,
                            koumen:false,
                            research:false,
                            souzoku:false,
                            sonota:false,
                            shinki:false,
                            bookmark:false
                        },
                        phonebooks:phonebook.book,
                    }
                },
                methods: {
                    getUsers(){
                        this.$axios.get('api/auth/user/allUsers')
                        .then(response=>{
                            this.users = response.data
                        })
                    },
                    whatday(i,user){
                        alert(user.name+"さんの\n"+i+"日目です")
                    },
                    //最終ログイン日が今日の日付であればtrueを返す
                    isLoginToday(login, logout){
                        const today = moment()
                        const lastLogin  = moment(login)
                        const lastLogout  = moment(logout)
                        const diff  = lastLogin.diff(today,'days')
                        if(diff === 0 ){
                            const logoutDiff  = lastLogin.isAfter(lastLogout)
                            if(logoutDiff){
                                return true
                            } else {
                                return false
                            }
                        } else {
                            return false
                        }
                    },
                    toCall(num){
                        if(num === null || num === ''){ return alert('BIZTELの設定がありません')}
                        const a = document.createElement('a')
                        a.href = 'callto:'+num
                        a.click()
                    },
                    chipColor(login,logout){
                        const today = moment()
                        const lastLogin  = moment(login)
                        const lastLogout  = moment(logout)
                        const diff  = lastLogin.diff(today,'days')
                        if(diff === 0 ){
                            const logoutDiff  = lastLogin.isAfter(lastLogout)
                            if(logoutDiff){
                                return 'green accent-3'
                            } else {
                                return 'blue-grey lighten-2'
                            }
                        } else {
                            return 'grey darken-2'
                        }
                    },
                    textColor(d){
                        const today = moment()
                        const last  = moment(d)
                        const diff  = last.diff(today,'days')
                        if(diff === 0 ){
                            return 'grey lighten-4'
                        } else {
                            return 'white'
                        }
                    },
                    biztelColor(num){
                        if(num === null || num === ''){
                            return 'grey'
                        } else {
                            return 'orange'
                        }
                    },
                    isLeader(p){
                        switch(p){
                            case 'SL':
                                return true //SMは特に表示させない
                            break
                            case 'L':
                                return true //SMは特に表示させない
                            break
                            case 'SM':
                                return false //SMは特に表示させない
                            break
                            default:
                                return false
                            break
                        }
                    },
                    countStar(p){
                        switch(p){
                            case 'SL':
                                return 1 
                            break
                            case 'L':
                                return 2 
                            break
                            case 'SM':
                                return 3 //SMは特に表示させない
                            break
                            default:
                                return false
                            break
                        }
                    }
                },
                computed:{
                    selectUsers(){
                        return this.users.filter(u=>{
                            return this.selectDivision.some(div=>{
                                return div === u.division
                            })
                        })
                    },
                    groups(){
                        return {
                            shinki:[
                                { group:this.shinkiKabaraiGroup,    groupName:'新規(過払い)', biztel_id:'5001',     leader:['下里']},
                                { group:this.shinkiWebGroup,        groupName:'新規(WEB相続)',biztel_id:'5002',   leader:[]}
                            ],
                            tokyo:[
                                { group:this.chousaGroup,groupName:'調査',          biztel_id:'5103',          leader:['中嶋']},
                                { group:this.chuketuGroup,groupName:'中決',         biztel_id:'5106',         leader:['湯浅']},
                                { group:this.koumenGroup,groupName:'交面',          biztel_id:'5105',        leader:['斗澤']},
                                { group:this.hasanGroup,groupName:'破産',           biztel_id:'1021',       leader:['田尾']},
                                { group:this.kousyouGroup,groupName:'交渉',         biztel_id:'5104',         leader:['中谷']},
                                { group:this.kanryouGroup,groupName:'完了',         biztel_id:'5106',         leader:['水落']},
                                { group:this.customerGroup,groupName:'カスタマー',  biztel_id:'5109',  leader:['菊地']},
                                { group:this.souzokuGroup,groupName:'相続',         biztel_id:'5107',         leader:['原田']},
                                { group:this.mushozokuGroup,groupName:'無所属',     biztel_id:'',     leader:['']},
                            ],
                            shiten:[
                                { group:this.sapporoGroup,groupName:'札幌', biztel_id:'5201',},
                                { group:this.nagoyaGroup,groupName:'名古屋',biztel_id:'5202',},
                                { group:this.okayamaGroup,groupName:'岡山', biztel_id:'5203',},
                                { group:this.hiroshimaGroup,groupName:'広島',biztel_id:'5104',},
                                { group:this.matuyamaGroup,groupName:'松山',biztel_id:'5205',},
                                { group:this.kouchiGroup,groupName:'高知',  biztel_id:'5206',},
                                { group:this.kumamotoGroup,groupName:'熊本',biztel_id:'5207',}
                            ]
                        }
                    },
                    shinkiKabaraiGroup(){
                        return this.users.filter(user => user.division == '新規(過払い)')
                    },
                    shinkiWebGroup(){
                        return this.users.filter(user => user.division == '新規(WEB相続)')
                    },
                    kanryouGroup(){
                        return this.users.filter(user => user.division == '完了')
                    },
                    customerGroup(){
                        return this.users.filter(user => user.division == 'カスタマー')
                    },
                    kousyouGroup(){
                        return this.users.filter(user => user.division == '交渉')
                    },
                    hasanGroup(){
                        return this.users.filter(user => user.division == '破産')
                    },
                    chuketuGroup(){
                        return this.users.filter(user => user.division == '中決')
                    },
                    koumenGroup(){
                        return this.users.filter(user => user.division == '交面')
                    },
                    chousaGroup(){
                        return this.users.filter(user => user.division == '調査')
                    },
                    souzokuGroup(){
                        return this.users.filter(user => user.division == '相続')
                    },
                    mushozokuGroup(){
                        return this.users.filter(user => user.division == '無所属')
                    },
                    sapporoGroup(){
                        return this.users.filter(user => user.division == '札幌')
                    },
                    nagoyaGroup(){
                        return this.users.filter(user => user.division == '名古屋')
                    },
                    okayamaGroup(){
                        return this.users.filter(user => user.division == '岡山')
                    },
                    hiroshimaGroup(){
                        return this.users.filter(user => user.division == '広島')
                    },
                    matuyamaGroup(){
                        return this.users.filter(user => user.division == '松山')
                    },
                    kouchiGroup(){
                        return this.users.filter(user => user.division == '高知')
                    },
                    kumamotoGroup(){
                        return this.users.filter(user => user.division == '熊本')
                    }
                },
                created(){
                    this.getUsers()
                }
            }
</script>

<style scoped>
    table th,table td{
        width: 100%;
    }
    table tr{
        border-bottom: 1px solid black;
    }
</style>