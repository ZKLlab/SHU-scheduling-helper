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
        <a-collapse-panel :key="course.courseId">
          <template slot="header">
            <div class="course-color" :style="colorStyle(course.courseName)"></div>
            <div class="course-meta">
              {{ course.courseName }}
              <small>({{ course.courseId }})</small>
              <a-badge
                class="credit-badge"
                :count="`${course.credit}学分`"
                :numberStyle="{ backgroundColor: '#ffffff', color: '#999999', boxShadow: '0 0 0 1px #d9d9d9 inset' }"
              />
              <template v-if="course.selectedClass !== null && accordionOpened !== course.courseId">
                <br />
                {{ course.selectedClass.teacherName }}
                <small>({{ course.selectedClass.teacherId }})</small>
                <a-divider type="vertical" />
                <small class="selected-class-time">{{ course.selectedClass.classTime }}</small>
              </template>
            </div>
          </template>
          <a-list size="small" class="classes-list" :dataSource="course.classes" :locale="{ emptyText: '没有其他待选项了' }">
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
              <a-button type="danger" slot="actions" @click="showConflict(conflictList(item))" v-else>
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
        this.$store.dispatch('selectClass', key).then(() => {
          this.accordionOpened = null;
        });
      },
      cancelSelectClass(key) {
        this.$store.dispatch('cancelSelectClass', key);
      },
      removeReserved(key) {
        this.$store.dispatch('removeReservedClasses', key);
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
      showConflict(list) {
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
        Modal.warning({
          title: '此待选项与以下已选课程时间冲突：',
          content: h('div', content),
          okText: '知道了',
        });
      }
    }
  }
</script>

<style scoped>
  .classes-list {
    margin: -16px 0;
  }

  .course-meta {
    display: inline-block;
    vertical-align: top;
  }

  .credit-badge {
    margin-left: 16px;
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
    /*color: black;*/
    font-size: 14px;
    margin: 16px 0;
  }

  /*noinspection CssUnusedSymbol*/
  .conflict-list-class-meta-time {
    font-size: 12px;
    color: rgba(0, 0, 0, .45);
  }

  .course-color {
    display: inline-block;
    width: 8px;
    height: 15px;
    margin-right: 8px;
    vertical-align: top;
    position: relative;
    top: 3px;
  }

  /*noinspection ALL*/
  .list-header >>> .ant-collapse-header {
    cursor: default !important;
    user-select: none;
  }
</style>
