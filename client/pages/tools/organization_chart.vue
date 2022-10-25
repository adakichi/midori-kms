<template>
    <v-container>
        <v-row>
            <h1>組織図</h1>
        </v-row>
        <p><v-icon color="yellow">mdi-star</v-icon>サブリーダー　<v-icon color="yellow">mdi-star</v-icon><v-icon color="yellow">mdi-star</v-icon>リーダー</p>
        <p>
            <v-chip color="blue-grey lighten-2">
            ログアウト済み
            <v-avatar class="ml-2" color="grey"><v-icon small>mdi-phone</v-icon></v-avatar>
            </v-chip>
            <v-chip color="grey darken-4">
            本日ログイン無し
            <v-avatar class="ml-2" color="grey"><v-icon small>mdi-phone</v-icon></v-avatar>
            </v-chip>
        </p>
        <v-sheet color="green lighten-2" width="100%" class="pa-4 ma-2" rounded>
        <v-row>
            <v-col v-for="(group,index) in groups.shinki" :key="index">
                <v-card color="light-blue lighten-4">
                    <v-toolbar flat color="light-blue lighten-1">
                        {{group.groupName}}
                        <v-avatar size="30" class="ml-2" :color="biztelColor(group.biztel_id)" @click="toCall(group.biztel_id)"><v-icon small>mdi-phone</v-icon></v-avatar>
                        <v-avatar size="30" class="ml-2" color="white" @click="cwid2Clipboard(group.groupName)">
                            <img
                                alt="Avatar"
                                src="../../assets/img/cw_logomark_color_rgb_PNG.png"
                                width="3px"
                                height="3px"
                            >
                        </v-avatar>
                    </v-toolbar>
                    <v-card-subtitle v-for="(l,index) in group.leader" :key="index" class="black--text">リーダー：{{l}}</v-card-subtitle>
                    <v-card-text>
                        <v-row>
                            <v-col v-for="(item,index) in group.group" :key="index" class="pa-1">
                                <v-chip
                                    :color="chipColor(item.last_login,item.last_logout)"
                                    :text-color="textColor(item.last_login)"
                                >
                                    <v-icon v-if="isLeader(item.position)" v-for="n of countStar(item.position)" :key="n" color="yellow">mdi-star</v-icon>
                                {{item.name}} 
                                <v-avatar class="ml-2" :color="biztelColor(item.biztel_id)" @click="toCall(item.biztel_id)"><v-icon small>mdi-phone</v-icon></v-avatar>
                                </v-chip>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions></v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        </v-sheet>
        <v-sheet color="green lighten-1" width="100%" class="pa-4 ma-2" rounded>
            <v-row>
                <v-col v-for="(group,index) in groups.tokyo" :key="index">
                    <v-card max-width="200" color="light-blue lighten-4">
                        <v-toolbar flat color="light-blue lighten-1">
                            {{group.groupName}}
                            <v-avatar size="30" class="ml-2" :color="biztelColor(group.biztel_id)" @click="toCall(group.biztel_id)"><v-icon small>mdi-phone</v-icon></v-avatar>
                            <v-avatar size="30" class="ml-2" color="white" @click="cwid2Clipboard(group.groupName)">
                                <img
                                    alt="Avatar"
                                    src="../../assets/img/cw_logomark_color_rgb_PNG.png"
                                    width="3px"
                                    height="3px"
                                >
                            </v-avatar>
                        </v-toolbar>
                        <v-card-subtitle v-for="(l,index) in group.leader" :key="index" class="black--text">リーダー：{{l}}</v-card-subtitle>
                        <v-card-text>
                            <v-row>
                                <v-col v-for="(item,index) in group.group" :key="index" class="pa-1">
                                    <v-chip
                                    :color="chipColor(item.last_login,item.last_logout)"
                                    :text-color="textColor(item.last_login)"
                                    >
                                    <v-icon v-if="isLeader(item.position)" v-for="n of countStar(item.position)" :key="n" color="yellow">mdi-star</v-icon>
                                    {{item.name}}
                                    <v-icon v-if="item.judicial_scrivener ? true : false" color="white" style="margin-left:4px;">mdi-card-account-details-outline</v-icon>
                                     <v-avatar class="ml-2"  :color="biztelColor(item.biztel_id)" @click="toCall(item.biztel_id)"><v-icon small>mdi-phone</v-icon></v-avatar>
                                    </v-chip>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions></v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-sheet>
        <v-sheet color="blue darken-3" width="100%" class="pa-4 ma-2" rounded>
            <v-row>
                <v-col v-for="(group,index) in groups.shiten" :key="index">
                    <v-card max-width="200" color="light-blue lighten-4">
                        <v-toolbar flat color="light-blue lighten-1">{{group.groupName}}
                            <v-avatar size="30" class="ml-2" :color="biztelColor(group.biztel_id)" @click="toCall(group.biztel_id)"><v-icon small>mdi-phone</v-icon></v-avatar>
                            <v-avatar size="30" class="ml-2" color="white" @click="cwid2Clipboard(group.groupName)">
                                <img
                                    alt="Avatar"
                                    src="../../assets/img/cw_logomark_color_rgb_PNG.png"
                                    width="3px"
                                    height="3px"
                                >
                            </v-avatar>
                        </v-toolbar>
                        <v-card-subtitle v-for="(l,index) in group.leader" :key="index" class="black--text">リーダー：{{l}}</v-card-subtitle>
                        <v-card-text>
                            <v-row>
                                <v-col v-for="(item,index) in group.group" :key="index" class="pa-1">
                                    <v-chip
                                    :color="chipColor(item.last_login,item.last_logout)"
                                    :text-color="textColor(item.last_login)"
                                    >
                                    <v-icon v-if="isLeader(item.position)" v-for="n of countStar(item.position)" :key="n" color="yellow">mdi-star</v-icon>
                                    {{item.name}}
                                    <v-icon v-if="item.judicial_scrivener ? true : false" color="white" style="margin-left:4px;">mdi-card-account-details-outline</v-icon>
                                     <v-avatar class="ml-2" :color="biztelColor(item.biztel_id)" @click="toCall(item.biztel_id)"><v-icon small>mdi-phone</v-icon></v-avatar>                                
                                    </v-chip>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions></v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-sheet>
    </v-container>
</template>

<script>
import moment from 'moment'
const phonebook = require('../../../client/assets/data/phone_book.json')
export default {
                data(){
                    return{
                        users:[],
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
                    //最終ログイン日が今日の日付であればtrueを返す
                    isLoginToday(login, logout){
                        const todayStr = moment().format('YYYY-MM-DD')
                        const lastLoginStr  = moment(login).format('YYYY-MM-DD')
                        const lastLogoutStr  = moment(logout).format('YYYY-MM-DD')
                        const diff  = moment(lastLoginStr).diff(moment(todayStr),'days')
                        if(diff === 0 ){
                            const logoutDiff  = moment(lastLoginStr).isAfter(moment(lastLogoutStr))
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
                    cwid2Clipboard(groupName){
                        let toText = ''
                        this.users.forEach(item=>{
                            if(groupName == item.division){
                                toText += '[To:' + item.cw_to_id + ']' + item.name
                            }
                        })
                        navigator.clipboard.writeText(toText)
                    },
                    chipColor(login,logout){
                        const todayStr = moment().format('YYYY-MM-DD')
                        const lastLoginStr  = moment(login).format('YYYY-MM-DD')
                        const lastLogoutStr  = moment(logout).format('YYYY-MM-DD')
                        const diff  = moment(lastLoginStr).diff(moment(todayStr),'days')
                        if(diff === 0 ){
                            const logoutDiff  = moment(lastLoginStr).isAfter(moment(lastLogoutStr))
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
    .v-avatar:hover{
        cursor:pointer;
    }
</style>