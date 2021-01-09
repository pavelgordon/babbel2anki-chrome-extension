'use strict';


let button, helpLink;

//waits for DOM to load and then injects `Sync with Anki` button into web page.
function injectSyncButton() {
  if (document.body && document.head
    && document.getElementsByClassName('learned-items__toolbar-item')[1]
    && document.getElementsByClassName('learned-items__toolbar-item')[1].children.length >= 1
  ) {
    const sibling = document.getElementsByClassName('learned-items__toolbar-item')[1];
    sibling.style.display = "flex"
    document.getElementsByClassName("learned-items__toolbar")[0].style.display = "flex"
    document.getElementsByClassName("learned-items__toolbar")[0].style.alignItems = "end"

    const div = document.createElement("div");
    div.id = "wrapperDiv"
    div.style.display = "flex"
    div.style.flexDirection = "column"

    button = document.createElement("a");
    button.className = 'btn btn--primary'
    button.style.marginRight = ".938rem"

    button.innerHTML =
      '<img id="sync_spinner" src="https://icongr.am/clarity/sync.svg?size=20&color=FFFFFF" style="margin-right: 8px" alt="spin me baby"/>' +
      '<span id="sync_btn_label">Sync to Anki</span>'
    button.addEventListener('click', syncHandler);

    helpLink = document.createElement("a");
    helpLink.className = 'helpLink'
    helpLink.href = "https://github.com/pavelgordon/babbel2anki-chrome-extension#more-detailed-guide"
    helpLink.innerText = "Troubleshoot"

    div.append(button)
    div.append(helpLink)
    sibling.appendChild(div)

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
    console.log("Can't connect to Anki")
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
  const learnedItems = state.learnedItems.data
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

