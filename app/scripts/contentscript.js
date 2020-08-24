'use strict';

//after DOM is loaded, we grab internal react component which is responsible for storing learned items in memory
//then we load them into hidden div tag, so later(when we send data to babbel - we read learned items from this div)
function interceptData() {
  var xhrOverrideScript = document.createElement('script');
  xhrOverrideScript.type = 'text/javascript';
  xhrOverrideScript.innerHTML = `
  function fetchDataFromBabbel() {
    function FindReact(dom, traverseUp = 0) {
      const key = Object.keys(dom).find(key => key.startsWith("__reactInternalInstance$"));
      const domFiber = dom[key];
      if (domFiber == null) return null;
    
      // react <16
      if (domFiber._currentElement) {
        let compFiber = domFiber._currentElement._owner;
        for (let i = 0; i < traverseUp; i++) {
          compFiber = compFiber._currentElement._owner;
        }
        return compFiber._instance;
      }
    
      // react 16+
      const GetCompFiber = fiber => {
        //return fiber._debugOwner; // this also works, but is DEV only
        let parentFiber = fiber.return;
        while (typeof parentFiber.type == "string") {
          parentFiber = parentFiber.return;
        }
        return parentFiber;
      };
      let compFiber = GetCompFiber(domFiber);
      for (let i = 0; i < traverseUp; i++) {
        compFiber = GetCompFiber(compFiber);
      }
      return compFiber.stateNode;
    }

  let some = document.getElementsByClassName("learned-items__toolbar")[0];
  let test = FindReact(some);   
  //test.props.totalVocabularyCount ==0 means that react component is not yet initialized, have to retry
  if(test.props.totalVocabularyCount == 0){
     console.log('vocabulary is not initiated yet, will retry in 1 second', test.props);
     setTimeout(()=>{
      fetchDataFromBabbel();
     }, 1000)
     return;
  }
   
  //makes request to Babbel Api to get ALL learned items(vocabulary) for this language
  test.selectPerPage(test.props.totalVocabularyCount)
  setTimeout(()=>{
    //internally vocabulary is stored in test.props.learnedItems
    //we extract vocabulary from there and store it in hidden div to be accessible later
    //todo replace with events?
    var dataDOMElement = document.createElement('div');
    dataDOMElement.id = '__interceptedData';
    dataDOMElement.innerText = JSON.stringify(test.props.learnedItems);
    dataDOMElement.style.height = 0;
    dataDOMElement.style.overflow = 'hidden';
    document.body.appendChild(dataDOMElement);
    console.log("fetched learning items/total vocabulary size", test.props.learnedItems.length,'/', test.props.totalVocabularyCount)
  }, 3000)
   
  };
  
  fetchDataFromBabbel();
   `
  document.head.prepend(xhrOverrideScript);
}

function FindReact(dom, traverseUp = 0) {
  const key = Object.keys(dom).find(key => key.startsWith("__reactInternalInstance$"));
  const domFiber = dom[key];
  if (domFiber == null) return null;

  // react <16
  if (domFiber._currentElement) {
    let compFiber = domFiber._currentElement._owner;
    for (let i = 0; i < traverseUp; i++) {
      compFiber = compFiber._currentElement._owner;
    }
    return compFiber._instance;
  }

  // react 16+
  const GetCompFiber = fiber => {
    //return fiber._debugOwner; // this also works, but is DEV only
    let parentFiber = fiber.return;
    while (typeof parentFiber.type == "string") {
      parentFiber = parentFiber.return;
    }
    return parentFiber;
  };
  let compFiber = GetCompFiber(domFiber);
  for (let i = 0; i < traverseUp; i++) {
    compFiber = GetCompFiber(compFiber);
  }
  return compFiber.stateNode;
}

//waits for DOM to load and then injects `Sync with Anki` button into web page.
function checkForDOM() {
  if (document.body && document.head && document.getElementsByClassName('learned-items__toolbar-item')[1]) {
    const sibling = document.getElementsByClassName('learned-items__toolbar-item')[1];
    const button = document.createElement("a");
    button.className = 'btn btn--primary'
    button.innerHTML = 'Sync with Anki'
    button.addEventListener('click', () => {manualSyncToAnki()});
    sibling.appendChild(button)

    interceptData()
    // test.selectPerPage(test.props.totalVocabularyCount)
    // console.log(test.props.learnedItems)
  } else {
    requestIdleCallback(checkForDOM);
  }
}


requestIdleCallback(checkForDOM);


function manualSyncToAnki() {
  const learningItemsEle = document.getElementById('__interceptedData');
  if (learningItemsEle) {
    const learnedItems = JSON.parse(learningItemsEle.innerHTML)
    console.log('Manual sync started, vocabulary size: ', learnedItems.length)
    console.log('On big vocabulary it might take time, wait for a minute or two in that case')

    chrome.storage.sync.set({lastSyncedAmount: 0})
    sendDataToAnki(learnedItems)
  } else {
    alert(`Error while manual syncing: no data. Please refresh page and try again.`);
  }
}


async function autoSyncToAnki() {
  const learningItemsEle = document.getElementById('__interceptedData');
  if (!learningItemsEle) {
    //cant sync anyway - no data stored
    // requestIdleCallback(autoSyncToAnki);
    console.log('autoSyncToAnki: no new words to sync with anki, will repeat in 30 seconds')
    return
  }
  const learnedItems = JSON.parse(learningItemsEle.innerHTML)
  const autoSyncMode = await getOrInitProperty('autoSyncMode', 'true')
  const lastSyncedAmount = await getOrInitProperty('lastSyncedAmount', 0)
  console.log(`autoSyncToAnki: autoSyncMode: ${autoSyncMode}, lastSyncedAmount: ${lastSyncedAmount}, learnedItems.length: ${learnedItems.length}`)
  if (autoSyncMode && lastSyncedAmount < learnedItems.length) {
    sendDataToAnki(learnedItems)
  }
  // requestIdleCallback(autoSyncToAnki);
}
setInterval(autoSyncToAnki, 30_000)

// requestIdleCallback(autoSyncToAnki);


async function sendDataToAnki(learnedItems) {
  chrome.storage.sync.get(['deckName', 'modelName'], result => {
    const deckName = result.deckName
    const modelName = result.modelName
    chrome.runtime.sendMessage(
      {
        action: "addNotes",
        learnedItems: learnedItems,
        deckName: deckName,
        modelName: modelName
      }, response => {
        chrome.storage.sync.set({lastSyncedAmount: response.totalNotes})
        console.log(`Added ${response.addedNotes}/${response.totalNotes} new words to ${deckName} using model ${modelName}`);
      });
  })
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

