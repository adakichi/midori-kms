<template>
  <div class="mt-5" >
    <v-switch
      color="deep-purple darken-2"
      v-model="theme"
      :prepend-icon="themeIcon"
    ></v-switch>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      theme: true
    }
  },
  computed: {
    themeIcon() {
      return this.theme ? 'mdi-weather-night' : 'mdi-weather-sunny'
    }
  },
  watch: {
    theme() {
      this.$vuetify.theme.dark = this.theme
    }
  }
})
</script>