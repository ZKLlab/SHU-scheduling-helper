// noinspection JSUnresolvedVariable
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message === 'requestUpdateCheck') {
    console.log('requestUpdateCheck -> received');
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction
    chrome.runtime.requestUpdateCheck(function (status) {
      console.log(`requestUpdateCheck -> Status: ${status}`);
      sendResponse()
    });
  }
});