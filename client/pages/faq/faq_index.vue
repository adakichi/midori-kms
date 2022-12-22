<template>
    <div>
        <h1>
            <v-avatar>
                <v-icon>mdi-frequently-asked-questions</v-icon>
            </v-avatar>
            FAQ
            <v-spacer></v-spacer>
        </h1>
        <v-row>
            <v-col>
                <v-text-field label="キーワード検索" outlined v-model="keyword"></v-text-field>
            </v-col>
            <v-col>
                <v-btn 
                    v-if="$auth.user ? ($auth.user.isAdmin === 1 ? true : false ) : false "
                    @click="openDialog()"
                >
                新規登録</v-btn>
            </v-col>
        </v-row>

        <!-- 登録ダイアログ -->
        <v-dialog v-model="dialogIsOpen">
                <v-card>
                    <v-card-title>新規FAQ登録</v-card-title>
                    <v-card-text>
                        <v-text-field label="タイトル"      v-model="newFaq.title" filled></v-text-field>
                        <v-textarea label="質問"          v-model="newFaq.question" filled></v-textarea>
                        <v-textarea label="回答"          v-model="newFaq.answer" filled></v-textarea>
                        <v-autocomplete label="カテゴリ"  v-model="newFaq.category" filled :items="category"></v-autocomplete>
                        <v-text-field label="googleスライドのURL"    v-model="newFaq.slide_url" filled></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="registNewFaq()">登録</v-btn>
                    </v-card-actions>
                </v-card>
        </v-dialog>


            <v-row>
                <v-col
                xl="6" lg="6" md="6" sm="12"
                v-for="item in filteredFaq"
                :key="item.id"
                >
                    <v-card>
                        <v-card-title>
                            <v-row>
                                <v-col>
                                    #{{item.id}}.
                                    <v-text-field
                                        v-model="item.title"
                                        label="タイトル"
                                        :disabled="$auth.user ? ($auth.user.isAdmin === 1 ? false : true ) : true "
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col>
                                    <h3>質問</h3>
                                    <v-textarea
                                        v-model="item.question"
                                        auto-grow
                                        outlined
                                        :disabled="$auth.user ? ($auth.user.isAdmin === 1 ? false : true ) : true "
                                    ></v-textarea>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <h3>回答</h3>
                                    <v-textarea
                                        v-model="item.answer"
                                        auto-grow
                                        outlined
                                        :disabled="$auth.user ? ($auth.user.isAdmin === 1 ? false : true ) : true "
                                    ></v-textarea>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn block x-large @click="openSlide(item)" color="primary">スライドを開く</v-btn>
                        </v-card-actions>
                        <v-card-text>
                            <v-text-field
                             v-if="$auth.user ? ($auth.user.isAdmin === 1 ? true : false ) : false "
                             label="google slide URL"
                             v-model="item.slide_url"
                            ></v-text-field>
                        </v-card-text>
                        <v-card-actions style="font-size:9px;">
                            カテゴリー：
                            <v-autocomplete
                             :items="category"
                              v-model="item.category"
                             :disabled="$auth.user ? ($auth.user.isAdmin === 1 ? false : true ) : true "
                            ></v-autocomplete>
                            <v-spacer/>
                            最終更新日：{{item.updated_at}}
                            <v-spacer/>
                            <v-btn v-if="$auth.user ? ($auth.user.isAdmin === 1 ? true : false ) : false " color="warning" @click="updateFaq(item)">更新</v-btn>
                            <v-btn v-if="$auth.user ? ($auth.user.isAdmin === 1 ? true : false ) : false " color="warning" @click="deleteFaq(item)" >削除</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        <slide-view ref="slide" :slide="activeSlide"></slide-view>

        <!-- スナックバー -->
        <v-snackbar
            v-model="snack"
            :timeout="3000"
            :color="snackColor"
        >
            {{ snackText }}
            <template v-slot:action="{ attrs }">
            <v-btn
                v-bind="attrs"
                text
                @click="snack = false"
            >
                Close
            </v-btn>
            </template>
        </v-snackbar>

    </div>
</template>

<script>
import slide_view from '~/components/slide_view.vue';
export default {
  components: { slide_view },
    head(){
        return {
            title: 'FAQ Top',
        }
    },
    data(){
        return {
            dialogIsOpen:false,
            newFaq:{title:'',question:'',answer:'',category:'',slide_url:''},
            keyword:'',
            faq:[{id:'0', title:'なし', question:'質問',answer:'回答',slide_url:'https://hogehoge.com',category:'その他'}],   
            activeSlide:{},
            category:['メール','LINE','VPN','WINDOWS','プリンター(印刷)','エクセル','チャットワーク','その他'],

            //snack bar
            snack:'',
            snackColor:'',
            snackText:''
        }
    },
    computed:{
        filteredFaq(){
            if(this.keyword){
                return this.faq.filter(item=>{
                    if(String(item.id).indexOf(this.keyword) > -1 ){ return true }
                    if(item.title.indexOf(this.keyword) > -1 ){ return true }
                    if(item.question.indexOf(this.keyword) > -1 ){ return true }
                    if(item.answer.indexOf(this.keyword) > -1 ){ return true }
                    if(item.category.indexOf(this.keyword) > -1 ){ return true }
                })
            } else {
                return this.faq
            }
        }
    },
    methods:{
        openSlide(slideData){
            const slide = {
                id:slideData.id,
                title:slideData.title,
                src:slideData.slide_url
            }
            this.activeSlide = slide
            this.$refs.slide.clickOpenBtn()
        },
        openDialog(){
            this.dialogIsOpen = true
        },
        getFaq(){
            this.$axios.get('api/faq/')
            .then((response)=>{
                if(response.data.error){ return alert(response.data.message)}
                this.faq = response.data
            })
        },
        registNewFaq(){
            this.$axios.post('api/faq/',this.newFaq)
            .then((response)=>{
                if(response.data.error){ return alert(response.data.message)}
                this.popupSnackBar('ID:'+response.data.insertId+'として登録しました。')

                // 初期化
                this.getFaq()
                this.newFaq = {question:'',answer:'',category:'',slide_url:''}
                this.dialogIsOpen = false
            })
        },
        updateFaq(faq){
            const yesno = !confirm('更新しますか？')
            if(yesno){return}
            this.$axios.put('api/faq/',faq)
            .then((response)=>{
                console.log(response.data)
                if(response.data.error){ return alert(response.data.message)}
                this.popupSnackBar(faq.title+'を更新しました。')
                this.getFaq()
            })
        },
        deleteFaq(faq){
            const yesno = !confirm('削除しますか？')
            if(yesno){return}
            this.$axios.delete('api/faq/',{data:faq})
            .then((response)=>{
                console.log(response.data)
                if(response.data.error){ return alert(response.data.message)}
                this.popupSnackBar('『'+faq.title+'』を削除しました。')
                this.getFaq()
            })
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
        }
    },
    created(){
        this.getFaq()
        if(this.$route.query.str != ""){
            console.log(typeof(this.$route.query.str))
            this.keyword = this.$route.query.str
        } 
    }
};
</script>