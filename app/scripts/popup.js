'use strict';
/**
 * You need to right click the extension icon and choose "inspect popup"
 * to view the messages appearing on the console.
 */


document.addEventListener('DOMContentLoaded', initiateStorageAndUI, false);

async function initiateStorageAndUI() {
  const deckName = await getOrInitProperty('deckName', 'BabbelDeck')
  const modelName = await getOrInitProperty('modelName', 'BabbelModel')
  refreshPopup({deckName: deckName, modelName: modelName})

  document.getElementById('ok_btn').addEventListener('click', () => updateValues());
}

function getOrInitProperty(property, defaultValue) {
  return new Promise((resolve) => {
      chrome.storage.sync.get([property], result => {
        console.log(property,result[property] )
        if (result[property] === undefined || result[property] == null) {
          result[property] = defaultValue
          chrome.storage.sync.set({property: defaultValue},
            () => console.log(`initiated property ${property} with value ${defaultValue}`));
        }
        resolve(result[property])
      })
    }
  )
}

function updateValues() {

  const deckName = document.getElementById('deckName_textbox').value
  const modelName = document.getElementById('modelName_textbox').value

  chrome.storage.sync.set({
    deckName: deckName,
    modelName: modelName,
  }, function () {
    console.log(`updated values: deckName: ${deckName}, modelName: ${modelName}` );
  });
}


function refreshPopup(holder) {
  console.log('refreshPopup', holder)
  document.getElementById('deckName_textbox').value = holder.deckName
  document.getElementById('modelName_textbox').value = holder.modelName
}

