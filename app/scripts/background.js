'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});


console.log('\'Allo \'Allo! Event Page for Page Action');


chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");

    if (request.action == "addNotes") {
      const deckName = request.deckName
      const modelName = request.modelName
      const notes = request.learnedItems.map(
        item => ({
          deckName: deckName,
          modelName: modelName,
          fields: {
            Word: item.learn_language_text,
            Picture: `<img src='https://images.babbel.com/v1.0.0/images/${item.image.id}/variations/square/resolutions/500x500.png'/>`,
            "Extra Info": item.display_language_text
          },
          options: {
            "allowDuplicate": false,
            "duplicateScope": "deck"
          },
          tags: [
            "yomichan"
          ],
          audio: [{
            url: `https://sounds.babbel.com/v1.0.0/sounds/${item.sound.id}/normal.mp3`,
            filename: item.sound.id,
            fields: [
              "Pronunciation"
            ]
          }]

        })
      );
      console.log(`deck ${deckName}, model ${modelName}, notes:`, notes)
      createDeck(deckName).then(deckResult => {
          console.log(`deck ${deckName} created or existed, calling addModel`, deckResult)
          createModel(modelName).then(model => {
            console.log("model created or existed, calling addNotes", model)
            addNotes(notes)
              .then(response => (
                {
                  notesIds: response.result,
                  addedNotes: response.result.filter(e => e != null).length,
                  totalNotes: response.result.length,
                  error: response.error
                })
              )
              .then(result => sendResponse(result))
          })
        }
      )
    }
    return true
  })
;


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


function addNotes(notes) {
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