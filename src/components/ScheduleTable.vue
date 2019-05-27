<template>
  <div class="schedule-table-main">
    <table class="schedule-table">
      <thead>
      <tr>
        <th :style="{ width: '10%' }"></th>
        <th v-for="week in ['一', '二', '三', '四', '五']" :key="week" :style="{ width: '18%' }">{{ week }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, index) in tableData" :key="index">
        <th>{{ index + 1 }}</th>
        <td
          v-for="(col, index2) in row"
          v-if="col.hasOwnProperty('skip') ? !col.skip : true"
          :key="index2"
          :class="{ 'has-class': col.hasOwnProperty('skip') ? !col.skip : false }"
          :rowspan="col.hasOwnProperty('rowspan') ? col.rowspan : null"
        >
          <template v-if="col.hasOwnProperty('skip') ? !col.skip : false">
            <div class="class-card" :style="getCardStyle(col.courseName, col.isPreview)">
              <div class="course-name"><strong>{{ col.courseName }}</strong></div>
              <div>{{ col.teacherName }}</div>
            </div>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import getColor from '../colors'

  export default {
    name: 'ScheduleTable',
    props: {
      trimester: {
        type: String,
        default: null,
      },
      seed: {
        type: String,
        default: null,
      },
    },
    computed: {
      colorSeed() {
        if (this.seed !== null) {
          return this.seed;
        } else if (typeof this.$store.state.colorSeeds[this.currentTrimester] === 'string') {
          return this.$store.state.colorSeeds[this.currentTrimester];
        } else {
          return '';
        }
      },
      currentTrimester() {
        return this.trimester === null ? this.$store.state.currentTrimester : this.trimester;
      },
      reservedClasses() {
        return this.$store.state.reservedClasses[this.currentTrimester];
      },
      previewClass() {
        if (this.$store.state.previewClass !== null) {
          return this.$store.getters.trimesterClasses[this.$store.state.previewClass];
        } else {
          return null;
        }
      },
      tableData() {
        let result = [];
        for (let i = 0; i < 13; i++) {
          result.push([]);
          for (let j = 0; j < 5; j++) {
            result[i].push({});
          }
        }
        if (this.previewClass !== null) {
          this.getClassTime(this.previewClass.classTime).forEach((value) => {
            value.timespan.forEach((value2, index) => {
              if (index === 0) {
                result[value2][value.day] = {
                  skip: false,
                  rowspan: value.timespan.length,
                  courseName: this.previewClass.courseName,
                  teacherName: this.previewClass.teacherName,
                  isPreview: true,
                }
              } else {
                result[value2][value.day] = {
                  skip: true,
                }
              }
            });
          });
        }
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
                isPreview: false,
              });
              courseIndex[this.reservedClasses[key].courseId] = values.length - 1;
            }
            if (this.reservedClasses[key].selected) {
              if (this.previewClass === null || this.reservedClasses[key].courseId !== this.previewClass.courseId) {
                values[courseIndex[this.reservedClasses[key].courseId]].selectedClass = this.reservedClasses[key];
              }
            }
          }
        }
        values.forEach((value) => {
          if (value.selectedClass !== null) {
            this.getClassTime(value.selectedClass.classTime).forEach((value2) => {
              value2.timespan.forEach((value3, index) => {
                if (index === 0) {
                  result[value3][value2.day] = {
                    skip: false,
                    rowspan: value2.timespan.length,
                    courseName: value.selectedClass.courseName,
                    teacherName: value.selectedClass.teacherName,
                  }
                } else {
                  result[value3][value2.day] = {
                    skip: true,
                  }
                }
              });
            });
          }
        });
        return result;
      }
    },
    methods: {
      getClassTime(text) {
        let pattern = /([一二三四五])(\d+)-(\d+)/g;
        let result = [];
        while (true) {
          let execResult = pattern.exec(text);
          if (execResult !== null) {
            let singleResult = {
              day: ['一', '二', '三', '四', '五'].indexOf(execResult[1]),
              timespan: []
            };
            for (let i = parseInt(execResult[2]); i <= parseInt(execResult[3]); i++) {
              singleResult.timespan.push(i - 1);
            }
            result.push(singleResult);
          } else {
            break;
          }
        }
        return result;
      },
      getCardStyle(courseName, isPreview) {
        let baseColor = getColor(courseName + this.colorSeed);
        if (isPreview) {
          return {
            color: 'rgba(255, 255, 255, 0.75)',
            borderTopColor: `rgba(${parseInt(baseColor.substr(1, 2), 16)}, ${parseInt(baseColor.substr(3, 2), 16)}, ${parseInt(baseColor.substr(5, 2), 16)}, 0.55)`,
            background: `rgba(${parseInt(baseColor.substr(1, 2), 16)}, ${parseInt(baseColor.substr(3, 2), 16)}, ${parseInt(baseColor.substr(5, 2), 16)}, 0.45)`,
          };
        } else {
          return {
            color: 'rgba(255, 255, 255, 0.95)',
            borderTopColor: `rgba(${parseInt(baseColor.substr(1, 2), 16)}, ${parseInt(baseColor.substr(3, 2), 16)}, ${parseInt(baseColor.substr(5, 2), 16)}, 1.0)`,
            background: `rgba(${parseInt(baseColor.substr(1, 2), 16)}, ${parseInt(baseColor.substr(3, 2), 16)}, ${parseInt(baseColor.substr(5, 2), 16)}, 0.75)`,
          };
        }
      }
    }
  }
</script>

<style scoped>
  .schedule-table-main {
    padding: 8px;
  }

  .schedule-table {
    margin: 0;
    padding: 0;
    table-layout: fixed;
    border-collapse: collapse;
    width: 100%;
    text-align: center;
    font-size: 13px;
  }

  .schedule-table thead tr {
    height: 32px;
  }

  .schedule-table tbody tr {
    height: 48px;
  }

  .schedule-table th {
    text-align: center;
    vertical-align: middle;
    line-height: 1.5;
    user-select: none;
  }

  .schedule-table tbody tr:nth-child(odd) {
    background: rgba(0, 0, 0, 0.025);
  }

  /*noinspection CssUnusedSymbol*/
  .schedule-table td.has-class {
    /*background: white;*/
    position: relative;
  }

  .class-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-top-style: solid;
    border-top-width: 3px;
    border-radius: 2px;
    line-height: 1.35;
    text-align: left;
    position: absolute;
    overflow: hidden;
    padding: 5px;
    bottom: 1px;
    right: 1px;
    left: 1px;
    top: 1px;
    /*transition: all 0.15s;*/
    /*cursor: pointer;*/
  }

  /*.class-card:hover {*/
  /*  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);*/
  /*  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);*/
  /*  transform: scale(1.05);*/
  /*  z-index: 998;*/
  /*}*/

  .course-name {
    margin-bottom: 2px;
  }
</style>