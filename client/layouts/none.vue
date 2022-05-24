<template>
  <v-app dark>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
      color="accent"
    >
      <v-spacer />
      <v-toolbar-title v-text="title" />
      <v-spacer />

        <theme-toggle></theme-toggle>
    </v-app-bar>

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>

    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import themeToggle from '~/components/themeToggle.vue'
export default {
  components: { themeToggle },
  data () {
    return {
      dialog:true,
      tasks:0,
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Top',
          to: '/'
        },
        {
          icon: 'mdi-account',
          title: '顧客トップ',
          to: '/customers'
        },
        {
          icon: 'mdi-cog-outline',
          title: '設定',
          to: '/config'
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'MIDORI-KMS'
    }
  },
  computed:{
    isLoggedIn(){
      return this.$auth.isLoggedIn
    }
  },
  methods:{
    logout(){
      const data = { user: this.$auth.user}
      this.$auth.logout({data:data})
    },
    goMypage(){
      this.$router.push('/mypage')
    },
    getTasks(){
      if(!this.$auth.user){return}
      const id = this.$auth.user || this.$auth.user.userId
      const data = {to:id,done:0,id:id}
      this.$axios.get('api/tasks/',{params:data})
      .then(response=>{
        console.log(response.data)
        if(response.data.error){ alert('タスク取得のエラー\n' + response.data.message); return this.tasks = 0}
        this.tasks = response.data.length
      })
    }
  },
  created(){
    this.getTasks()
  }
}
</script>
<style scoped>
.to{
  cursor:pointer;
}
</style>