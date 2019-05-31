<template>
  <div>
    <schedule-table class="schedule-table" :trimester="trimester" :seed="seed" />
    <div class="color-seed-main">
      <h3>{{ getTrimesterName(trimester) }}</h3>
      <p>课程的主题颜色是对课程名称使用相同的
        <a-popover title="散列函数" trigger="click">
          <template slot="content">
            散列函数（又名哈希函数，Hash Function）是将数据压缩成摘要的算法，它输出的值叫做散列值，可以认为是数据的“指纹”。
            <a href="https://baike.baidu.com/item/%E6%95%A3%E5%88%97%E5%80%BC" target="_blank">百度百科</a>
          </template>
          <a href="javascript:void(0);">散列函数</a>
        </a-popover>
        计算出来的，也就是说每个课程在任何时间、任何设备都有相同的主题颜色。
      </p>
      <p>这种方法的缺点是，有时相邻的课程使用了同一种颜色，难以区分；有时计算出的颜色不够协调，缺少美感。计算机不具有审美能力，因此对颜色的调整很难通过程序来完成</p>
      <p><strong>色彩Seed</strong> 功能提供了一种人为改变颜色的方式，你可以在下面的输入框中输入任何文字，然后观察课程颜色的变化。</p>
      <div class="input-wrapper">
        <p>
          <a-input
            v-model.trim="seed"
            maxlength="80"
            size="large"
            addonBefore="Seed值"
            style="color: black"
            placeholder="输入任何文字，可以留空，最多80字符"
            @blur="saveSeed()"
          />
        </p>
        <p>
          <a-button type="dashed" class="btn-random" :disabled="poemLoading || seed === ''" @click="clear()">
            <a-icon type="delete" />
            清空
          </a-button>
          <a-button class="btn-random" :disabled="poemLoading" @click="randomNumber()">
            随机数字
          </a-button>
          <a-button class="btn-random" :disabled="poemLoading" @click="randomString()">
            随机乱码
          </a-button>
          <a-button type="primary" class="btn-random" :loading="poemLoading" @click="randomPoem()">
            来一句诗！
          </a-button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import ScheduleTable from './ScheduleTable'

  export default {
    name: 'ColorSeed',
    components: {
      ScheduleTable
    },
    props: {
      trimester: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        seed: '',
        poemLoading: false,
      };
    },
    created() {
      if (typeof this.$store.state.colorSeeds[this.trimester] === 'string') {
        this.seed = this.$store.state.colorSeeds[this.trimester];
      }
    },
    methods: {
      getTrimesterName(key) {
        return decodeURIComponent(atob(key));
      },
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
          trimesterKey: this.trimester,
          colorSeed: this.seed,
        });
      }
    },
  }
</script>

<style scoped>
  h3 {
    margin-bottom: 24px;
  }

  p {
    margin-bottom: 0.75em;
    line-height: 1.75;
  }

  .schedule-table {
    overflow-y: auto;
    position: fixed;
    padding: 8px;
    bottom: 24px;
    width: 400px;
    left: 24px;
    top: 80px;
  }

  .color-seed-main {
    overflow-y: auto;
    position: fixed;
    bottom: 24px;
    right: 24px;
    left: 448px;
    top: 80px;
  }

  .input-wrapper {
    margin-top: 18px;
  }

  .btn-random {
    margin-right: 6px;
  }
</style>