<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
      color="accent"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
            User:{{$auth.user ? $auth.user.name : 'ゲスト'}}
      <v-spacer />
      <v-menu offset-y dense>
        <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          dark
          v-bind="attrs"
          v-on="on"
        >内線表</v-btn>
        </template>
        <v-list nav>
          <v-list-group
          v-for="group in phonebook" :key="group.title">
            <v-list-item-title>{{group.title}}</v-list-item-title>
          </v-list-group>
          </v-list>
      </v-menu>
      <v-btn v-if="!$auth.loggedIn" color="primary" @click="$router.push('/users/login')">ログイン</v-btn>
      <v-btn v-else @click="logout()">ログアウト</v-btn>
        <theme-toggle></theme-toggle>
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>
              mdi-repeat
            </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
        <v-list-item v-show='$auth.user ? ($auth.user.isAdmin === 1 ? true : false ) : false ' @click="$router.push('/users/adminPage')">
          <v-list-item-title>管理者ページ</v-list-item-title>
        </v-list-item>
        <v-list-item @click="$router.push('/users/detail')">
          <v-list-item-title>アカウント編集</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
const phonejson = require('~/assets/data/phone_book.json')
import themeToggle from '~/components/themeToggle.vue'
export default {
  components: { themeToggle },
  data () {
    return {
      phonebook:phonejson.book,
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-login',
          title: 'Login',
          to: '/users/login'
        },
        {
          icon: 'mdi-cash-fast',
          title: '代行支払い',
          to: '/payment_agency'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        },
        {
          icon: 'mdi-tools',
          title: 'Tools',
          to: '/tools/tools_index'
        },
        {
          icon: 'mdi-school',
          title: 'Study',
          to: '/study/study_index'
        },
        {
          icon: 'mdi-frequently-asked-questions',
          title: 'FAQ',
          to: '/faq/faq_index'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'MIDORI-KMS'
    }
  },
  methods:{
    logout(){
      const data = { user: this.$auth.user}
      this.$auth.logout({data:data})
    }
  }
}
</script>
