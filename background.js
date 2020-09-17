let tabsData = [];
let previousDomain = "";

let activeTab = "";
let activeDomain = "";
// {
//   id: "",
//   currentUrl: "",
//   cookies: {
//     urls: "",
//     amount: "",
//   },
// },

const getUrl = (link) => link.split("/")[2];

//Below doesn't work
//
// chrome.browserAction.onClicked.addListener((tab) => {
//   // No tabs or host permissions needed!
//   console.log("clicked on a tab");
// });

const addObjToArray = (tabId) => {
  let obj = {
    id: tabId,
    currentUrl: "",
    cookies: {
      urls: "",
      amount: "",
    },
  };
  tabsData = [...tabsData, obj];
};

const updateObjValue = (id, key, value) => {
  let tabData = tabsData.find((tab) => tab.id === id);
  if (tabData && tabData[key] !== value) {
    tabData[key] = value;

    console.log(tabsData);
  }
};

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
        // console.log(data[0]);
        resolve(len);
      }
    );
  });
};

const getDomain = (tabUrl) => {
  console.log("getDomain"); //get current url
  //     let link = tab.url;
  let url = new URL(tabUrl);
  let domain = url.hostname;
  return domain;
};
//onCreated
chrome.tabs.onCreated.addListener((tab) => {
  // console.log("onCreated");
  addObjToArray(tab.id);
  // console.log(tabsData);
});

//onRemoved
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log(tabsData);
  tabsData = tabsData.filter((obj) => obj.id != tabId);
  console.log(tabsData);
});

//onActivated
chrome.tabs.onActivated.addListener((activeInfo) => {
  // console.log("onactivated");
  activeTab = activeInfo.tabId;
  setBadgeColor("red");
  setBadgeText("#");
});

const updateRequired = (currDom, tabId) => {
  let tabObj = tabsData.find((obj) => obj.id === tabId);
  if (currDom === tabObj.currentUrl) {
    return false;
  } else {
    tabObj.currentUrl = currDom;
    return true;
  }
};

//onUpdated
chrome.tabs.onUpdated.addListener(
  (listener = (tabId, changeInfo, tab) => {
    // console.log("onupdated");
    if (!tab.url.startsWith("http")) return;
    if (typeof tab.url === "undefined") return;
    if (tab.status !== "complete") return;
    let domain = getDomain(tab.url);
    if (!updateRequired(domain, tabId)) {
      return;
    } else {
      console.log("updateRequired");
      // updateObjValue(tabId, "currentUrl", domain);
      setBadgeColor("green");
      getCookies().then((result) => setBadgeText(result.toString()));
    }
  })
);
