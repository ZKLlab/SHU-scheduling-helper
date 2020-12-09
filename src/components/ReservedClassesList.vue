<template>
  <a-config-provider>
    <!--suppress HtmlUnknownBooleanAttribute, XmlUnboundNsPrefix -->
    <template v-slot:renderEmpty>
      <div>没有其他待选项了</div>
    </template>
    <a-collapse accordion :bordered="false" v-if="reservedClassesList.length" v-model="accordionOpened">
      <template v-for="(course, index) in reservedClassesList">
        <a-collapse-panel
          v-if="index === 0 && course.selectedClass === null"
          :key="`${course.courseId}-divider`"
          class="list-header"
          :show-arrow="false"
          disabled
        >
          <template slot="header">
            未选课程
          </template>
        </a-collapse-panel>
        <a-collapse-panel
          v-else-if="(index === 0 || reservedClassesList[index - 1].selectedClass === null) && course.selectedClass !== null"
          :key="`${course.courseId}-divider`"
          class="list-header"
          :show-arrow="false"
          disabled
        >
          <template slot="header">
            已选课程
          </template>
        </a-collapse-panel>
        <a-collapse-panel class="course" :key="course.courseId">
          <template slot="header">
            <div class="course-color" :style="colorStyle(course.courseName)"></div>
            <div class="course-meta">
              <a-badge
                class="credit-badge"
                :count="`${course.credit}学分`"
                :numberStyle="{ backgroundColor: '#ffffff', color: '#999999', boxShadow: '0 0 0 1px #d9d9d9 inset' }"
              />
              {{ course.courseName }}
              <small>({{ course.courseId }})</small>
              <template v-if="course.selectedClass !== null && accordionOpened !== course.courseId">
                <br />
                {{ course.selectedClass.teacherName }}
                <small>({{ course.selectedClass.teacherId }})</small>
                <a-divider type="vertical" />
                <small class="selected-class-time">{{ course.selectedClass.classTime }}</small>
              </template>
            </div>
          </template>
          <a-list size="small" class="classes-list" :dataSource="course.classes">
            <a-list-item
              class="selected-class-list-item"
              slot="header"
              v-if="course.selectedClass !== null && accordionOpened === course.courseId"
            >
              <a-list-item-meta :description="course.selectedClass.classTime">
                <template slot="title">{{ course.selectedClass.teacherName }}
                  <small>({{ course.selectedClass.teacherId }})</small>
                </template>
                <a-avatar slot="avatar">已选</a-avatar>
              </a-list-item-meta>
              <a-button slot="actions" @click="cancelSelectClass(course.selectedClass.key)">取消选择</a-button>
            </a-list-item>
            <a-list-item slot="renderItem" slot-scope="item" class="classes-list-item"
                         @mouseenter="previewClass(item)" @mouseleave="cancelPreviewClass(item.key)">
              <a-button type="primary" slot="actions" @click="selectClass(item.key)"
                        v-if="conflictList(item).length === 0">
                选择
              </a-button>
              <a-button type="danger" slot="actions" @click="showConflict(conflictList(item), item)" v-else>
                冲突
              </a-button>
              <a-popconfirm
                placement="left" title="确定要将该项移出待选列表吗？" okText="确定" cancelText="取消" slot="actions"
                @confirm="removeReserved(item.key)"
              >
                <a-button type="dashed">- 待选</a-button>
              </a-popconfirm>
              <a-list-item-meta :description="item.classTime">
                <template slot="title">{{ item.teacherName }}
                  <small>({{ item.teacherId }})</small>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-collapse-panel>
      </template>
    </a-collapse>
  </a-config-provider>
</template>

<script>
  import {Modal} from 'ant-design-vue'
  import getColor from '../colors'

  export default {
    name: 'ReservedClassesList',
    props: {
      trimester: String
    },
    data() {
      return {
        accordionOpened: null,
        cancelKeys: [],
      };
    },
    computed: {
      colorSeed() {
        if (typeof this.$store.state.colorSeeds[this.$store.state.currentTrimester] === 'string') {
          return this.$store.state.colorSeeds[this.$store.state.currentTrimester];
        } else {
          return '';
        }
      },
      reservedClasses() {
        return this.$store.state.reservedClasses[this.trimester];
      },
      reservedClassesList() {
        let values = [];
        let courseIndex = {};
        for (let key in this.reservedClasses) {
          if (this.reservedClasses.hasOwnProperty(key)) {
            if (!courseIndex.hasOwnProperty(this.reservedClasses[key].courseId)) {
              values.push({
                courseName: this.reservedClasses[key].courseName,
                courseId: this.reservedClasses[key].courseId,
                credit: this.reservedClasses[key].credit,
                selectedClass: null,
                classes: [],
              });
              courseIndex[this.reservedClasses[key].courseId] = values.length - 1;
            }
            if (this.reservedClasses[key].selected) {
              values[courseIndex[this.reservedClasses[key].courseId]].selectedClass = this.reservedClasses[key];
            } else {
              values[courseIndex[this.reservedClasses[key].courseId]].classes.push(this.reservedClasses[key]);
            }
          }
        }
        values.sort((a, b) => {
          if (a.selectedClass === null && b.selectedClass !== null) {
            return -1;
          } else if (b.selectedClass === null && a.selectedClass !== null) {
            return 1;
          }
          return a.courseId.localeCompare(b.courseId);
        });
        return values;
      }
    },
    methods: {
      previewClass(obj) {
        if (this.conflictList(obj).length === 0) {
          this.$store.commit('PREVIEW_CLASS', obj.key);
        }
      },
      cancelPreviewClass(key) {
        this.$store.commit('CANCEL_PREVIEW_CLASS', key);
      },
      colorStyle(courseName) {
        return {
          background: getColor(courseName + this.colorSeed),
        }
      },
      selectClass(key) {
        return new Promise((resolve) => {
          this.$store.dispatch('selectClass', key).then(() => {
            this.accordionOpened = null;
            resolve();
          });
        })
      },
      cancelSelectClass(key) {
        return this.$store.dispatch('cancelSelectClass', key);
      },
      removeReserved(key) {
        return this.$store.dispatch('removeReservedClasses', key);
      },
      getClassTime(text) {
        let pattern = /([一二三四五])(\d+)-(\d+)/g;
        let result = [];
        let execResult = pattern.exec(text);
        while (execResult !== null) {
          let singleResult = {
            day: ['一', '二', '三', '四', '五'].indexOf(execResult[1]),
            timespan: [],
          };
          for (let i = parseInt(execResult[2]); i <= parseInt(execResult[3]); i++) {
            singleResult.timespan.push(i - 1);
          }
          result.push(singleResult);
          execResult = pattern.exec(text);
        }
        return result;
      },
      conflictList(obj) {
        let result = [];
        let courseIndex = {};
        this.getClassTime(obj.classTime).forEach((value) => {
          value.timespan.forEach((value2) => {
            if (this.$store.getters.heldTable[value2][value.day] !== null &&
              this.$store.getters.heldTable[value2][value.day].courseId !== obj.courseId) {
              if (!courseIndex.hasOwnProperty(this.$store.getters.heldTable[value2][value.day].courseId)) {
                result.push(this.$store.getters.heldTable[value2][value.day]);
                courseIndex[this.$store.getters.heldTable[value2][value.day].courseId] = result.length - 1;
              }
            }
          });
        });
        return result;
      },
      showConflict(list, item) {
        const h = this.$createElement;
        let content = [];
        list.forEach((value) => {
          content.push(h('p', {
            'class': {'conflict-list-class-meta': true}
          }, [
            `${value.courseName} `,
            h('small', `(${value.courseId})`),
            h('br'),
            `${value.teacherName} `,
            h('small', `(${value.teacherId})`),
            h('a-divider', {
              props: {type: 'vertical'}
            }),
            h('span', {
              'class': {'conflict-list-class-meta-time': true}
            }, value.classTime)
          ]));
        });
        Modal.confirm({
          iconType: 'warning',
          title: '此待选项与以下已选课程时间冲突：',
          content: h('div', content),
          okText: '去解决',
          okType: 'danger',
          cancelText: '知道了',
          onOk: () => {
            this.showConflictSolving(list, item);
          }
        });
      },
      showConflictSolving(list, item) {
        const h = this.$createElement;
        let content = [];
        this.cancelKeys = [];
        let modal = Modal.confirm({
          iconType: 'warning',
          title: '请勾选要取消选择的课程：',
          okText: '解决冲突',
          okType: 'danger',
          okButtonProps: {
            props: {
              disabled: true,
            }
          },
          cancelText: '取消',
          onOk: async () => {
            if (this.cancelKeys.indexOf(false) < 0) {
              for (let i = 0; i < this.cancelKeys.length; i++) {
                await this.cancelSelectClass(this.cancelKeys[i]);
                // TODO: 确保取消选择成功，有更好的方法吗？
                await new Promise((resolve) => {
                  const test = () => {
                    if (!this.reservedClasses[this.cancelKeys[i]].selected) {
                      resolve();
                    }
                  };
                  setTimeout(test, 100);
                });
              }
              await this.selectClass(item.key);
              Modal.success({
                title: '冲突解决完毕，已选择以下课程：',
                content: h('p', {
                  'class': {'conflict-list-class-meta': true}
                }, [
                  `${item.courseName} `,
                  h('small', `(${item.courseId})`),
                  h('br'),
                  `${item.teacherName} `,
                  h('small', `(${item.teacherId})`),
                  h('a-divider', {
                    props: {type: 'vertical'}
                  }),
                  h('span', {
                    'class': {'conflict-list-class-meta-time': true}
                  }, item.classTime)
                ]),
                okText: '确定',
              });
              this.cancelKeys = [];
            }
          },
          onCancel: () => {
            this.cancelKeys = [];
          },
        });
        list.forEach((value, index) => {
          this.cancelKeys.push(false);
          // noinspection JSUnusedGlobalSymbols
          content.push(h('a-checkbox', {
            'class': {'conflict-solving-list-class-meta-wrapper': true},
            on: {
              change: (event) => {
                this.cancelKeys[index] = event.target.checked ? value.key : false;
                modal.update({
                  okButtonProps: {
                    props: {
                      disabled: this.cancelKeys.indexOf(false) >= 0,
                    }
                  },
                });
              },
            },
          }, [
            h('div', {
              'class': {'conflict-solving-list-class-meta': true}
            }, [
              `${value.courseName} `,
              h('small', `(${value.courseId})`),
              h('br'),
              `${value.teacherName} `,
              h('small', `(${value.teacherId})`),
              h('a-divider', {
                props: {type: 'vertical'}
              }),
              h('span', {
                'class': {'conflict-list-class-meta-time': true}
              }, value.classTime),
            ]),
          ]));
        });
        modal.update({
          content: h('div', content),
        });
      },
    },
  }
</script>

<style scoped>
  .classes-list {
    margin: -12px 0 -16px;
  }

  .credit-badge {
    float: right;
  }

  /*noinspection CssUnusedSymbol*/
  .course >>> .ant-collapse-header {
    overflow: hidden;
    padding-right: 12px !important;
  }

  .course-meta {
    padding-left: 16px;
    white-space: normal;
    vertical-align: top;
  }

  .selected-class-time {
    color: rgba(0, 0, 0, .45);
  }

  /*noinspection CssUnusedSymbol*/
  .ant-list-item-meta-title {
    margin: 0;
  }

  /*noinspection CssUnusedSymbol*/
  .ant-list-item-meta-description {
    font-size: 12px;
  }

  /*noinspection CssUnusedSymbol*/
  .ant-collapse-item:last-of-type {
    border-bottom: none;
  }

  /*noinspection CssUnusedSymbol*/
  .ant-list-item-meta-avatar {
    margin-top: 6px;
  }

  .selected-class-list-item {
    margin: -12px 0;
  }

  /*noinspection CssUnusedSymbol*/
  .conflict-list-class-meta {
    font-size: 14px;
    margin: 16px 0 0;
  }

  /*noinspection CssUnusedSymbol*/
  .conflict-solving-list-class-meta-wrapper {
    font-size: 14px;
    margin: 0;
  }

  /*noinspection CssUnusedSymbol*/
  .conflict-solving-list-class-meta-wrapper:first-of-type {
    margin: 16px 0 0;
  }

  /*noinspection CssUnusedSymbol*/
  .conflict-list-class-meta-time {
    font-size: 12px;
    color: rgba(0, 0, 0, .45);
  }

  .course-color {
    display: block;
    width: 8px;
    height: 15px;
    position: absolute;
    top: 16px;
  }

  /*noinspection CssUnusedSymbol*/
  .list-header >>> .ant-collapse-header {
    cursor: default !important;
    user-select: none;
  }

  /*noinspection CssUnusedSymbol*/
  .conflict-solving-list-class-meta {
    margin: -21px 0 0 24px;
  }
</style>
