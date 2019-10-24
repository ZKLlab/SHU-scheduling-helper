<template>
  <div id="app">
    <normal v-if="platform === 'normal'" />
    <mobile v-if="platform === 'mobile'" />
  </div>
</template>

<script>
  import Normal from './Normal';
  import Mobile from './Mobile';
  import updateCheck from './updateCheck';

  export default {
    name: 'app',
    components: {
      Normal,
      Mobile,
    },
    data() {
      return {
        platform: null
      };
    },
    created() {
      let userAgent = navigator.userAgent.toLowerCase();
      if (/chrome/i.test(userAgent) && /webkit/i.test(userAgent) && /mozilla/i.test(userAgent) &&
        !/android/i.test(userAgent) && !/adr/i.test(userAgent) && !/iphone/i.test(userAgent) && !/ipod/i.test(userAgent) && !/ipad/i.test(userAgent) &&
        !/micromessenger/i.test(userAgent) && !/mqqbrowser/i.test(userAgent) && !/edge/i.test(userAgent)) {
        this.platform = 'normal';
      } else {
        this.platform = 'mobile';
      }
    },
    mounted() {
      setInterval(() => {
        this.checkForUpdate();
      }, 5 * 60 * 1000);
      this.checkForUpdate();
      document.querySelector('html').classList.add('__SHU_SCHEDULING_HELPER');
      // noinspection JSUnresolvedVariable,JSUnresolvedFunction
      document.querySelector('html').classList.add(`__SHU_SCHEDULING_HELPER__v${chrome.runtime.getManifest().version}`);
    },
    methods: {
      checkForUpdate() {
        updateCheck().then((result) => {
          if (result !== undefined) {
            this.$store.dispatch('setUpdateInfo', result);
          }
        });
      },
    }
  }
</script>

<style>
</style>
