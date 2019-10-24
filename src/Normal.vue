<template>
  <div>
    <a-layout>
      <a-layout-header class="page-footer">
        <div class="header-footer">上海大学排课助手
          <small>插件版 v{{ version }}</small>
        </div>
        <a-menu
          theme="light"
          mode="horizontal"
          :selected-keys="menuSelectedKeys"
          :style="{ lineHeight: '64px' }"
          @openChange="menuOpenChangeHandler"
        >
          <a-sub-menu key="trimesters" v-if="trimesters.length > 0" v-model="currentTrimester">
            <span slot="title"><a-icon type="bars" />{{ currentTrimesterName }}</span>
            <a-menu-item-group title="选择学期">
              <a-menu-item
                v-for="trimester in trimesters"
                @click="currentTrimester = trimester.key"
                :key="trimester.key"
              >
                {{ trimester.name }}
              </a-menu-item>
              <a-menu-divider></a-menu-divider>
              <a-menu-item key="trimesterManage" @click="trimesterManagementVisible = true">
                <a-icon type="setting" />
                学期管理
              </a-menu-item>
            </a-menu-item-group>
          </a-sub-menu>
          <a-menu-item key="help" @click="helpVisible = true">
            <a-badge :dot="$store.state.updateReminder">
              <a-icon type="question-circle" />
              帮助
            </a-badge>
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout>
        <a-layout-sider
          width="460px"
          theme="light"
          class="schedule-table-sider"
        >
          <schedule-table show-periods />
        </a-layout-sider>
        <a-layout :style="{ marginLeft: '460px', marginTop: '64px' }">
          <a-layout-content class="reserved-classes-list-content">
            <div class="list-actions">
              <a href="http://www.xk.shu.edu.cn/" target="_blank">
                去选课网站
                <a-icon type="right" />
              </a>
              <a
                class="export-selected-classes"
                href="javascript:void(0);"
                :data-clipboard-text="exportText"
                @click="showExport()"
              >
                导出
                <a-icon type="export" />
              </a>
              <span>已选学分：{{ $store.getters.credit }}</span>
            </div>
            <reserved-classes-list v-if="currentTrimester !== null" :trimester="currentTrimester" />
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
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
    <a-drawer
      width="540px"
      title="学期管理"
      placement="right"
      :visible="trimesterManagementVisible"
      @close="trimesterManagementVisible = false"
    >
      <trimesters-management />
    </a-drawer>
    <a-drawer
      width="600px"
      placement="right"
      title="帮助"
      :visible="helpVisible"
      :destroy-on-close="true"
      @close="helpVisible = false"
    >
      <help-page />
    </a-drawer>
  </div>
</template>

<script>
  import moment from 'moment';
  import Storage from './storage';
  import Clipboard from 'clipboard';
  import {Modal} from 'ant-design-vue';
  import HelpPage from './components/HelpPage';
  import ScheduleTable from './components/ScheduleTable';
  import ReservedClassesList from './components/ReservedClassesList';
  import TrimestersManagement from './components/TrimestersManagement';

  export default {
    name: 'Normal',
    components: {
      HelpPage,
      ScheduleTable,
      ReservedClassesList,
      TrimestersManagement,
    },
    data() {
      return {
        trimesterManagementVisible: false,
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
        }
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
      menuSelectedKeys() {
        return this.menuCurrentTrimesterSelected ? [this.$store.state.currentTrimester] : [];
      },
      reservedClassesListEmpty() {
        return this.currentTrimester === null || (this.$store.state.reservedClasses[this.currentTrimester] && this.$store.state.reservedClasses[this.currentTrimester].length === 0);
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
    mounted() {
      let clipboard = new Clipboard('.export-selected-classes');
      clipboard.on('success', () => {
        this.$message.success('已复制！');
      });
    },
    methods: {
      showExport() {
        Modal.info({
          title: '已选课程列表：',
          content: this.exportNode,
          okText: '知道了',
        });
      },
      refreshAll() {
        this.$store.dispatch('refreshReservedClasses');
        this.$store.dispatch('refreshColorSeeds');
        this.$store.dispatch('refreshUpdateInfo');
      },
      menuOpenChangeHandler(openKeys) {
        this.menuCurrentTrimesterSelected = openKeys.indexOf('trimesters') > -1;
      },
    },
  }
</script>

<style scoped>
  .page-footer {
    background: white;
    padding: 0;
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    z-index: 999;
  }

  .header-footer {
    display: inline-block;
    text-align: center;
    font-size: 18px;
    padding: 0 48px;
    height: 64px;
    float: left;
  }

  .header-footer small {
    opacity: 0.8;
    font-size: 12px;
  }

  .schedule-table-sider {
    overflow: auto;
    height: calc(100vh - 64px);
    position: fixed;
    left: 0;
    top: 64px;
    padding: 0;
  }

  .reserved-classes-list-content {
    min-height: calc(100vh - 64px);
    padding: 8px;
  }

  .list-actions {
    padding: 0 18px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }

  .reserved-classes-list-empty {
    margin-top: 50px;
    margin-bottom: 50px;
  }
</style>
