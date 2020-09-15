const tabData = {
  id: "",
  url: "",
  cookies: {
    urls: "",
    amount: "",
  },
};

const getUrl = (link) => link.split("/")[2];

//Below doesn't work
//
// chrome.browserAction.onClicked.addListener((tab) => {
//   // No tabs or host permissions needed!
//   console.log("clicked on a tab");
// });

const setBadgeColor = (color) => {
  chrome.browserAction.setBadgeBackgroundColor({ color: color });
};

const setBadgeText = (text) => {
  chrome.browserAction.setBadgeText({ text: text });
};

const getCookies = () => {
  return new Promise((resolve) => {
    chrome.tabs.executeScript(
      {
        code: 'performance.getEntriesByType("resource").map(el => el.name)',
      },
      (data) => {
        const len = data[0].length;
        console.log(data[0]);
        resolve(len);
      }
    );
  });
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

chrome.tabs.onActivated.addListener((activeInfo) => {
  setBadgeColor("red");
  setBadgeText("#");
  chrome.tabs.onUpdated.addListener(
    (listener = (tabId, changeInfo, tab) => {
      if (tab.url === "chrome://newtab/") return;
      if (typeof tab.url === "undefined") return;
      if (tab.status !== "complete") return;
      chrome.tabs.onUpdated.removeListener(listener);
      setBadgeColor("green");
      getCookies().then((result) => setBadgeText(result.toString()));
    })
  );
});
