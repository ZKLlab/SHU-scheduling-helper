if (window.location.port !== '8084') {
  function getOrInitReserved(callback) {
    // noinspection JSUnresolvedVariable
    chrome.storage.local.get('reservedClasses', function (items) {
      if (items['reservedClasses'] === undefined) {
        // noinspection JSUnresolvedVariable
        chrome.storage.local.set({reservedClasses: {}}, function () {
          callback({});
        });
      } else {
        callback(items['reservedClasses']);
      }
    });
  }

  function getReservedClasses(trimesterKey, callback) {
    getOrInitReserved(function (items) {
      if (items[trimesterKey] === undefined) {
        callback({});
      } else {
        callback(items[trimesterKey]);
      }
    });
  }

  function setReservedClasses(trimesterKey, data, callback) {
    getOrInitReserved(function (items) {
      items[trimesterKey] = data;
      // noinspection JSUnresolvedVariable
      chrome.storage.local.set({
        reservedClasses: items,
      }, callback);
    });
  }

  function addCol() {
    let strTrimesterName = document.querySelector('.span_currentUserInfo > font').innerText;
    let strTrimesterKey = btoa(encodeURIComponent(strTrimesterName));
    getReservedClasses(strTrimesterKey, function (objReservedClasses) {
      while (true) {
        let helper_element = document.querySelector('.__SCHEDULING_HELPER');
        if (helper_element === null) {
          break;
        }
        helper_element.parentNode.removeChild(helper_element);
      }

      if (document.querySelectorAll('#divCourseMain table').length < 2) {
        return;
      }

      let thHeaders = document.querySelectorAll('#divCourseMain table:nth-of-type(1) tr:nth-of-type(3) th');
      thHeaders.forEach(function (value) {
        value.style.width = null;
      });

      let trHeader = document.querySelector('#divCourseMain table:nth-of-type(1) tr:nth-of-type(3)');
      let thHelperTitle = document.createElement('th');
      thHelperTitle.innerText = '排课助手';
      thHelperTitle.classList.add('__SCHEDULING_HELPER');
      trHeader.appendChild(thHelperTitle);

      let arrTrRows = document.querySelectorAll('#divCourseMain table:nth-of-type(1) tr:nth-of-type(n + 4):not(:last-of-type)');
      arrTrRows.forEach(function (trRow) {
        let strCourseId = trRow.children[1].innerText;
        let strTeacherId = trRow.children[3].innerText;
        let objClassData = {
          key: `${strCourseId}-${strTeacherId}`,
          trimesterKey: strTrimesterKey,
          trimesterName: strTrimesterName,
          courseId: strCourseId,
          courseName: trRow.children[2].innerText,
          credit: parseFloat(trRow.children[5].innerText),
          teacherId: strTeacherId,
          teacherName: trRow.children[4].innerText,
          classTime: trRow.children[6].innerText,
          selected: false,
        };
        let tdHelperCol = document.createElement('td');
        tdHelperCol.style.textAlign = 'center';
        let btnAdd = document.createElement('button');
        btnAdd.classList.add('__SCHEDULING_HELPER');
        btnAdd.classList.add('__SCHEDULING_HELPER__btn');
        btnAdd.classList.add('__SCHEDULING_HELPER__btn_primary');
        btnAdd.classList.add('__SCHEDULING_HELPER__btn_reserving');
        btnAdd.innerText = '+ 待选';

        let btnRemove = document.createElement('button');
        btnRemove.classList.add('__SCHEDULING_HELPER');
        btnRemove.classList.add('__SCHEDULING_HELPER__btn');
        btnRemove.classList.add('__SCHEDULING_HELPER__btn_secondary');
        btnRemove.classList.add('__SCHEDULING_HELPER__btn_reserving');
        btnRemove.innerText = '- 已选';

        btnAdd.addEventListener('click', function () {
          btnAdd.style.display = 'none';
          objReservedClasses[objClassData.key] = objClassData;
          setReservedClasses(strTrimesterKey, objReservedClasses, function () {
            // btnRemove.style.display = null;
          });
        });
        btnRemove.addEventListener('click', function () {
          btnRemove.style.display = 'none';
          delete objReservedClasses[objClassData.key];
          setReservedClasses(strTrimesterKey, objReservedClasses, function () {
            // btnAdd.style.display = null;
          });
        });

        if (objReservedClasses[objClassData.key] === undefined) {
          btnRemove.style.display = 'none';
        } else {
          btnAdd.style.display = 'none';
        }

        tdHelperCol.appendChild(btnAdd);
        tdHelperCol.appendChild(btnRemove);
        tdHelperCol.classList.add('__SCHEDULING_HELPER');
        trRow.appendChild(tdHelperCol);
      });
    });
  }

  function callback(mutationList) {
    document.querySelectorAll('td[colspan="20"]').forEach((value) => {
      value.setAttribute('colspan', '12')
    });
    mutationList.forEach((mutation) => {
      if (mutation.addedNodes.length >= 3) {
        addCol();
      }
    });
  }

  const targetNode = document.querySelector("#divCourseMain");
  const observerOptions = {
    childList: true,
    attributes: false,
  };

  let observer = new MutationObserver(callback);
  observer.observe(targetNode, observerOptions);

// noinspection JSUnresolvedVariable
  chrome.storage.onChanged.addListener(() => {
    addCol();
  });
}
