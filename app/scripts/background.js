'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});


console.log('\'Allo \'Allo! Event Page for Page Action');



chrome.runtime.onMessage.addListener(data => {
  console.log(data)
  if (data.type === 'notification') {
    chrome.notifications.create('', data.options);
  }
});
