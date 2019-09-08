<template>
  <div class="schedule-table-main">
    <table class="schedule-table">
      <thead>
      <tr>
        <th :style="{ width: '6.5%' }"></th>
        <th :style="{ width: '16%' }"></th>
        <th v-for="week in ['一', '二', '三', '四', '五']" :key="week" :style="{ width: '15.5%' }">{{ week }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, index) in tableData" :key="index">
        <th>{{ index + 1 }}</th>
        <td class="class-period">
          <p>{{ classPeriods[index][0] }}</p>
          <p>- {{ classPeriods[index][1] }}</p>
        </td>
        <template v-for="(col, index2) in row">
          <td
            v-if="col.hasOwnProperty('skip') ? !col.skip : true"
            :key="index2"
            :class="{ 'has-class': col.hasOwnProperty('skip') ? !col.skip : false }"
            :rowspan="col.hasOwnProperty('rowspan') ? col.rowspan : null"
          >
            <template v-if="col.hasOwnProperty('skip') ? !col.skip : false">
              <div class="class-card" :style="getCardStyle(col.courseName, col.isPreview)">
                <div class="course-name"><strong>{{ col.courseName }}</strong></div>
                <div class="teacher-name">{{ col.teacherName }}</div>
              </div>
            </template>
          </td>
        </template>
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
    data() {
      return {
        classPeriods: [
          ['8:00', '8:45'],
          ['8:55', '9:40'],
          ['10:00', '10:45'],
          ['10:55', '11:40'],
          ['12:10', '12:55'],
          ['13:05', '13:50'],
          ['14:10', '14:55'],
          ['15:05', '15:50'],
          ['16:00', '16:45'],
          ['16:55', '17:40'],
          ['18:00', '18:45'],
          ['18:55', '19:40'],
          ['19:50', '20:35'],
        ]
      }
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
      },
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

  .class-period {
    font-size: 12px;
    user-select: none;
  }

  .class-period p {
    margin: 0;
  }

  .class-period p:first-child {
    padding-right: 1em;
    color: rgba(0, 0, 0, 0.65);
  }

  .class-period p:last-child {
    padding-left: 1em;
    color: rgba(0, 0, 0, 0.35);
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
    padding: 4px 5px 5px;
    bottom: 1px;
    right: 1px;
    left: 1px;
    top: 1px;
  }

  .course-name {
    margin-bottom: 1px;
  }

  .teacher-name {
    font-size: 12px;
    line-height: 1.25;
  }
</style>