<template>
  <a-card class="update-message" hoverable v-if="$store.state.updateInfo !== null" @click="clearReminder()">
    <a-badge :count="$store.state.updateReminder ? 'NEW' : ''">
      <a-card-meta class="card-meta" title="有新版本了" :description="$store.state.updateInfo.version" />
    </a-badge>
    <div class="content" v-html="compiledMarkdownContent"></div>
    <template v-if="versionType === 'prod'">
      <div class="update-hint">
        你正在使用Google Chrome网上应用店下载的正式版本，一般情况下Google Chrome每隔几小时会自动检查并安装扩展更新。如果你无法保证你的网络环境能够随时连接Google服务器，请先开启<a
        href="http://vpn.shu.edu.cn/index/OpenVPN.htm" target="_blank">上海大学OpenVPN</a>(即使连接了校园网，ShuWlan-1X除外)或连接<a
        href="http://wlan.shu.edu.cn/Default.aspx?tabid=28980" target="_blank">ShuWlan-1X</a>，然后点击下面的按钮手动请求浏览器检查更新。
      </div>
      <template v-if="networkCheckingPassed">
        <a-button type="primary" :disabled="this.$store.state.updateRequested" @click="requestUpdate()">
          <a-icon type="chrome" theme="filled" />
          {{ updateRequestButtonText }}
        </a-button>
      </template>
      <template v-else>
        <a-button
          type="dashed"
          icon="reload"
          :loading="networkCheckingTimer !== null"
          @click="checkNetwork()"
        >
          {{ networkCheckingButtonText }}
        </a-button>
        <img
          style="display: none !important"
          alt=""
          :src="imgSrc"
          v-if="networkCheckingTimer !== null"
          @load="imgLoad()"
          @error="imgError()"
        />
      </template>
    </template>
    <template v-if="versionType === 'dev'">
      <div class="update-hint">
        你正在使用开发版本，请前往Github下载压缩包手动更新。请注意，开发版本更新后数据不保证能完整保留，强烈建议前往<a
        href="https://chrome.google.com/webstore/detail/kmgdfejkkpmeimbkglbjmgbfiggimfhp"
        target="_blank">Chrome网上应用店</a>下载正式版本(两个版本之间数据不互通)。
      </div>
      <a href="https://github.com/ZKLlab/SHU-scheduling-helper/releases/latest" target="_blank">
        <a-icon type="github" />
        Github
      </a>
    </template>
  </a-card>
</template>

<script>
  import marked from 'marked';

  export default {
    name: 'UpdateMessage',
    data() {
      return {
        versionType: null,
        networkCheckingTimer: null,
        networkCheckingPassed: false,
        imgSrc: '',
      };
    },
    computed: {
      compiledMarkdownContent() {
        if (this.$store.state.updateInfo !== null) {
          // Add target="_blank"
          // https://github.com/markedjs/marked/issues/655#issuecomment-383226346
          const renderer = new marked.Renderer();
          const linkRenderer = renderer.link;
          renderer.link = (href, title, text) => {
            const html = linkRenderer.call(renderer, href, title, text);
            return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
          };
          return marked(this.$store.state.updateInfo.content, {
            sanitize: true,
            renderer: renderer,
          });
        } else {
          return '';
        }
      },
      networkCheckingButtonText() {
        return this.networkCheckingTimer === null ? '无法连接到Google服务器，点击重试' : '正在检查网络……';
      },
      updateRequestButtonText() {
        return this.$store.state.updateRequested ? '已请求扩展更新' : '检查扩展更新';
      },
    },
    created() {
      // noinspection JSUnresolvedVariable
      if (chrome.runtime.id === 'kmgdfejkkpmeimbkglbjmgbfiggimfhp') {
        this.versionType = 'prod';
      } else {
        this.versionType = 'dev';
      }
    },
    mounted() {
      if (this.versionType === 'prod') {
        this.checkNetwork();
      }
    },
    beforeDestroy() {
      this.imgComplete();
      this.clearReminder();
    },
    methods: {
      clearReminder() {
        if (this.$store.state.updateReminder) {
          this.$store.commit('SET_UPDATE_REMINDER', false);
        }
      },
      checkNetwork() {
        this.imgSrc = `https://www.google.com/images/branding/googleg/1x/googleg_standard_color_16dp.png?${Math.random()}`;
        this.networkCheckingTimer = setTimeout(() => {
          this.imgError();
        }, 12000);
      },
      imgLoad() {
        this.networkCheckingPassed = true;
        this.imgComplete();
      },
      imgError() {
        this.imgComplete();
      },
      imgComplete() {
        this.imgSrc = '';
        clearTimeout(this.networkCheckingTimer);
        this.networkCheckingTimer = null;
      },
      requestUpdate() {
        this.$store.commit('SET_UPDATE_REQUESTED');
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        chrome.runtime.sendMessage('requestUpdateCheck');
      },
    },
  };
</script>

<style scoped>
  .card-meta {
    padding-right: 24px;
  }

  .content {
    margin-top: 20px;
    margin-bottom: 12px;
  }

  .content >>> ul {
    padding-left: 1.5em;
    margin-bottom: 0;
  }

  .update-message {
    margin-bottom: 24px;
  }

  .update-hint {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    margin-bottom: 12px;
  }
</style>