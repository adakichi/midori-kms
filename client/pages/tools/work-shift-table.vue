<template>
    <v-container>
        <v-row>
            <h1>シフト</h1>
        </v-row>
        <p><v-icon color="yellow">mdi-star</v-icon>サブリーダー　<v-icon color="yellow">mdi-star</v-icon><v-icon color="yellow">mdi-star</v-icon>リーダー</p>
        <v-row>
                <v-menu offset-y open-on-hover>
                    <template v-slot:activator="{on,attr}">
                        <v-btn  @click="pushselectDivisions(shinkiD)" v-bind="attr" v-on="on" class="mr-3">新規</v-btn>
                    </template>
                    <v-list dense>
                        <v-list-item link v-for="d in shinkiD" :key="d">
                            <v-list-item-content @click="pushselectDivisions([d])" >{{d}}</v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-menu offset-y open-on-hover>
                    <template v-slot:activator="{on,attr}">
                        <v-btn  @click="pushselectDivisions(['調査','中決','交面','破産','交渉','完了','カスタマー','相続','無所属'])" v-bind="attr" v-on="on" class="mr-3">東京</v-btn>
                    </template>
                    <v-list dense>
                        <v-list-item link v-for="d in tokyoD"  :key="d">
                            <v-list-item-title @click="pushselectDivisions([d])">{{d}}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-btn @click="pushselectDivisions(souzokuD)" class="mr-3">相続</v-btn>
                <v-btn @click="pushselectDivisions(musyozokuD)" class="mr-3">無所属</v-btn>

                <v-menu offset-y open-on-hover>
                    <template v-slot:activator="{on,attr}">
                        <v-btn @click="pushselectDivisions(shitenD)" v-bind="attr" v-on="on" class="mr-3">支店</v-btn>
                    </template>
                    <v-list dense>
                        <v-list-item link v-for="d in shitenD"  :key="d">
                            <v-list-item-title @click="pushselectDivisions([d])">{{d}}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-btn @click="pushselectDivisions(divisions)" class="mr-3">全選択</v-btn>
        </v-row>
        <!-- v-chip -->
        <v-row>
        <v-card height="100px" class="pa-2 mt-1" width="100%">
                <v-chip v-for="(division,index) in selectDivisions" :key="index" class="mr-1 mt-1" close @click:close="pushselectDivisions([division])">{{division}}</v-chip>
        </v-card>
        </v-row>
        <v-row>
            <v-card>
                <v-data-table
                :items="selectUsers"
                :headers="selectUsersHeaders"
                :items-per-page="-1"
                fixed-header
                no-data-text="部署が選択されていません"
                >
                </v-data-table>
            </v-card>
        </v-row>
    </v-container>
</template>

<script>
import moment from 'moment'
export default {
                data(){
                    return{
                        users:[],
                        //////////////////////////////
                        divisions:['新規(過払い)','新規(WEB相続)','調査','中決','交面','破産','交渉','完了','カスタマー','相続','無所属','札幌','名古屋','岡山','広島','松山','高知','熊本'],
                        shinkiD:['新規(過払い)','新規(WEB相続)'],
                        tokyoD:['調査','中決','交面','破産','交渉','完了','カスタマー'],
                        souzokuD:['相続'],
                        musyozokuD:['無所属'],
                        shitenD:['札幌','名古屋','岡山','広島','松山','高知','熊本'],
                        //////////////////////////////
                        selectDivisions:[],
                    }
                },
                methods: {
                    getUsers(){
                        this.$axios.get('api/auth/user/allUsers')
                        .then(response=>{
                            this.users = response.data
                        })
                    },
                    pushselectDivisions(divisions){
                        const result = divisions.every(sd=>{
                            return this.selectDivisions.includes(sd)
                        })
                        console.log(result)
                        if(result){
                            const newArray = this.selectDivisions.filter(d=>{
                                return divisions.indexOf(d) == -1
                            })
                            console.log(newArray)
                            this.selectDivisions = newArray
                        } else {
                            this.selectDivisions.push(...divisions)
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
                            return this.selectDivisions.some(div=>{
                                return div === u.division
                            })
                        })
                    },
                    selectUsersHeaders(){
                        let endOfMonth = Number(moment().endOf('month').format('D'))
                        let headers = [{text:'名前',   value:'name',    width:'140px',divider:true}]
                        for(let i = 1; i <= endOfMonth ; i++){
                            headers.push({text:i,value:i,divider:true, sortable:false})
                        }
                        return headers
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
                    this.selectDivisions.push(this.$auth.user.division)
                }
            }
</script>