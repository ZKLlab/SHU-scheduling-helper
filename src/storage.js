export const chromeStorageBackend = {
  set(key, value) {
    return new Promise((resolve) => {
      let obj = {};
      obj[key] = value;
      // noinspection JSUnresolvedVariable
      chrome.storage.local.set(obj, () => {
        resolve();
      });
    });
  },
  get(key) {
    return new Promise((resolve) => {
      // noinspection JSUnresolvedVariable
      chrome.storage.local.get(key, (items) => {
        if (items[key]) {
          resolve(items[key]);
        } else {
          resolve(null);
        }
      });
    });
  },
  addListener(listener) {
    // noinspection JSUnresolvedVariable
    chrome.storage.onChanged.addListener(listener);
  },
};

export default chromeStorageBackend;