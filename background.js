const getUrl = (link) => link.split("/")[2];

chrome.browserAction.onClicked.addListener((tab) => {
  // No tabs or host permissions needed!
  console.log("clicked on a tab");
});

chrome.browserAction.setBadgeBackgroundColor({ color: "red" });

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    //get current url
    //     let link = tab.url;
    let url = new URL(tab.url);
    let domain = url.hostname;
    console.log(domain);
    chrome.cookies.getAll({ path: "www.15min.lt" }, (cookies) => {
      console.log(cookies);
    });

    // for (let i in cookieStores) {
    //   console.log(i);
    //   console.log(cookieStores[i]);
    // }
  });
  //     chrome.cookies.getAll({ storeId: link }, (cookies) => {
  //       console.log(cookies);
  //     });
  //   });
});
//Add numbers next to icon

chrome.browserAction.setBadgeText({ text: "10" });
