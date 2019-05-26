document.querySelector('.master_maindiv').style.width = '1220px';
let tdColExport = document.createElement('td');
tdColExport.style.width = '220px';
tdColExport.style.padding = '5px';
tdColExport.style.fontSize = '12px';
let divColExportText = document.createElement('div');
divColExportText.style.height = '480px';
divColExportText.style.padding = '8px';
divColExportText.style.overflowY = 'auto';
divColExportText.style.border = '1px dotted #ccc';
tdColExport.appendChild(divColExportText);
document.querySelector('.master_maindiv > table tr').appendChild(tdColExport);

/**
 * @return {string}
 */
function HTMLEncode(text) {
  let span = document.createElement('span');
  span.innerText = text;
  return span.innerHTML;
}

function getExportText() {
  divColExportText.innerHTML = '';
  // noinspection JSUnresolvedVariable
  chrome.storage.local.get('reservedClasses', function (items) {
    let strTrimesterName = document.querySelector('.span_currentUserInfo > font').innerText;
    let strTrimesterKey = btoa(encodeURIComponent(strTrimesterName));
    if (items.reservedClasses.hasOwnProperty(strTrimesterKey)) {
      let result = [];
      if (items.reservedClasses[strTrimesterKey] !== null) {
        let reservedClasses = items.reservedClasses[strTrimesterKey];
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
      let text = '<strong>快捷选课列表</strong>';
      if (result.length === 0) {
        text += '<br /><br />没有可导出的内容'
      }
      result.forEach(function (value, index) {
        text += `<br /><br />${index + 1}.<br />${HTMLEncode(value[0])}<br />${HTMLEncode(value[1])}`;
      });
      divColExportText.innerHTML = text;
    }
  });
}

// noinspection JSUnresolvedVariable
chrome.storage.onChanged.addListener(() => {
  getExportText();
});

getExportText();