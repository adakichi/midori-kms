<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title>
          ようこそ　{{$auth.user ? $auth.user.name : 'ゲスト'}}　さん
        </v-card-title>
      </v-card>
      <v-card class="logo py-4 d-flex justify-center">
        <NuxtLogo />
        <VuetifyLogo />
      </v-card>
      <v-card>
        <v-card-title class="justify-center d-flex">
          <v-btn to="/users/login" color="primary" width="95%">ログインページ</v-btn>
        </v-card-title>
        <v-card-title class="headline">
          MIDORI Knowledge Management System
        </v-card-title>
        <v-card-text>
          <p>MidoriKMS is a simple Knowledge Management tools.</p>
          <p>
            For more information on Vuetify, check out the <a
              href="https://vuetifyjs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>.
          </p>
          <p>
            If you have questions, please join the official <a
              href="https://chat.vuetifyjs.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="chat"
            >
              discord
            </a>.
          </p>
          <p>
            Find a bug? Report it on the github <a
              href="https://github.com/vuetifyjs/vuetify/issues"
              target="_blank"
              rel="noopener noreferrer"
              title="contribute"
            >
              issue board
            </a>.
          </p>
          <p>Thank you for developing with Vuetify and I look forward to bringing more exciting features in the future.</p>
          <div class="text-xs-right">
            <em><small>&mdash; John Leider</small></em>
          </div>
          <hr class="my-3">
          <a
            href="https://nuxtjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nuxt Documentation
          </a>
          <br>
          <a
            href="https://github.com/nuxt/nuxt.js"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nuxt GitHub
          </a>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            nuxt
            to="/inspire"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

let convertedVapidKey, subscription;
(async _ => {
    try {
        console.log(navigator)
        // サービスワーカー登録
        const registration = await navigator.serviceWorker.register('sw.js',{scope:'/'});

        // サーバー側で生成したパブリックキーを取得し、urlBase64ToUint8Array()を使ってUit8Arrayに変換
        const res = await fetch('/key');
        const vapidPublicKey = await res.text();
        convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        // (変換した)パブリックキーをapplicationServerKeyに設定してsubscribe
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });

        // 通知の許可を求める
        Notification.requestPermission(permission => {
            console.log(permission); // 'default', 'granted', 'denied'
        });
    } catch (err) {
        console.log(err);
    }
})();

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
///////////////////////////////////////////////////////////


export default {
}
</script>