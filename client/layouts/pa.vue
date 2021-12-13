<template>
  <v-app>
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
          title: 'Back',
          to: '/'
        },
        {
          icon: 'mdi-cash-fast',
          title: '入金予定',
          to: '/payment_agency/come_in_schedule/'
        },
        {
          icon: 'mdi-cash-fast',
          title: '入金実績',
          to: '/payment_agency/come_in_records/'
        },
        {
          icon: 'mdi-cash-fast',
          title: '出金予定',
          to: '/payment_agency/put_out_records/'
        },
        {
          icon: 'mdi-account',
          title: '顧客毎',
          to: '/payment_agency/customers/'
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'MIDORI-KMS'
    }
  }
}
</script>
