## Babbel Chrome Extension
Extension to send information about learned items to [Babbel2Anki](https://github.com/pavelgordon/babbel-anki-exporter).  

## What it does
- Intercepts request like `api.babbel.io/learn_languages/ITA/learned_items?per_page=100`.  This request happens when user opens [`review`](https://my.babbel.com/review-manager) section.   
- Routes this request to `Babbel2Anki`(running locally), which 
  - Downloads all resources(image and audio) to `collection.media` folder of Anki
  - Creates `<deckName>.csv` which can be imported to Anki using delimiter `|`

## Test Chrome Extension
To test, go to: `chrome://extensions`, enable Developer mode and load `app` as an unpacked extension.  
After that, login to Babbel and open [`Review section of Babbel`](https://my.babbel.com/review-manager?ref=navbar ).  
Check Dev Tools Console for any errors/debug messages.  
If you have `Babbel2Anki` running locally on `localhost:8080` then you will be able to see `decks/deck.csv` with dictionary.
## Links
- [Google Chrome Extension Development](http://developer.chrome.com/extensions/devguide.html)
- [generator-chrome-extension](https://github.com/yeoman/generator-chrome-extension)
- [Intercepting body requests in chrome extension](https://medium.com/better-programming/chrome-extension-intercepting-and-reading-the-body-of-http-requests-dd9ebdf2348b)