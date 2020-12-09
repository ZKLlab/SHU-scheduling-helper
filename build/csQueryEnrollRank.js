if (window.location.port !== '8084') {
  function setStyle() {
    let flag = 0;
    document.querySelectorAll('#divClass table tr:nth-child(n+3)').forEach(function (tr) {
      let rankArray = tr.querySelector('td:nth-child(7)').innerText.trim().split(' - ');
      let rank = parseInt(rankArray[rankArray.length - 1]);
      let rankLower = parseInt(rankArray[0]);
      let maxRank = parseInt(tr.querySelector('td:nth-child(6)').innerText.trim());
      if (maxRank < rankLower) {
        tr.querySelectorAll('td').forEach(function (td) {
          td.classList.add('__SCHEDULING_HELPER');
          td.classList.add('__SCHEDULING_HELPER__enroll_rank_exceeded');
          flag = flag > 1 ? flag : 1;
        });
      } else if (maxRank < rank) {
        let td = tr.querySelector('td:last-child');
        td.classList.add('__SCHEDULING_HELPER');
        td.classList.add('__SCHEDULING_HELPER__enroll_rank_exceeded');
        flag = flag > 2 ? flag : 2;
      } else {
        tr.querySelectorAll('td').forEach(function (td) {
          td.classList.remove('__SCHEDULING_HELPER');
          td.classList.remove('__SCHEDULING_HELPER__enroll_rank_exceeded');
        });
      }
    });
    let divClass = document.querySelector('#divClass');
    if (flag === 2) {
      divClass.classList.add('__SCHEDULING_HELPER');
      divClass.classList.add('__SCHEDULING_HELPER__enroll_rank_hint_alt');
    } else if (flag === 1) {
      divClass.classList.add('__SCHEDULING_HELPER');
      divClass.classList.add('__SCHEDULING_HELPER__enroll_rank_hint');
    } else {
      divClass.classList.remove('__SCHEDULING_HELPER');
      divClass.classList.remove('__SCHEDULING_HELPER__enroll_rank_hint');
    }
  }

  function callback(mutationList) {
    document.querySelectorAll('td[colspan="10"]').forEach((value) => {
      value.setAttribute('colspan', '7')
    });
    mutationList.forEach((mutation) => {
      if (mutation.addedNodes.length >= 2) {
        setStyle();
      }
    });
  }

  const targetNode = document.querySelector("#divClass");
  const observerOptions = {
    childList: true,
    attributes: false,
  };

  let observer = new MutationObserver(callback);
  observer.observe(targetNode, observerOptions);
}
