<template>
  <div class="main">
    <a-tabs class="tabs" defaultActiveKey="1">
      <a-tab-pane tab="待选" key="1">
        <div class="list-actions">
          <a href="http://www.xk.shu.edu.cn/" target="_blank">
            去选课网站
            <a-icon type="right" />
          </a>
          <a
            href="javascript:void(0);"
            @click="showExport"
          >
            导出
            <a-icon type="export" />
          </a>
          <span>已选学分：{{ $store.getters.credit }}</span>
        </div>
        <ReservedClassesList
          v-if="currentTrimester !== null"
          style="margin-left: 8px; margin-right: 8px"
          :trimester="currentTrimester"
        />
        <a-empty
          v-if="reservedClassesListEmpty"
          class="reserved-classes-list-empty"
          description="待选课程列表为空"
        >
          <a href="http://www.xk.shu.edu.cn/" target="_blank">
            去选课网站
            <a-icon type="right" />
          </a>
        </a-empty>
      </a-tab-pane>
      <a-tab-pane tab="课表" key="2">
        <ScheduleTable />
      </a-tab-pane>
      <a-tab-pane tab="选项" key="3">
        <div class="options">
          <a-card title="当前学期：" style="margin-bottom: 8px" :bordered="false" v-if="trimesters.length > 0">
            <div>
              <a-select style="width: 100%" :value="currentTrimester" @change="handleCurrentTrimesterChanged">
                <a-select-option v-for="trimester in trimesters" :key="trimester.key" :value="trimester.key">
                  {{ trimester.name }}
                </a-select-option>
              </a-select>
            </div>
            <div style="margin-top: 8px">
              <a-button
                :type="hasColorSeed ? 'primary' : 'default'"
                :ghost="hasColorSeed"
                @click="colorSeedVisible = true"
              >
                色彩Seed
              </a-button>
            </div>
            <a-button
              type="dashed"
              slot="actions"
              :disabled="reservedCount === 0"
              @click="clearTrimesterReservedClasses"
            >
              清空待选
            </a-button>
            <a-button
              type="danger"
              slot="actions"
              @click="deleteTrimester"
            >
              删除学期
            </a-button>
          </a-card>
          <a-card style="margin-bottom: 8px" :bordered="false">
            <a-button block @click="helpVisible = true">
              <a-icon type="question-circle" />
              帮助
            </a-button>
          </a-card>
          <div class="footer">上海大学排课助手 Lite<br />
            <small>插件版 v{{ version }}</small>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <a-drawer
      width="100%"
      placement="right"
      title="帮助"
      :visible="helpVisible"
      :destroy-on-close="true"
      @close="helpVisible = false"
    >
      <help-page full-screen />
    </a-drawer>
    <a-drawer
      :body-style="{padding: 0}"
      width="100%"
      title="色彩Seed"
      placement="right"
      :destroy-on-close="true"
      :visible="colorSeedVisible"
      @close="colorSeedVisible = false"
    >
      <m-color-seed />
    </a-drawer>
  </div>
</template>

<script>
  import moment from 'moment';
  import {Modal} from 'ant-design-vue';
  import Storage from './storage';
  import HelpPage from './components/HelpPage';
  import MColorSeed from "./components/MColorSeed";
  import ScheduleTable from './components/ScheduleTable';
  import ReservedClassesList from './components/ReservedClassesList';

  export default {
    name: 'Mobile',
    components: {
      MColorSeed,
      HelpPage,
      ScheduleTable,
      ReservedClassesList,
    },
    data() {
      return {
        colorSeedVisible: false,
        menuCurrentTrimesterSelected: false,
        helpVisible: false,
        version: null,
      };
    },
    computed: {
      trimesters() {
        return this.$store.state.trimesters;
      },
      currentTrimesterName() {
        return decodeURIComponent(atob(this.$store.state.currentTrimester));
      },
      currentTrimester: {
        get() {
          return this.$store.state.currentTrimester;
        },
        set(value) {
          Storage.set('currentTrimester', value).then(() => {
            this.$store.commit('CURRENT_TRIMESTER', value);
          });
        },
      },
      policySelected() {
        let flag = false;
        if (/[秋冬春]/.test(this.currentTrimesterName)) {
          this.$store.getters.exportList.forEach((value) => {
            if (/^形势与政策/.test(value[1])) {
              flag = true;
            }
          });
        } else {
          flag = true;
        }
        return flag;
      },
      exportText() {
        let result = `导出时间：\n${moment().format('YYYY-MM-DD HH:mm:ss')}`;
        if (this.$store.getters.exportList.length === 0) {
          result += '\n\n没有可导出的对象'
        }
        this.$store.getters.exportList.forEach((value, index) => {
          result += `\n\n${index + 1}.\n${value[0]}\n${value[1]}`;
        });
        return result;
      },
      exportNode() {
        const h = this.$createElement;
        let result = [];
        if (!this.policySelected) {
          result.push(h('a-alert', {
            props: {
              message: '未选形势与政策',
              closeText: '忽略',
              type: 'info',
              showIcon: true,
              closable: true,
            },
          }));
        }
        // noinspection JSUnusedGlobalSymbols
        result.push(h('a-textarea', {
          'class': {
            'export-textarea': true
          },
          style: {
            marginTop: '12px',
          },
          attr: {
            autofocus: true,
          },
          props: {
            autosize: {minRows: 4, maxRows: 8},
            value: this.exportText,
          },
          on: {
            mouseenter(event) {
              event.target.focus();
              event.target.select();
              event.target.scrollTop = 0;
            },
          },
        }));
        return result;
      },
      reservedClassesListEmpty() {
        return this.currentTrimester === null || Object.keys(this.$store.state.reservedClasses[this.currentTrimester]).length === 0;
      },
      reservedCount() {
        return this.currentTrimester === null ? 0 : Object.keys(this.$store.state.reservedClasses[this.currentTrimester]).length;
      },
      hasColorSeed() {
        return typeof this.$store.state.colorSeeds[this.currentTrimester] === 'string';
      },
    },
    created() {
      // noinspection JSUnresolvedVariable,JSUnresolvedFunction
      this.version = chrome.runtime.getManifest().version;
      this.refreshAll();
      Storage.addListener(() => {
        this.refreshAll();
      });
    },
    methods: {
      refreshAll() {
        this.$store.dispatch('refreshReservedClasses');
        this.$store.dispatch('refreshColorSeeds');
        this.$store.dispatch('refreshUpdateInfo');
      },
      menuOpenChangeHandler(openKeys) {
        this.menuCurrentTrimesterSelected = openKeys.indexOf('trimesters') > -1;
      },
      handleCurrentTrimesterChanged(value) {
        this.currentTrimester = value;
      },
      clearTrimesterReservedClasses() {
        Modal.confirm({
          title: `正在清空“${this.currentTrimesterName}”的${this.reservedCount}个待选项`,
          content: '该操作暂无法撤销，确定要继续吗？',
          okText: '确定',
          okType: 'danger',
          okButtonProps: {
            ghost: true,
          },
          cancelText: '取消',
          onOk: () => {
            this.$store.dispatch('clearReservedClasses', this.currentTrimester);
          },
        });
      },
      deleteTrimester() {
        Modal.confirm({
          title: `正在删除“${this.currentTrimesterName}”`,
          content: (this.reservedCount > 0 ? `该操作将清空此学期的${this.reservedCount}个待选项，且` : '该操作') + '暂无法撤销，确定要继续吗？',
          okText: '确定',
          okType: 'danger',
          okButtonProps: {
            ghost: true,
          },
          cancelText: '取消',
          onOk: () => {
            this.$store.dispatch('deleteTrimester', this.currentTrimester);
          },
        });
      },
      showExport() {
        Modal.info({
          title: '已选课程列表：',
          content: this.exportNode,
          okText: '知道了',
        });
      },
    },
  }
</script>

<style scoped>
  .main {
    background: #f0f2f5;
  }

  /*noinspection CssUnusedSymbol*/
  .tabs >>> .ant-tabs-bar {
    margin: 0;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 999;
    background: white;
  }

  /*noinspection CssUnusedSymbol*/
  .tabs >>> .ant-tabs-top-content {
    min-height: 100vh;
    padding-top: 45px;
  }

  /*noinspection CssUnusedSymbol*/
  .tabs >>> .ant-tabs-nav-scroll {
    text-align: center;
    background: white;
  }

  .list-actions {
    padding: 0 18px;
    margin: 8px 0;
    display: flex;
    justify-content: space-between;
  }

  .reserved-classes-list-empty {
    margin-top: 50px;
    margin-bottom: 50px;
  }

  .options {
    padding: 8px;
  }

  .footer {
    text-align: center;
    padding: 8px;
  }
</style>
