'use strict';

//waits for DOM to load and then injects `Sync with Anki` button into web page.
function injectSyncButton() {
  if (document.body && document.head && document.getElementsByClassName('learned-items__toolbar-item')[1]) {
    const sibling = document.getElementsByClassName('learned-items__toolbar-item')[1];
    const button = document.createElement("a");
    button.className = 'btn btn--primary'
    button.innerHTML = 'Sync page with Anki'
    button.addEventListener('click', () => {
      syncToAnki()
    });
    sibling.appendChild(button)
  } else {
    requestIdleCallback(injectSyncButton);
  }
}

requestIdleCallback(injectSyncButton);


function syncToAnki() {
  const state = JSON.parse(sessionStorage.getItem('review_manager_state'))
  const learnedItems = state.learnedItems.data
  console.log('Sending ', learnedItems.length, ' words to Anki. Might take a minute or two to load images and sounds for every word')
  sendDataToAnki(learnedItems)
}



async function sendDataToAnki(learnedItems) {
  const deckName = await getOrInitProperty('deckName', 'BabbelDeck')
  const modelName = await getOrInitProperty('modelName', 'BabbelModel')
  const tagString = await getOrInitProperty('tagString', '')

  chrome.runtime.sendMessage(
    {
      action: "addNotes",
      learnedItems: learnedItems,
      deckName: deckName,
      modelName: modelName,
      tagString: tagString
    }, response => {
      console.log(`Added ${response.addedNotes}/${response.totalNotes} new words to ${deckName} using model ${modelName} with tags (${tagString})`);
    });
}



function getOrInitProperty(property, defaultValue) {
  return new Promise((resolve) => {
      chrome.storage.sync.get([property], result => {
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
