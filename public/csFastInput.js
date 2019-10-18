document.querySelector('.master_maindiv').style.width = '1220px';
let tdColExport = document.createElement('td');
tdColExport.style.width = '220px';
tdColExport.style.padding = '5px';
tdColExport.style.fontSize = '12px';
let divColExportText = document.createElement('div');
divColExportText.style.height = '480px';
divColExportText.style.padding = '8px 0';
divColExportText.style.overflowY = 'auto';
divColExportText.style.border = '1px dotted #ccc';
divColExportText.classList.add('__SCHEDULING_HELPER');
divColExportText.classList.add('__SCHEDULING_HELPER__container_fast_input');
tdColExport.appendChild(divColExportText);
document.querySelector('.master_maindiv > table tr').appendChild(tdColExport);

let selectedClasses = {};
let inputClasses = {};
let inputClassesCount = 0;

/**
 * @return {string}
 */
function HTMLEncode(text) {
  let span = document.createElement('span');
  span.innerText = text;
  return span.innerHTML;
}

function getExportText() {
  // noinspection JSUnresolvedVariable
  chrome.storage.local.get('reservedClasses', function (items) {
    let strTrimesterName = document.querySelector('.span_currentUserInfo > font').innerText;
    let strTrimesterKey = btoa(encodeURIComponent(strTrimesterName));
    let boolPolicyFlag = false;
    if (!/[秋冬春]/.test(strTrimesterName)) {
      boolPolicyFlag = true;
    }
    if (items.reservedClasses.hasOwnProperty(strTrimesterKey)) {
      let result = [];
      if (items.reservedClasses[strTrimesterKey] !== null) {
        let reservedClasses = items.reservedClasses[strTrimesterKey];
        for (let key in reservedClasses) {
          if (reservedClasses.hasOwnProperty(key)) {
            if (reservedClasses[key].selected) {
              if (/^形势与政策/.test(reservedClasses[key].courseName)) {
                boolPolicyFlag = true;
              }
              result.push([
                `${reservedClasses[key].courseId}, ${reservedClasses[key].teacherId}`,
                `${reservedClasses[key].courseName}, ${reservedClasses[key].teacherName}, ${reservedClasses[key].classTime}`,
              ]);
            }
          }
        }
      }
      result.sort((a, b) => {
        let selectedCompare = (selectedClasses[a[0]] === true ? 1 : 0) - (selectedClasses[b[0]] === true ? 1 : 0);
        let inputCompare = (inputClasses[a[0]] === true ? 1 : 0) - (inputClasses[b[0]] === true ? 1 : 0);
        if (selectedCompare === 0) {
          if (inputCompare === 0 || (selectedClasses[a[0]] === true && selectedClasses[b[0]] === true)) {
            return a[0].localeCompare(b[0]);
          } else {
            return inputCompare;
          }
        } else {
          return selectedCompare;
        }
      });
      let text = '<p><strong>快捷选课列表</strong></p>';
      if (result.length === 0) {
        text += '<p>没有可导出的内容</p>'
      } else if (!boolPolicyFlag) {
        text += '<p><strong>提示：未选形势与政策</strong></p>'
      }
      result.forEach(function (value, index) {
        if (selectedClasses[value[0]] === true) {
          text += `<p style="opacity: 0.5"><i>${index + 1}. <b>[已选]</b><br />${HTMLEncode(value[0])}<br />${HTMLEncode(value[1])}</i></p>`;
        } else if (inputClasses[value[0]] === true) {
          text += `<p class="__SCHEDULING_HELPER__fast_input_class_block_selected __SCHEDULING_HELPER"><i>${index + 1}. <b>[已填入]</b><br />${HTMLEncode(value[0])}<br />${HTMLEncode(value[1])}</i></p>`;
        } else if (inputClassesCount >= 6) {
          text += `<p>${index + 1}. <b style="color: red">[可自动填写，请先提交已有课程]</b><br />${HTMLEncode(value[0])}<br />${HTMLEncode(value[1])}</p>`;
        } else {
          text += `<p class="__SCHEDULING_HELPER__fast_input_class_block __SCHEDULING_HELPER" data-class-key="${value[0]}">${index + 1}. <b style="color: #2196F3">[点击自动填写]</b><br />${HTMLEncode(value[0])}<br />${HTMLEncode(value[1])}</p>`;
        }
      });
      divColExportText.innerHTML = text;
      document.querySelectorAll('.__SCHEDULING_HELPER__fast_input_class_block.__SCHEDULING_HELPER[data-class-key]').forEach(function (element) {
        element.onclick = function () {
          inputClass(element.getAttribute('data-class-key'));
        };
      })
    } else {
      divColExportText.innerHTML = '';
    }
  });
}

// noinspection JSUnresolvedVariable
chrome.storage.onChanged.addListener(() => {
  getExportText();
});

function getSelectedClasses() {
  let selectedClassesRows = document.querySelectorAll('#divCourseTable > div > table tr:nth-child(3) > td:nth-child(1) > table tr:not(:first-child)');
  selectedClasses = {};
  selectedClassesRows.forEach(function (row) {
    let courseId = row.querySelector('td:nth-child(3)').innerText.trim();
    let teacherId = row.querySelector('td:nth-child(4)').innerText.trim();
    let classKey = `${courseId}, ${teacherId}`;
    if (classKey.length === 14) {
      selectedClasses[classKey] = true;
    }
  });
  for (let i = 0; i < 6; i++) {
    let courseId = document.querySelector(`input[name="ListCourse[${i}].CID"]`);
    let teacherId = document.querySelector(`input[name="ListCourse[${i}].TNo"]`);
    if (courseId != null && teacherId != null) {
      let classKey = `${courseId.value.trim()}, ${teacherId.value.trim()}`;
      if (classKey.length !== 14 || selectedClasses[classKey] === true) {
        courseId.value = '';
        teacherId.value = '';
      }
    }
  }
  setTimeout(getInputClasses, 0);
}

function getInputClasses() {
  inputClasses = {};
  inputClassesCount = 0;
  for (let i = 0; i < 6; i++) {
    let courseId = document.querySelector(`input[name="ListCourse[${i}].CID"]`);
    let teacherId = document.querySelector(`input[name="ListCourse[${i}].TNo"]`);
    if (courseId != null && teacherId != null) {
      let classKey = `${courseId.value.trim()}, ${teacherId.value.trim()}`;
      if (classKey.length === 14) {
        inputClasses[classKey] = true;
        inputClassesCount++;
      }
    }
  }
  getExportText();
}

function inputClass(classKey) {
  let classInfo = classKey.split(', ');
  for (let i = 0; i < 6; i++) {
    let courseId = document.querySelector(`input[name="ListCourse[${i}].CID"]`);
    let teacherId = document.querySelector(`input[name="ListCourse[${i}].TNo"]`);
    if (courseId != null && teacherId != null) {
      let classKey = `${courseId.value.trim()}, ${teacherId.value.trim()}`;
      if (classKey.length !== 14) {
        courseId.value = classInfo[0];
        teacherId.value = classInfo[1];
        break;
      }
    }
  }
  setTimeout(getInputClasses, 0);
}

function callback(mutationList) {
  mutationList.forEach((mutation) => {
    if (mutation.addedNodes.length >= 3) {
      getSelectedClasses();
    }
  });
}

const targetNode = document.querySelector("#divCourseTable");
const observerOptions = {
  childList: true,
  attributes: false,
};

let observer = new MutationObserver(callback);
observer.observe(targetNode, observerOptions);

document.querySelectorAll('#divInput input[type="text"]').forEach(function (element) {
  element.addEventListener('input', function () {
    getInputClasses();
  });
});

document.querySelector('#postForm').addEventListener('reset', function () {
  setTimeout(getInputClasses, 0);
});

setTimeout(function () {
  getSelectedClasses();
}, 1000);