'use strict';

let button, helpLink;

//waits for DOM to load the review button and then injects `Sync with Anki` button into web page.
function injectSyncButton() {
  const reviewButtonNodeList = document.querySelectorAll("button[href*='review?'][color='secondary-default']")
  if (reviewButtonNodeList && reviewButtonNodeList.length === 1) {
    const parent = reviewButtonNodeList[0].parentElement;
    const sibling = reviewButtonNodeList[0];
    
    const syncButtonDiv = createSyncButtonDiv();

    const wrapperDiv = document.createElement("div");
    wrapperDiv.id = "wrapperDiv"
    wrapperDiv.style.display = "flex"
    wrapperDiv.style.flexDirection = "row"

    wrapperDiv.append(sibling)
    wrapperDiv.append(syncButtonDiv)

    parent.append(wrapperDiv)
  } else {
    requestIdleCallback(injectSyncButton);
  }
}

requestIdleCallback(injectSyncButton);

async function ankiConnectionHealthCheck() {
  if (!button) {
    setTimeout(ankiConnectionHealthCheck, 100);
    return
  }

  const ankiConnectionStatus = await getOrInitProperty("ankiConnectionStatus", {ok: false})
  if (!ankiConnectionStatus.ok) {
    console.log("Can't connect to Anki. Please check the readme on github - maybe install AnkiConnect?")
    button.classList.add("disabled");
    helpLink.style.display = "inline-flex"

  } else {
    console.log("Anki is up")
    button.classList.remove("disabled");
    helpLink.style.display = "none"
  }
  setTimeout(ankiConnectionHealthCheck, 10_000);
}

ankiConnectionHealthCheck();

async function syncHandler() {

  const ankiConnectionStatus = await getOrInitProperty("ankiConnectionStatus", {ok: false})
  if (!ankiConnectionStatus.ok) {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
    return
  }

  const state = JSON.parse(sessionStorage.getItem('review_manager_state'))
  const learnedItems = Object.values(state.learnedItems.allItems)
  console.log('Sending ', learnedItems.length, ' words to Anki. Might take a minute or two to load images and sounds for every word')
  sendVocabularyToAnki(learnedItems)
}


async function sendVocabularyToAnki(learnedItems) {
  //todo maybe start earlier?
  startSpinningAnimation()

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

      stopSpinningAnimation()
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

function startSpinningAnimation() {
  document.getElementById("sync_spinner").style.animation = "spin 2s linear infinite"
}

function stopSpinningAnimation() {
  document.getElementById("sync_spinner").style.animation = ""
}

function createSyncButtonDiv() {
  const div = document.createElement("div");
  div.id = "syncButtonDiv"
  div.style.display = "flex"
  div.style.flexDirection = "column"
  div.style.marginLeft = ".938rem"

  button = document.createElement("a");
  button.className = 'babbel-button babbel-font'

  button.innerHTML =
    '<img id="sync_spinner" src="https://icongr.am/clarity/sync.svg?size=20&color=FFFFFF" style="margin-right: 8px" alt="spin me baby"/>' +
    '<span id="sync_btn_label">Sync to Anki</span>'
  button.addEventListener('click', syncHandler);

  helpLink = document.createElement("a");
  helpLink.className = 'helpLink babbel-font'
  helpLink.href = "https://github.com/pavelgordon/babbel2anki-chrome-extension#more-detailed-guide"
  helpLink.innerText = "Troubleshoot Babbel2Anki"

  div.append(button)
  div.append(helpLink)

  return div;
}
