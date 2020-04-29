'use strict';

console.log('\'Allo \'Allo! Popup');

document.addEventListener('DOMContentLoaded', initiateStorageAndUI, false);


function initiateStorageAndUI() {
  chrome.storage.sync.get(['deckName', 'modelName'], function (result) {
    if (!result.deckName) {
      result.deckName = 'BabbelDeck'
      chrome.storage.sync.set({
        "deckName": result.deckName,
      },
        () => console.log(`refreshed deckName: ${result.deckName} `));
    }
    if (!result.modelName) {
      result.modelName = 'BabbelModel'
      chrome.storage.sync.set({
          "modelName": result.modelName,
        },
        () => console.log(`refreshed modelName: ${result.modelName} `));
    }
    console.log('Deck and Model Names are', result.deckName, result.modelName);
    refreshUI(result)
  });

  document.getElementById('ok_btn').addEventListener('click',
      () => updateValues());

  // you can add listeners for other objects ( like other buttons ) here
}

function updateValues() {
  const deckName = document.getElementById('deckName_textbox').value
  const modelName = document.getElementById('modelName_textbox').value

  chrome.storage.sync.set({
    "deckName": deckName,
    "modelName": modelName
  }, function () {
    console.log(`updated values: deckName: ${deckName}, modelName: ${modelName} `);
  });
  // do processing with data
  // you need to right click the extension icon and choose "inspect popup"
  // to view the messages appearing on the console.
}


function refreshUI(holder) {
  document.getElementById('deckName_textbox').value = holder.deckName
  document.getElementById('modelName_textbox').value = holder.modelName
}

