function openHelper() {
  // noinspection JSUnresolvedVariable
  chrome.tabs.query({url: ['https://xk.zkllab.com/', 'https://xk.zkllab.com/?*']}, function (result) {
    if (result.length > 0) {
      // noinspection JSUnresolvedVariable
      chrome.windows.update(result[0].windowId, {focused: true});
      // noinspection JSUnresolvedVariable
      chrome.tabs.update(result[0].id, {active: true});
    } else {
      // noinspection JSUnresolvedVariable
      chrome.tabs.create({url: 'https://xk.zkllab.com/'});
    }
  });
}

// noinspection JSUnresolvedVariable,JSUnresolvedFunction
document.write(`v${chrome.runtime.getManifest().version}`);
document.getElementById('link').addEventListener('click', openHelper);