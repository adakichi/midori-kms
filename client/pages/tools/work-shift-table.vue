<template>
    <v-container>
        <v-row>
            <h1>シフト</h1>
        </v-row>
        <p><v-icon color="yellow">mdi-star</v-icon>サブリーダー　<v-icon color="yellow">mdi-star</v-icon><v-icon color="yellow">mdi-star</v-icon>リーダー</p>
        <v-row>
            <v-btn @click="openDialog">一括登録</v-btn>
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
            <v-dialog v-model="dialog" max-width="700px">
                <v-card color="lightstategrey" class="white--text">
                    <v-card-title>{{regist.name}}:{{regist.user_id}}<v-spacer></v-spacer><v-icon :disabled="isBefore" @click="subtractMonth()">mdi-chevron-left</v-icon>{{selectMonth}}月<v-icon @click="addMonth()">mdi-chevron-right</v-icon></v-card-title>
                    <v-card-text>
                        <v-tooltip v-for="n in Array.from('ABCDE')" :key="n" bottom>
                            <template v-slot:activator="{on,attrs}">
                                <v-chip color="green lighten-1" class="mr-3" v-bind="attrs" v-on="on">{{n}}</v-chip>
                            </template>
                            <span>{{shiftType[n].start}} ~ {{shiftType[n].end}}</span>
                        </v-tooltip>
                        <v-tooltip v-for="n in Array.from('FGHIJKLMN')" :key="n" bottom>
                            <template v-slot:activator="{on,attrs}">
                                <v-chip color="green darken-4" class="mr-3" v-bind="attrs" v-on="on">{{n}}</v-chip>
                            </template>
                            <span>{{shiftType[n].start}} ~ {{shiftType[n].end}}</span>
                        </v-tooltip>
                    </v-card-text>
                    <v-card-text>
                        <v-simple-table style="background-color:lightslategray; color:black;">
                            <thead>
                                <tr>
                                    <th style="width:30px;">月</th>
                                    <th style="width:30px;">火</th>
                                    <th style="width:30px;">水</th>
                                    <th style="width:30px;">木</th>
                                    <th style="width:30px;">金</th>
                                    <th style="width:30px;">土</th>
                                    <th style="width:30px;">日</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="m in 6" :key="m">
                                    <td v-for="n in 7" :key="n" :style="'background-color:'+bgc(n)+';'">
                                        {{returnDate(shiftTable[((m-1)*7)+n])}}<br>
                                        {{returnStart(shiftTable[((m-1)*7)+n])}}<br>
                                        {{returnEnd(shiftTable[((m-1)*7)+n])}}
                                    </td>
                                </tr>
                            </tbody>
                        </v-simple-table>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>{{users}}
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

                        // dialog ////////////////////////////
                        dialog:true,
                        selectMonth:null,
                        shiftTable2:[
                            {'週':'1週目','月':'','火':'','水':'','木':'','金':'','土':'','日':'',},
                            {'週':'2週目','月':'','火':'','水':'','木':'','金':'','土':'','日':'',},
                            {'週':'3週目','月':'','火':'','水':'','木':'','金':'','土':'','日':'',},
                            {'週':'4週目','月':'','火':'','水':'','木':'','金':'','土':'','日':'',},
                            {'週':'5週目','月':'','火':'','水':'','木':'','金':'','土':'','日':'',},
                        ],
                        shiftTable:[
                        ],
                        shiftTableHeaders:[
                            {text:'週',value:'週', width:'10px', sortable:false, divider:true, align:'center'},
                            {text:'月',value:'月', width:'15px', sortable:false, divider:true, align:'center'},
                            {text:'火',value:'火', width:'15px', sortable:false, divider:true, align:'center'},
                            {text:'水',value:'水', width:'15px', sortable:false, divider:true, align:'center'},
                            {text:'木',value:'木', width:'15px', sortable:false, divider:true, align:'center'},
                            {text:'金',value:'金', width:'15px', sortable:false, divider:true, align:'center'},
                            {text:'土',value:'土', width:'15px', sortable:false, divider:true, align:'center'},
                            {text:'日',value:'日', width:'15px', sortable:false, divider:true, align:'center'},
                        ],
                        regist:{ name:'', user_id:'', days:[]},
                        shiftType:{
                            'A':{type:'A', start:'09:00', end:'18:00'},
                            'B':{type:'B', start:'10:00', end:'19:00'},
                            'C':{type:'C', start:'12:00', end:'21:00'},
                            'D':{type:'D', start:'11:00', end:'20:00'},
                            'E':{type:'E', start:'08:00', end:'17:00'},
                            'F':{type:'F', start:'09:00', end:'17:00'},
                            'G':{type:'G', start:'09:30', end:'18:30'},
                            'H':{type:'H', start:'13:00', end:'19:00'},
                            'I':{type:'I', start:'09:00', end:'14:00'},
                            'J':{type:'J', start:'09:00', end:'15:00'},
                            'K':{type:'K', start:'09:00', end:'16:00'},
                            'L':{type:'L', start:'10:00', end:'15:00'},
                            'M':{type:'M', start:'15:00', end:'19:00'},
                            'N':{type:'N', start:'13:00', end:'21:00'},
                            'O':{type:'O', start:'14:00', end:'21:00'},
                            'P':{type:'P', start:'15:00', end:'21:00'},
                            'Q':{type:'Q', start:'16:00', end:'21:00'},
                            'R':{type:'R', start:'17:00', end:'21:00'},
                            'S':{type:'S', start:'10:00', end:'17:00'},
                            'T':{type:'T', start:'10:00', end:'16:00'},
                            'U':{type:'U', start:'18:00', end:'21:00'},
                        }
                    }
                },
                methods: {
                    returnDate(obj){
                        if(!obj){return }
                        return moment(obj?.date).format('DD日')
                    },
                    returnType(){
                        if(!obj){return }
                        if(obj.day_off !== '出勤'){ return '●'}
                    },
                    returnStart(obj){
                        return obj?.start
                    },
                    returnEnd(obj){
                        return obj?.end
                    },
                    bgc(num){
                        if(num == 6){
                            return 'steelblue'
                        } else if(num == 7){
                            return 'pink'
                        } else {
                            return 'silver'
                        }
                    },
                    addMonth(){
                        this.selectMonth = moment(this.selectMonth).add(1,'month').format('YYYY/MM/DD')
                        this.pushShiftTable()
                    },
                    subtractMonth(){
                        this.selectMonth = moment(this.selectMonth).subtract(1,'month').format('YYYY/MM/DD')
                        this.pushShiftTable()
                    },
                    pushShiftTable(){
                        const first = moment(this.selectMonth)
                        let firstday = first.day()
                        const startday = ((firstday + 1) % 7) + 6
                        let array = Array(42)
                        for(let i = startday; i < 37 + startday; i++){
                            const d = moment(first).add(i-startday,'days')
                            let isDayOff = false
                            if(d.day() === 0 || d.day() === 6) {isDayOff = true}
                            if(d.isAfter(moment(first).subtract(1,'month').endOf('month')) && d.isBefore(moment(first).add(1,'month').startOf('month'))){
                                array[i] = {
                                    date:d.format('YYYY-MM-DD'),
                                    start: isDayOff ? '00:00:00' : '09:00:00',
                                    end  : isDayOff ? '00:00:00' : '18:00:00',
                                    day_off:isDayOff ? '法定' : '出勤',
                                    user_id:this.$auth.user.userId
                            }

                            }
                        }
                        this.shiftTable = []
                        this.shiftTable = array

                    },
                    getUsers(){
                        this.$axios.get('api/work-shift')
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
                    },
                    openDialog(){
                        this.dialog = true
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
                    },
                    isBefore(){
                        return !moment().isBefore(this.selectMonth)
                    }
                },
                created(){
                    this.selectMonth = moment().add(1,'month').startOf('month').format('YYYY/MM/DD')
                    this.pushShiftTable()
                    this.getUsers()
                    this.regist = {name:this.$auth.user.name, user_id:this.$auth.user.userId}
                    this.selectDivisions.push(this.$auth.user.division)
                }
            }
</script>

<style scoped>
    th{
        font: bold;
        font-size: 12px;
    }
    th, td{
        border: solid 1px gainsboro;
    }
</style>