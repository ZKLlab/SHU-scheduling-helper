import axios from 'axios'
import Storage from './storage'

function versionCompare(a, b) {
  let aResult = /^v?(\d+)\.(\d+)\.(\d+)(?:.*?)$/.exec(a);
  let bResult = /^v?(\d+)\.(\d+)\.(\d+)(?:.*?)$/.exec(b);
  if (aResult === null && bResult === null) {
    return 0;
  } else if (aResult === null) {
    return 1;
  } else if (bResult === null) {
    return -1;
  }
  // 可以用更好的方案，但没必要
  let aNum = parseInt(aResult[1]) * 1000000 + parseInt(aResult[2]) * 1000 + parseInt(aResult[3]);
  let bNum = parseInt(bResult[1]) * 1000000 + parseInt(bResult[2]) * 1000 + parseInt(bResult[3]);
  if (aNum > bNum) {
    return 1;
  } else if (aNum < bNum) {
    return -1;
  } else {
    return 0;
  }
}

export default function () {
  return new Promise((resolve) => {
    Storage.get('lastUpdateCheckingTime').then((value) => {
      if (value !== null && new Date().getTime() < value + 30 * 60 * 1000) {
        Storage.get('updateInfo').then((value2) => {
          // noinspection JSUnresolvedVariable,JSUnresolvedFunction
          if (value2 !== null && versionCompare(value2.version, chrome.runtime.getManifest().version) > 0) {
            resolve();
          } else {
            resolve(null);
          }
        });
      } else {
        Storage.set('lastUpdateCheckingTime', new Date().getTime()).then(() => {
          axios.get(
            'https://api.github.com/repos/ZKLlab/SHU-scheduling-helper/releases/latest'
          ).then((response) => {
            // noinspection JSUnresolvedVariable,JSUnresolvedFunction
            if (versionCompare(response.data['tag_name'], chrome.runtime.getManifest().version) > 0) {
              // noinspection JSUnresolvedVariable,JSUnresolvedFunction
              resolve({
                version: response.data['tag_name'],
                content: response.data['body'],
              });
            } else {
              resolve(null);
            }
          }).catch(() => {
            resolve();
          });
        });
      }
    });
  });
};