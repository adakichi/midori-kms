<template>
    <v-container>
        <v-row>
            <h1>組織図</h1>
        </v-row>
        <v-row>
            <v-col v-for="(group,index) in groups" :key="index">
                <v-card max-width="200" color="light-blue lighten-4">
                    <v-toolbar flat color="light-blue lighten-1">{{group.groupName}}</v-toolbar>
                    <v-card-subtitle>サブタイトル</v-card-subtitle>
                    <v-card-text>
                        <v-row>
                            <v-col v-for="(item,index) in group.group" :key="index" class="pa-1">
                                <v-chip>{{item.name}}</v-chip>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions></v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
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
                        lists:[
                            {name:'完了課',number: '5106',group:'完了'},
                            {name:'熊谷',number: '1037',group:'完了'},
                            {name:'水落',number: '1146',group:'完了'},
                            {name:'渡邊 遥',number: '1068',group:'完了'},
                            {name:'並木',number:'1165',group:'完了',fixnum:'100'},
                            {name:'武田',number:'1240',group:'完了'},
                            {name:'後方課',number:'7201',group:'後方',fixnum:'116/117'},
                            {name:'執行　健吾',number:'1160',group:'後方',fixnum:'118'},
                            {name:'菊地　恵',number:'1193',group:'後方',fixnum:'117'},
                            {name:'青木　優佳',number:'1195',group:'後方',fixnum:'116'},
                            {name:'髙橋　桃花',number:'1199',group:'後方',fixnum:'116'},
                            {name:'深澤　孔明',number:'1218',group:'後方',fixnum:'116'},
                            {name:'竹村　栞',number:'1231',group:'後方',fixnum:'117'},
                            {name:'笠井　菜々香',number:'1243',group:'後方',fixnum:'116'},
                            {name:'交渉課',number: '5104', group:'交渉'},
                            {name:'中谷　絵美里',number: '1042', group:'交渉',fixnum:'121'},
                            {name:'青木　奏',number: '1177', group:'交渉',fixnum:'208'},
                            {name:'中村　仁美',number: '1178', group:'交渉',fixnum:'121'},
                            {name:'兵藤　恵美',number:'1246',  group:'交渉',fixnum:'208'},
                            {name:'交面課',number:'5105', group:'交面'},
                            {name:'斗澤　ゆり',number:'1165', group:'交面',fixnum:'107'},
                            {name:'渡辺　昌平',number:'1169', group:'交面',fixnum:'107'},
                            {name:'長谷川　遥陽',number:'1249', group:'交面',fixnum:'107'},
                            {name:'調査課',number:'5103', group:'調査'},
                            {name:'中嶋　祐貴',number:'1024', group:'調査',fixnum:'102'},
                            {name:'田中　舞',number:'1061', group:'調査',fixnum:'110'},
                            {name:'野村　美範',number:'1184', group:'調査'},
                            {name:'後藤　笑里',number:'1241', group:'調査',fixnum:'206'},
                            {name:'相続課',number:'5106', group:'相続',fixnum:''},
                            {name:'原田　知明',number:'1012', group:'相続',fixnum:'127'},
                            {name:'辻井　依子',number:'1144', group:'相続',fixnum:'122'},
                            {name:'蝋山　暢子',number:'1076', group:'相続',fixnum:'130'},
                            {name:'島口　卓',number:'1111', group:'相続',fixnum:'126'},
                            {name:'その他',number:'', group:'その他'},
                            {name:'寺島　能史',number:'1001', group:'その他',fixnum:'209'},
                            {name:'玉津島　直樹',number:'1059', group:'その他',fixnum:'109'},
                            {name:'荒井　美紀',number:'1036', group:'その他',fixnum:'201'},
                            {name:'新規　債務整理',number:'5002', group:'新規',fixnum:''},
                            {name:'吉澤　朋枝',number:'1093', group:'新規',fixnum:'125'},
                            {name:'早川　阿希',number:'1174', group:'新規',fixnum:'111'},
                            {name:'西島　尊',number:'1131', group:'新規',fixnum:'108'},
                            {name:'石井　亜沙美',number:'', group:'新規',fixnum:'124'},
                            {name:'下里 弓恵',number:'', group:'新規',fixnum:'104'},
                            {name:'お気に入り',number:'', group:'お気に入り'}
                        ]                        
                    }
                },
                methods: {
                    getUsers(){
                        this.$axios.get('api/auth/user/allUsers')
                        .then(response=>{
                            this.users = response.data
                        })
                    },
                },
                computed:{
                    groups(){
                        return [
                            { group:this.shinkiGroup,groupName:'新規'},
                            { group:this.kanryouGroup,groupName:'完了'},
                            { group:this.chousaGroup,groupName:'調査'},
                            { group:this.chuketuGroup,groupName:'中決'},
                            { group:this.customerGroup,groupName:'カスタマー'},
                            { group:this.kousyouGroup,groupName:'交渉'},
                            { group:this.mushozokuGroup,groupName:'無所属'},
                            { group:this.sapporoGroup,groupName:'札幌'},
                            { group:this.nagoyaGroup,groupName:'名古屋'},
                            { group:this.okayamaGroup,groupName:'岡山'},
                            { group:this.hiroshimaGroup,groupName:'広島'},
                            { group:this.matuyamaGroup,groupName:'松山'},
                            { group:this.kouchiGroup,groupName:'高知'},
                            { group:this.kumamotoGroup,groupName:'熊本'}
                            ]
                    },
                    shinkiGroup(){
                        return this.users.filter(user => user.division == '新規')
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
