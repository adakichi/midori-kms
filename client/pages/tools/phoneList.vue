<template>
    <v-container fluid grid-list>
        <v-row>
        <h1>内線表</h1>
                <v-btn @click="fullopen">OPEN</v-btn>
                <v-btn @click="fullclose">CLOSE</v-btn>
                <v-btn @click="all">ALL</v-btn>
                <v-btn @click="none">NONE</v-btn>
        </v-row>
                    <v-expansion-panels v-model="panel" multiple>
        <v-row>
            <v-col v-for="(group,i) in phonebooks" :key="i" sm=4 md=4 lg=3>
                        <v-expansion-panel>
                        <v-expansion-panel-header>
                            {{group.title}}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content
                        >
                        <v-list>
                        <v-list-item
                        v-for="item in group.member"
                        :key="item.number"
                        ><a :href="phoneUrl(item.number)">
                            {{item.name}} : {{item.fixnum}}</a>
                        </v-list-item>
                        </v-list>
                        </v-expansion-panel-content>
                        </v-expansion-panel>
            </v-col>
        </v-row>
                    </v-expansion-panels>
        <v-row>
            <v-col>
                <v-card color="primary" @drop="drop($event, 'お気に入り')">
                    <v-card-title>
                        お気に入り
                    </v-card-title>
                <phone-card class="area-bookmark" :members="bookmarkGroup"></phone-card>
                </v-card>
            </v-col>
            <v-col>
                <v-card>
                    <v-card-title></v-card-title>
                    <v-card-actions></v-card-actions>
                </v-card>
                <div class="accordion" draggable="true" @drop="drop($event, '完了')">
                    <p class="accordion-header" @click="open('customer')">
                        カスタマー</p>
                    <phone-card  class="accordion-body" v-if="isOpen.customer" :members="customerGroup"></phone-card>
                </div>
            </v-col>
            <v-col>
                <div class="accordion" @drop="drop($event, '後方')">
                    <p class="accordion-header" @click="open('backoffice')">
                        債務整理後方</p>
                    <phone-card class="accordion-body" v-if="isOpen.backoffice" :members="backofficeGroup"></phone-card>
                </div>
            </v-col>
            <v-col>
                <div class="accordion" @drop="drop($event, '交渉')">
                    <p class="accordion-header" @click="open('negotiation')">
                        交渉</p>
                    <phone-card class="accordion-body" v-if="isOpen.negotiation" :members="negotiationGroup"></phone-card>
                </div>
            </v-col>
            <v-col>
                <div class="accordion" @drop="drop($event, '交面')">
                    <p class="accordion-header" @click="open('koumen')">
                        交面</p>
                    <phone-card class="accordion-body" v-if="isOpen.koumen" :members="koumenGroup"></phone-card>
                </div>
            </v-col>
            <div>
                <div class="accordion" @drop="drop($event, '調査')">
                    <p class="accordion-header" @click="open('research')">
                        調査</p>
                    <phone-card class="accordion-body" v-if="isOpen.research" :members="researchGroup"></phone-card>
                </div>
                <div class="accordion" @drop="drop($event, '相続')">
                    <p class="accordion-header" @click="open('souzoku')">
                        相続</p>
                    <phone-card class="accordion-body" v-if="isOpen.souzoku" :members="souzokuGroup"></phone-card>
                </div>
                <div class="accordion" @drop="drop($event, 'その他')">
                    <p class="accordion-header" @click="open('sonota')">
                        その他</p>
                    <phone-card class="accordion-body" v-if="isOpen.sonota" :members="sonotaGroup"></phone-card>
                </div>
                <div class="accordion" @drop="drop($event, '新規')">
                    <p class="accordion-header" @click="open('shinki')">
                        新規</p>
                    <phone-card class="accordion-body" v-if="isOpen.shinki" :members="shinkiGroup"></phone-card>
                </div>
            </div>
        </v-row>
    </v-container>
</template>

<script>
const phonebook = require('../../../client/assets/data/phone_book.json')
export default {
                data(){
                    return{
                        panel:[0,1,2,3,4,5,6,7,8],
                        groups:[
                            {'bookmark':this.bookmarkGroup},
                            {'customer':this.customerGroup},
                            {'backoffice':this.backofficeGroup,},
                            {'negotiation':this.negotiationGroup,},
                            {'koumen':this.koumenGroup,},
                            {'research':this.researchGroup,},
                            {'souzoku':this.souzokuGroup,},
                            {'sonota':this.sonotaGroup,},
                            {'shinki':this.shinkiGroup,}
                            ],
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
                    all () {
                        const arr = Object.keys(this.phonebooks)
                        const arr2 = arr.map((ele,idx,arr) => {
                            return idx
                        })
                        this.panel = arr2
                    },
                    none () {
                        this.panel = []
                    },
                    fullopen:function(){
                        Object.keys(this.isOpen).map(key => this.isOpen[key] = true)
                    },
                    fullclose:function(){
                        Object.keys(this.isOpen).map(key => this.isOpen[key] = false)
                    },
                    open: function(group){
                        switch(group){
                            case 'customer':
                                this.isOpen.customer = !this.isOpen.customer
                                break
                            case 'backoffice':
                                this.isOpen.backoffice = !this.isOpen.backoffice
                                break
                            case 'negotiation':
                                this.isOpen.negotiation = !this.isOpen.negotiation
                                break
                            case 'bookmark':
                                this.isOpen.bookmark = !this.isOpen.bookmark
                                break
                            case 'koumen':
                                this.isOpen.koumen = !this.isOpen.koumen
                                break
                            case 'research':
                                this.isOpen.research = !this.isOpen.souzoku
                                break
                                case 'souzoku':
                                this.isOpen.souzoku = !this.isOpen.souzoku
                                break
                                case 'sonota':
                                this.isOpen.sonota = !this.isOpen.sonota
                                break
                                case 'shinki':
                                this.isOpen.shinki = !this.isOpen.shinki
                                break
                        }
                    },
                    dragList:function(event, id){
                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.dropEffect = 'move'
                    event.dataTransfer.setData('list-id', id)
                    console.log('drag')
                    },
                    drop: function(event, group){
                        const dragId = event.dataTransfer.getData('list-id')
                        console.log('dragNumber: ' + dragId)
                        console.log(group)
                        const dragList = this.lists.find(list => list.number == dragId)
                        console.log(dragList)
                        dragList.group = group
                        console.log(dragList)
                    },
                    ale:function(){
                        alert('おとしもの？')
                    },
                    phoneUrl: function(number){
                        return 'callto:' + number
                    }
                },
                computed:{
                    customerGroup(){
                        return this.lists.filter(list => list.group == '完了')
                    },
                    backofficeGroup(){
                        return this.lists.filter(list => list.group == '後方')
                    },
                    negotiationGroup(){
                        return this.lists.filter(list => list.group == '交渉')
                    },
                    bookmarkGroup(){
                        return this.lists.filter(list => list.group == 'お気に入り')
                    },
                    koumenGroup(){
                        return this.lists.filter(list => list.group == '交面')
                    },
                    researchGroup(){
                        return this.lists.filter(list => list.group == '調査')
                    },
                    souzokuGroup(){
                        return this.lists.filter(list => list.group == '相続')
                    },
                    sonotaGroup(){
                        return this.lists.filter(list => list.group == 'その他')
                    },
                    shinkiGroup(){
                        return this.lists.filter(list => list.group == '新規')
                    }
                }
            }
</script>
