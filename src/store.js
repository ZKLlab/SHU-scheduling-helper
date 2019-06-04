import Vue from 'vue'
import Vuex from 'vuex'
import Storage from './storage'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    reservedClasses: {},
    colorSeeds: {},
    trimesters: [],
    currentTrimester: null,
    previewClass: null,
    updateInfo: null,
    updateReminder: false,
    updateRequested: false,
  },
  getters: {
    trimesterClasses(state) {
      if (state.currentTrimester !== null) {
        return state.reservedClasses[state.currentTrimester];
      } else {
        return {};
      }
    },
    credit(state) {
      let result = 0;
      let reservedClasses = state.reservedClasses[state.currentTrimester];
      for (let key in reservedClasses) {
        if (reservedClasses.hasOwnProperty(key)) {
          if (reservedClasses[key].selected) {
            result += reservedClasses[key].credit;
          }
        }
      }
      return result;
    },
    heldTable(state) {
      let table = [];
      for (let i = 0; i < 13; i++) {
        table.push([]);
        for (let j = 0; j < 5; j++) {
          table[i].push(null);
        }
      }
      if (state.currentTrimester !== null) {
        let reservedClasses = state.reservedClasses[state.currentTrimester];
        for (let key in reservedClasses) {
          if (reservedClasses.hasOwnProperty(key)) {
            if (reservedClasses[key].selected) {
              let pattern = /([一二三四五])(\d+)-(\d+)/g;
              let result = [];
              while (true) {
                let execResult = pattern.exec(reservedClasses[key].classTime);
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
              result.forEach((value) => {
                value.timespan.forEach((value2) => {
                  table[value2][value.day] = reservedClasses[key];
                });
              });
            }
          }
        }
      }
      return table;
    },
    exportList(state) {
      let result = [];
      if (state.currentTrimester !== null) {
        let reservedClasses = state.reservedClasses[state.currentTrimester];
        for (let key in reservedClasses) {
          if (reservedClasses.hasOwnProperty(key)) {
            if (reservedClasses[key].selected) {
              result.push([
                `${reservedClasses[key].courseId}, ${reservedClasses[key].teacherId}`,
                `${reservedClasses[key].courseName}, ${reservedClasses[key].teacherName}, ${reservedClasses[key].classTime}`,
              ]);
            }
          }
        }
      }
      result.sort((a, b) => {
        a[0].localeCompare(b[0]);
      });
      return result;
    },
  },
  mutations: {
    RESERVED_CLASSES(state, data) {
      state.reservedClasses = data;
    },
    TRIMESTERS(state, data) {
      state.trimesters = data;
      if (state.currentTrimester === null) {
        state.currentTrimester = data.length ? state.trimesters[0].key : null;
      }
    },
    CURRENT_TRIMESTER(state, key) {
      state.currentTrimester = key;
    },
    PREVIEW_CLASS(state, key) {
      state.previewClass = key;
    },
    CANCEL_PREVIEW_CLASS(state, key) {
      if (state.previewClass === key) {
        state.previewClass = null;
      }
    },
    CLEAR_PREVIEW_CLASS(state) {
      state.previewClass = null;
    },
    SET_COLOR_SEEDS(state, data) {
      state.colorSeeds = data;
    },
    SET_UPDATE_INFO(state, data) {
      state.updateInfo = data;
    },
    SET_UPDATE_REMINDER(state, value) {
      state.updateReminder = value;
    },
    SET_UPDATE_REQUESTED(state) {
      state.updateRequested = true;
    },
  },
  actions: {
    refreshReservedClasses(context) {
      return new Promise((resolve) => {
        context.commit('CLEAR_PREVIEW_CLASS');
        Storage.get('reservedClasses').then((value) => {
          context.commit('CLEAR_PREVIEW_CLASS');
          if (value === null) {
            Storage.set('reservedClasses', {}).then(() => {
              context.commit('RESERVED_CLASSES', {});
              context.commit('TRIMESTERS', []);
              resolve();
            });
          } else {
            context.commit('RESERVED_CLASSES', value);
            let trimesters = [];
            for (let key in value) {
              if (value.hasOwnProperty(key)) {
                trimesters.push({
                  key: key,
                  name: decodeURIComponent(atob(key)),
                });
              }
            }
            trimesters.sort((b, a) => {
              let e1Result = /(\d+?)-\d+学年(.*?)季学期/.exec(a.name);
              let e2Result = /(\d+?)-\d+学年(.*?)季学期/.exec(b.name);
              if (e1Result === null && e2Result === null) {
                return a.name.localeCompare(b.name);
              } else if (e1Result === null) {
                return 1;
              } else if (e2Result === null) {
                return -1;
              } else {
                if (e1Result[1] !== e2Result[1]) {
                  return e1Result[1].localeCompare(e2Result[1]);
                } else {
                  const seasons = ['秋', '冬', '春', '夏'];
                  let e1Season = seasons.indexOf(e1Result[2]);
                  let e2Season = seasons.indexOf(e2Result[2]);
                  if (e1Season === -1 && e2Season === -1) {
                    return e1Result[2].localeCompare(e2Result[2]);
                  } else if (e1Season === -1) {
                    return 1;
                  } else if (e2Season === -1) {
                    return -1;
                  } else {
                    return e1Season - e2Season;
                  }
                }
              }
            });
            if (context.state.currentTrimester === null) {
              Storage.get('currentTrimester').then((value2) => {
                let flag = false;
                trimesters.forEach((value3) => {
                  if (value3.key === value2) {
                    flag = true;
                  }
                });
                if (value2 !== null && flag) {
                  context.commit('CURRENT_TRIMESTER', value2);
                }
                context.commit('TRIMESTERS', trimesters);
                resolve();
              });
            } else {
              let flag = true;
              trimesters.forEach((value) => {
                if (value.key === context.state.currentTrimester) {
                  flag = false;
                }
              });
              if (flag) {
                context.commit('CURRENT_TRIMESTER', null);
              }
              context.commit('TRIMESTERS', trimesters);
              resolve();
            }
          }
        });
      });
    },
    removeReservedClasses(context, key) {
      return new Promise((resolve) => {
        context.commit('CLEAR_PREVIEW_CLASS');
        let newClasses = JSON.parse(JSON.stringify(context.state.reservedClasses));
        delete newClasses[context.state.currentTrimester][key];
        Storage.set('reservedClasses', newClasses).then(() => {
          context.commit('CLEAR_PREVIEW_CLASS');
          resolve();
        });
      });
    },
    selectClass(context, key) {
      return new Promise((resolve) => {
        context.commit('CLEAR_PREVIEW_CLASS');
        let newClasses = JSON.parse(JSON.stringify(context.state.reservedClasses));
        let courseId = newClasses[context.state.currentTrimester][key].courseId;
        for (let key in newClasses[context.state.currentTrimester]) {
          if (newClasses[context.state.currentTrimester].hasOwnProperty(key)) {
            if (newClasses[context.state.currentTrimester][key].courseId === courseId) {
              newClasses[context.state.currentTrimester][key].selected = false;
            }
          }
        }
        newClasses[context.state.currentTrimester][key].selected = true;
        Storage.set('reservedClasses', newClasses).then(() => {
          context.commit('CLEAR_PREVIEW_CLASS');
          resolve();
        });
      });
    },
    cancelSelectClass(context, key) {
      return new Promise((resolve) => {
        context.commit('CLEAR_PREVIEW_CLASS');
        let newClasses = JSON.parse(JSON.stringify(context.state.reservedClasses));
        let courseId = newClasses[context.state.currentTrimester][key].courseId;
        for (let key in newClasses[context.state.currentTrimester]) {
          if (newClasses[context.state.currentTrimester].hasOwnProperty(key)) {
            if (newClasses[context.state.currentTrimester][key].courseId === courseId) {
              newClasses[context.state.currentTrimester][key].selected = false;
            }
          }
        }
        Storage.set('reservedClasses', newClasses).then(() => {
          context.commit('CLEAR_PREVIEW_CLASS');
          resolve();
        });
      });
    },
    clearReservedClasses(context, trimesterKey) {
      return new Promise((resolve) => {
        context.commit('CLEAR_PREVIEW_CLASS');
        let newClasses = JSON.parse(JSON.stringify(context.state.reservedClasses));
        newClasses[trimesterKey] = {};
        Storage.set('reservedClasses', newClasses).then(() => {
          context.commit('CLEAR_PREVIEW_CLASS');
          resolve();
        });
      });
    },
    deleteTrimester(context, trimesterKey) {
      return new Promise((resolve) => {
        context.commit('CLEAR_PREVIEW_CLASS');
        let newClasses = JSON.parse(JSON.stringify(context.state.reservedClasses));
        delete newClasses[trimesterKey];
        Storage.set('reservedClasses', newClasses).then(() => {
          context.commit('CLEAR_PREVIEW_CLASS');
          resolve();
        });
      });
    },
    refreshColorSeeds(context) {
      return new Promise((resolve) => {
        Storage.get('colorSeeds').then((value) => {
          context.commit('SET_COLOR_SEEDS', value !== null ? value : {});
          resolve();
        });
      });
    },
    setColorSeed(context, data) {
      return new Promise((resolve) => {
        let newSeeds = JSON.parse(JSON.stringify(context.state.colorSeeds));
        if (data.colorSeed === '') {
          delete newSeeds[data.trimesterKey];
        } else {
          newSeeds[data.trimesterKey] = data.colorSeed;
        }
        context.commit('SET_COLOR_SEEDS', newSeeds);
        Storage.set('colorSeeds', newSeeds).then(() => {
          context.commit('SET_COLOR_SEEDS', newSeeds);
          resolve();
        });
      });
    },
    setUpdateInfo(context, data) {
      return new Promise((resolve) => {
        Storage.set('updateInfo', data).then(() => {
          resolve();
        });
      });
    },
    refreshUpdateInfo(context) {
      return new Promise((resolve) => {
        Storage.get('updateInfo').then((value) => {
          if (context.state.updateInfo === null) {
            context.commit('SET_UPDATE_REMINDER', true);
          }
          context.commit('SET_UPDATE_INFO', value);
          resolve();
        });
      });
    },
  },
});
