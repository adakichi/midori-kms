<template>
    <v-container>
        <v-row>
            <v-col>
                <v-app-bar>
                    <v-spacer></v-spacer>
                    <div>
                    <v-menu
                     ref="menu"
                     v-model="menu"
                     :close-on-content-click="false"
                     :return-value.sync="dateRange"
                     transition="scale-transition"
                     offset-y
                     left
                     min-width="auto"
                    >
                        <template v-slot:activator="{on, attrs}">
                            <v-text-field
                             v-model="dateRange"
                             label="範囲を選択してください"
                             prepend-icon="mdi-calendar"
                             readonly
                             v-bind="attrs"
                             v-on="on"
                             ></v-text-field>
                        </template>
                    <v-date-picker
                     v-model="dateRange"
                     range
                    >
                    <v-spacer></v-spacer>
                    <v-btn
                     text
                     color="primary"
                     @click="$refs.menu.save(dateRange)"
                     >OK
                    </v-btn>
                    </v-date-picker>
                    </v-menu>
                    </div>
                    <v-radio-group v-model="bank" row>
                        <v-radio label="三井" value="ﾐﾂｲｽﾐﾄﾓ"></v-radio>
                        <v-radio label="四国" value="ｼｺｸｷﾞﾝｺｳ"></v-radio>
                        <v-radio label="両方" value="all"></v-radio>
                    </v-radio-group>
                    <v-spacer></v-spacer>
                    <v-btn @click="searchImportfile">検索</v-btn>
                    <v-btn @click="goIndex">戻る</v-btn>
                </v-app-bar>
                <v-data-table
                :headers="headers"
                :items="importfiles"
                item-key="id"
                :items-per-page="-1"
                class="elevation-1"
                :search="search"
                show-group-by
                dense
                >
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    layaout:'pa',
    data(){
        return {
            search:'',
            importfiles:[],
            menu:false,
            bank:'all',
            dateRange:[],
            headers:[
                { text:'id',       value:'importfile_id'},
                { text:'name',      value:'name'},
                { text:'銀行',      value:'bankname'},
                { text:'件数',      value:'count'},
                { text:'読込件数',      value:'imported_number'},
                { text:'金額',      value:'total_amount', groupable:false},
                { text:'日付',      value:'date'},
            ]
        }
    },
    methods:{
        goIndex(){
            this.$router.push('/payment_agency/come_in_records/')
        },
        searchImportfile(){
            const options = {
                downloadDate:{
                    from:this.dateRange[0],
                    until:this.dateRange[1]
                },
                bankName:this.bank
            }
            this.$axios.get('api/payment_agency/cir/importfile',{params:options})
            .then((response)=>{
                this.importfiles = response.data
        })
        }
    },
    created(){
        const options = {
            bankName:'all'
        }
        this.$axios.get('api/payment_agency/cir/importfile',{params:options})
        .then((response)=>{
            this.importfiles = response.data
        })
    }
}
</script>