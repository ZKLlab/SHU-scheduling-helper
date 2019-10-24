<template>
  <div class="color-seed">
    <a-card class="input-wrapper">
      <div>
        <a-input
          v-model.trim="seed"
          maxlength="80"
          size="large"
          addonBefore="Seed值"
          style="color: black"
          placeholder="输入任何文字，可以留空，最多80字符"
          @blur="saveSeed"
        />
      </div>
      <div style="margin-top: 8px">
        <a-button type="dashed" class="btn-random" :disabled="poemLoading || seed === ''" @click="clear">
          <a-icon type="delete" />
          清空
        </a-button>
        <a-button class="btn-random" :disabled="poemLoading" @click="randomNumber">
          随机数字
        </a-button>
        <a-button class="btn-random" :disabled="poemLoading" @click="randomString">
          随机乱码
        </a-button>
        <a-button type="primary" class="btn-random" :loading="poemLoading" @click="randomPoem">
          来一句诗！
        </a-button>
      </div>
    </a-card>
    <schedule-table />
  </div>
</template>

<script>
  import axios from 'axios'
  import ScheduleTable from './ScheduleTable';

  export default {
    name: 'MColorSeed',
    components: {ScheduleTable},
    data() {
      return {
        seed: '',
        poemLoading: false,
      };
    },
    computed: {
      currentTrimester: {
        get() {
          return this.$store.state.currentTrimester;
        },
        set(value) {
          Storage.set('currentTrimester', value).then(() => {
            this.$store.commit('CURRENT_TRIMESTER', value);
          });
        }
      },
    },
    created() {
      if (typeof this.$store.state.colorSeeds[this.currentTrimester] === 'string') {
        this.seed = this.$store.state.colorSeeds[this.currentTrimester];
      }
    },
    methods: {
      clear() {
        this.seed = '';
        this.saveSeed();
      },
      randomNumber() {
        this.seed = Math.floor(Math.random() * Math.pow(2, 53)).toString();
        this.saveSeed();
      },
      randomString() {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
        let result = '';
        for (let i = 0, len = Math.random() * 20 + 10; i < len; i++) {
          result += chars.charAt(Math.random() * chars.length);
        }
        this.seed = result;
        this.saveSeed();
      },
      randomPoem() {
        this.poemLoading = true;
        axios.get('https://api.gushi.ci/all.json', {
          timeout: 5000,
        }).then((response) => {
          if (response.data) {
            if (response.data.content) {
              this.seed = response.data.content;
              this.saveSeed();
              return;
            }
          }
          this.$message.error('获取诗词失败，请稍后重试');
        }).catch(() => {
          this.$message.error('获取诗词失败，请稍后重试');
        }).then(() => {
          setTimeout(() => {
            this.poemLoading = false;
          }, 750);
        });
      },
      saveSeed() {
        this.$store.dispatch('setColorSeed', {
          trimesterKey: this.currentTrimester,
          colorSeed: this.seed,
        });
      },
    },
  }
</script>

<style scoped>
  .color-seed {
    padding-bottom: 180px;
  }

  .input-wrapper {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    height: 180px;
    border-left: none;
    border-right: none;
    border-bottom: none;
    z-index: 1000;
  }

  .btn-random {
    margin-top: 6px;
    margin-right: 6px;
  }
</style>