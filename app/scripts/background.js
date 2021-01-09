'use strict';


function checkAnkiConnection() {
  checkConnection()
    .then(() => {
      console.log("AnkiConnection UP");
      chrome.storage.sync.set({ankiConnectionStatus: {ok: true, date: "now"}}, function () {
      });
    })
    .catch(() => {
      console.log("AnkiConnection DOWN");
      chrome.storage.sync.set({ankiConnectionStatus: {ok: false, date: "now"}}, function () {
      });
    })
  setTimeout(checkAnkiConnection, 10_000);
}

checkAnkiConnection();

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action !== "addNotes") {
      return true
    }

    getOrInitProperty("ankiConnectionStatus", {ok: false})
      .then(ankiConnectionStatus => {
        if (!ankiConnectionStatus.ok) {
          sendResponse({addedNotes: -1, totalNotes: -1, error: "Anki is not reachable"})
          return Promise.reject()
        }
      })
      .then(t => {
        const deckName = request.deckName
        const modelName = request.modelName
        const tagString = request.tagString
        const notes = request.learnedItems.map(
          item => ({
            deckName: deckName,
            modelName: modelName,
            fields: {
              Word: item.learnLanguageText,
              Picture: item.image && item.image.id
                ? `<img src='https://images.babbel.com/v1.0.0/images/${item.image.id}/variations/square/resolutions/500x500.png'/>`
                : '',
              "Extra Info": item.displayLanguageText
            },
            options: {
              "allowDuplicate": true,
              "duplicateScope": "deck"
            },
            tags: tagString
              ? tagString.split(',').map(s => s.trim())
              : [],
            audio: [{
              url: `https://sounds.babbel.com/v1.0.0/sounds/${item.sound.id}/normal.mp3`,
              filename: item.sound.id,
              fields: [
                "Pronunciation"
              ]
            }]

          })
        );
        createDeck(deckName)
          .then(() => createModel(modelName))
          .then(() => addNotes(notes))
          .then(response => (
            {
              notesIds: response.result,
              addedNotes: response.result.filter(e => e != null).length,
              totalNotes: response.result.length,
              error: response.error
            })
          )
          .then(result => showNotification(result))
          .then(result => sendResponse(result))
      })


    return true
  })


function createDeck(deckName) {
  return callAnkiConnect("createDeck", {
    deck: deckName
  })
}

function createModel(modelName) {
  return callAnkiConnect("createModel", {
    modelName: modelName,
    inOrderFields: ["Word", "Picture", "Extra Info", "Pronunciation"],
    css: `
          .card {
            font-family: arial;
            font-size: 20px;
            text-align: center;
            color: black;
            background-color: white;
          }

          .card1 { background-color: #FFFFFF; }
          .card2 { background-color: #FFFFFF; }`,
    cardTemplates: [
      {
        Name: "Comprehension Card",
        Front: `{{Word}}
{{#Pronunciation}}
<br>
\t<font color=blue>
\t{{Pronunciation}}
\t</font>
\t{{/Pronunciation}}
<br>`,
        Back:
          `{{FrontSide}}

<hr id=answer>

{{Picture}}

<br>

<span style="color:grey">{{Extra Info}}</span>
<br>`
      },
      {
        Name: "Production Card",
        Front: `{{FrontSide}}

{{Picture}}`,
        Back:
          `{{Picture}}
<hr id=answer>
{{Word}}
{{#Pronunciation}}
<br>
{{Pronunciation}}{{/Pronunciation}}
<br>

<span style="color:grey">{{Extra Info}}</span>
<br>`
      }
    ]
  })

}

function checkConnection() {
  return fetch('http://127.0.0.1:8765',
    {
      method: 'POST',
      body: JSON.stringify({action: "version", version: 6})
    })
}

function addNotes(notes) {
  // console.log("addNotes", notes.length)
  return callAnkiConnect("addNotes", {notes: notes})
}

async function callAnkiConnect(action, params = {}, version = 6,) {
  const response = await fetch('http://127.0.0.1:8765',
    {
      method: 'POST',
      body: JSON.stringify({action, version, params})
    })

  return response.json()
}

function showNotification(result) {
  const options = {
    title: `Added ${result.addedNotes} new words`,
    message: `\nTotal words: ${result.totalNotes}`,
    iconUrl: 'images/icon.png',
    type: 'basic'

  }
  chrome.notifications.create('', options);
  return result
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