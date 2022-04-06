<template>
    <v-container>
        <v-toolbar>
            <v-toolbar-title>氏名：{{$auth.user.name}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items><span>ID:{{user.user_id}}</span></v-toolbar-items>
        </v-toolbar>
        <v-card>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-text-field label="名前" v-model="user.name" hint="苗字と名前の間に全角スペースを。"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field label="カナ" v-model="user.kana" hint="全角カナで入力してください。苗字と名前の間は全角スペースを。"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-autocomplete :items="divisions" v-model="user.division"></v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <span>最終ログイン：{{user.last_login}}</span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-checkbox label="管理者権限" v-model="user.admin" disabled></v-checkbox>                            
                        </v-col>
                        <v-col>
                            <v-autocomplete label="役職" :items="positions" v-model="user.position" disabled></v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field label="BIZTEL ID" v-model="user.biztel_id"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="update">更新</v-btn>
            </v-card-actions>
        </v-card>

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
    </v-container>
</template>

<script>
export default {
    data(){
        return{
            user:{},
            divisions:['新規(過払い)','新規(WEB相続)','調査','中決','交面','破産','交渉','完了','カスタマー','債務整理','相続','札幌','名古屋','岡山','広島','松山','高知','熊本','無所属'],
            positions:['SL','L','SM','M'],
            //snackbar
            snack:'',
            snackColor:'',
            snackText:'',

        }
    },
    methods:{
        getUser(id){
            console.log(id)
            this.$axios.get('/api/auth/user/me/',{params:{id:id}})
            .then(response=>{
                console.log(response.data)
                console.log(response.data[0])
                const data = response.data
                this.user = data[0]
            })
        },
        update(){
            this.$axios.put('/api/auth/user/me/',this.user)
            .then(response=>{
                if(response.data.error){return alert(response.data.message)}
                this.popupSnackBar(response.data)
            })
        },
        popupSnackBar(message,color){
                let snackColor = 'success'
                if(color){ snackColor = color }
                this.snack      = true
                this.snackColor = snackColor
                this.snackText  = message
        },
    },
    created(){
        const id = this.$auth.user.userId
        console.log(id)
        this.getUser(id)
    }
}
</script>