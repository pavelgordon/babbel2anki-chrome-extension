'use strict';


// const button = document.createElement('button');
// button.textContent = 'Greet me!'
// document.body.insertAdjacentElement('afterbegin', button);
// button.addEventListener('click', () => {
//   console.log('notification')
//
// });

var xhrOverrideScript = document.createElement('script');
xhrOverrideScript.type = 'text/javascript';
xhrOverrideScript.innerHTML = `
  (function() {
    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;
    XHR.open = function(method, url) {
        this.url = url; // the request url
        return open.apply(this, arguments);
    }
    XHR.send = function() {
        this.addEventListener('load', function() {
            if (this.url.includes('learned_items')) {
                var data = JSON.parse(this.response);
                data.url = this.url
                console.log('-------------------------------')
                console.log(this)
                console.log(data)
                var dataDOMElement = document.createElement('div');
                dataDOMElement.id = '__interceptedData';
                dataDOMElement.innerText = JSON.stringify(data);
                dataDOMElement.style.height = 0;
                dataDOMElement.style.overflow = 'hidden';
                document.body.appendChild(dataDOMElement);
            }               
        });
        return send.apply(this, arguments);
    };
  })();
  `
document.head.prepend(xhrOverrideScript);








function interceptData() {
  var xhrOverrideScript = document.createElement('script');
  xhrOverrideScript.type = 'text/javascript';
  xhrOverrideScript.innerHTML = `
  (function() {
    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;
    XHR.open = function(method, url) {
        this.url = url; // the request url
        return open.apply(this, arguments);
    }
    XHR.send = function() {
        this.addEventListener('load', function() {
            if (this.url.includes('learned_items')) {
                var data = JSON.parse(this.response);
                data.url = this.url
                console.log('-------------------------------')
                console.log(this)
                console.log(data)
                var dataDOMElement = document.createElement('div');
                dataDOMElement.id = '__interceptedData';
                dataDOMElement.innerText = JSON.stringify(data);
                dataDOMElement.style.height = 0;
                dataDOMElement.style.overflow = 'hidden';
                document.body.appendChild(dataDOMElement);
            }               
        });
        return send.apply(this, arguments);
    };
  })();
  `
  document.head.prepend(xhrOverrideScript);
}

function checkForDOM() {
  if (document.body && document.head) {
    interceptData();
  } else {
    requestIdleCallback(checkForDOM);
  }
}


requestIdleCallback(checkForDOM);

function scrapeData() {
  var responseContainingEle = document.getElementById('__interceptedData');
  if (responseContainingEle) {
    console.log("json data ", responseContainingEle.innerHTML)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/dictionary/download', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = function () {
      console.log("babbel2anki exporter response", this.response);
      const data = JSON.parse(this.response)
      chrome.runtime.sendMessage('', {
        type: 'notification',
        options: {
          title: `Processed ${data.new} new words`,
          message: `${data.status}\nTotal words: ${data.total}`,
          iconUrl: 'images/icon.png',
          type: 'basic'
        }
      });
    };


    xhr.send(responseContainingEle.innerHTML);

    responseContainingEle.remove()
  }
  requestIdleCallback(scrapeData);

}

requestIdleCallback(scrapeData);