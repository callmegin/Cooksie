const getUrl = (link) => link.split("/")[2];

//Below doesn't work
//
// chrome.browserAction.onClicked.addListener((tab) => {
//   // No tabs or host permissions needed!
//   console.log("clicked on a tab");
// });

chrome.browserAction.setBadgeBackgroundColor({ color: "green" });
chrome.browserAction.setBadgeText({ text: "..." });

const getCookies = () => {
  chrome.tabs.executeScript(
    {
      code: 'performance.getEntriesByType("resource").map(el => el.name)',
    },
    (data) => {
      console.log(data[0].length);
      data[0].map((urls) => {
        // console.log(urls);
      });
    }
  );
};

const getDomain = (info) => {
  return new Promise((resolve) => {
    chrome.tabs.get(info.tabId, (tab) => {
      //get current url
      //     let link = tab.url;
      let url = new URL(tab.url);
      let domain = url.hostname;
      resolve(domain);
    });
  });
};
// getDomain(activeInfo).then((result) => console.log("activeInfo " + result));
chrome.tabs.onActivated.addListener((activeInfo) => {
  // console.clear();
  console.log("onActivated");
});
chrome.tabs.onCreated.addListener((tab) => {
  // console.clear();
  console.log("onCreated");
});

const waitForPageLoad = () => {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("onUpdated");
    if (
      changeInfo.url !== "chrome://newtab/" &&
      typeof changeInfo.url !== "undefined"
    ) {
      console.log("PAGE LOAD DETECTED " + tab.url);
    }
    if (changeInfo.status === "complete") {
      console.log("LOADED");
    }
  });
};
