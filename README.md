<p align="center">
<img src="https://i.imgur.com/RXOYJCu.png" width="250" alt="babbel-to-anki">
</p>
<h1 align="center">
Babbel2Anki
</h1>
<p align="center">
Chrome Extension which imports and syncs Babbel vocabulary to Anki. Supports auto-syncing, customising deck and card template for syncing.
</p>

## What is it  
[`Babbel`](https://my.babbel.com) - a German subscription-based language learning app and e-learning platform with more than 14 languages being offered at the moment.  
[`Anki`](https://apps.ankiweb.net/) - Anki is a free and open-source flashcard program that utilizes spaced repetition. Spaced repetition has been shown to increase rate of memorization.  
[`Anki Desktop`](https://apps.ankiweb.net/) - computer version of Anki.  
[`AnkiConnect`](https://foosoft.net/projects/anki-connect/) - addon for Anki Desktop.  
`Babbel2Anki` - unofficial chrome extension for exporting and syncing vocabulary from `Babbel` to `Anki` made by me.
## How to use
### TL;DR:
1. Install this extension
1. Open `Anki Desktop` with [`AnkiConnect`](https://foosoft.net/projects/anki-connect/) addon.
1. Open [`Review section of Babbel`](https://my.babbel.com/review-manager?ref=navbar) with any language of your choice.
1. Check your `Anki Desktop` for new deck `BabbelDeck` with all your words from Babbel.
### More detailed guide
Assuming that `Anki Desktop` with `AnkiConnect` addon opened in background: 
1. Go to: `chrome://extensions`, enable Developer mode and load `app` as an unpacked extension.
1. Optional: Set custom deck name and enable/disable auto-sync mode by clicking on extension, there is a popup with settings.

![image](https://user-images.githubusercontent.com/2462444/80767209-ae36fe80-8b47-11ea-8798-53a8541cfbb0.png)
1. Login to Babbel and open [`Review section of Babbel`](https://my.babbel.com/review-manager?ref=navbar ). It opens a review section of a selected language. 
- `Sync with Anki` is a new button coming from `Babbel2Anki` which allows to manually sync to configured deck.
- `auto-sync` enabled option performs sync to configured deck every 30 seconds.
![image](https://user-images.githubusercontent.com/2462444/80767502-564cc780-8b48-11ea-954a-98a3fff83e0d.png)
1. `Babbel2Anki` will: 
    -  Create a deck with name `BabbelDeck`(if such deck already exists, nothing happens)
    -  Create a card template (model) with name `BabbelModel` and all necessary fields (if such model already exists, nothing happens)
    -  Adds all learned `My vocab` words to deck `BabbelDeck`. Adds only new words(which are not in the deck).  
    -  Shows notification about an amount of **new** words which were saved in Anki (e.g. if notification says that new words/total words is 10/50 - means that other 40 words are duplicates).
![image](https://user-images.githubusercontent.com/2462444/80767663-b5124100-8b48-11ea-9d6b-c8beb3f6aa51.png)
1. Check Anki Desktop for `BabbelDeck`: 
![image](https://user-images.githubusercontent.com/2462444/80614070-4e086580-8a3e-11ea-8b5c-cf847e1e29eb.png)
1. Check Dev Tools Console for any errors/debug messages.  

## Things to do
- ~~Maximum size of items is 100, and user has to click on pagination multiple times. Check if possible to:~~
  - ~~request 1k+ words at the same time or~~
  - ~~use pagination to fetch all words~~
 - ~~Button to manually sync(add to review html page)~~
 - ~~Checkbox to temporary disable auto-sync~~
- Better workflow for multiple decks
- Extend to other learning web-sites(like Duolingo)
- Custom Sync server
  
## Links
- [Anki](https://apps.ankiweb.net)
- [AnkiConnect](https://foosoft.net/projects/anki-connect/)
- [Github Primer](https://primer.style/css/getting-started])
- [Google Chrome Extension Development](http://developer.chrome.com/extensions/devguide.html)
- [generator-chrome-extension](https://github.com/yeoman/generator-chrome-extension)
- [Intercepting body requests in chrome extension](https://medium.com/better-programming/chrome-extension-intercepting-and-reading-the-body-of-http-requests-dd9ebdf2348b)
- [Icons used from](https://www.flaticon.com/)