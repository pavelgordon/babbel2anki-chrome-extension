## Babbel2Anki Chrome Extension
Chrome Extension which imports and syncs Babbel vocabulary to [Anki](https://apps.ankiweb.net/). Requires [AnkiConnect](https://foosoft.net/projects/anki-connect/) to work.
## What is it  
`Babbel` - a German subscription-based language learning app and e-learning platform with more than 14 languages being offered at the moment.  
`Anki` - Anki is a free and open-source flashcard program that utilizes spaced repetition. Spaced repetition has been shown to increase rate of memorization.  
`Anki Desktop` - computer version of Anki.  
`AnkiConnect` - addon for Anki Desktop.  
`Babbel2Anki` - unofficial chrome extension for exporting and syncing vocabulary from `Babbel` to `Anki`
## How to use
Assuming that `Anki Desktop` with `AnkiConnect` addon opened in background: 
1. Go to: `chrome://extensions`, enable Developer mode and load `app` as an unpacked extension.  
1. Login to Babbel and open [`Review section of Babbel`](https://my.babbel.com/review-manager?ref=navbar ). It opens a review section of a selected language. 
![image](https://user-images.githubusercontent.com/2462444/80614552-e0a90480-8a3e-11ea-8663-f0f4dcb998a1.png)
1. `Babbel2Anki` will: 
    -  Create deck `BabbelDeck`(if such deck already exists, nothing happens)
    -  Create model `BabbelModel`(if such model already exists, nothing happens)
    -  Adds all displayed `My vocab` words to deck `BabbelDeck`. Adds only words which are not in the deck.  
    -  Shows notification about an amount of **new** words which were saved in Anki(e.g. if notification says that new words/total words is 10/50 - means that other 40 words are duplicates).
    -  **Important**: `Babbel2Anki` adds only displayed items, which means that you have to use pagination at the bottom page to add all vocabulary.
![image](https://user-images.githubusercontent.com/2462444/80614789-2960bd80-8a3f-11ea-9394-5251ba8a7cab.png)
1. Check Anki Desktop for `BabbelDeck`: 
![image](https://user-images.githubusercontent.com/2462444/80614070-4e086580-8a3e-11ea-8b5c-cf847e1e29eb.png)

1. Check Dev Tools Console for any errors/debug messages.  
1. Optional: set custom `deckName` (and `modelName`) by clicking on extension, there is a popup with settings. Don't forget to click OK:  
![image](https://user-images.githubusercontent.com/2462444/80614208-74c69c00-8a3e-11ea-9c8b-bed26c895db9.png)  

## Things to do
- Maximum size of items is 100, and user has to click on pagination multiple times. Check if possible to:
  - request 1k+ words at the same time or
  - use pagination to fetch all words
 - Button to manually sync(add to review html page)
 - Checkbox to temporary disable auto-sync
  
## Links
- [Anki](https://apps.ankiweb.net)
- [AnkiConnect](https://foosoft.net/projects/anki-connect/)
- [Google Chrome Extension Development](http://developer.chrome.com/extensions/devguide.html)
- [generator-chrome-extension](https://github.com/yeoman/generator-chrome-extension)
- [Intercepting body requests in chrome extension](https://medium.com/better-programming/chrome-extension-intercepting-and-reading-the-body-of-http-requests-dd9ebdf2348b)