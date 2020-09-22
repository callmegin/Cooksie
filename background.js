let previousDomain = "";

let activeTab = "";
let activeDomain = "";

// Setting

const objValuesToArray = (obj) => Object.values(obj);

const objKeyToArray = (obj) => Object.keys(obj);

const generateTable = (obj) => {
  // console.log(obj);
};

// arr.map((key) => {
//   console.log(key);
// });
// let outerArr = objValuesToArray(obj);
// console.log(outerArr);
// let innerArr = [];
// outerArr.map((el) => {
//   if (typeof el !== "object") {
//     //do smth here
//     // console.log(el);
//   } else {
//     innerArr = objValuesToArray(el);
//     innerArr.map((innerEl) => {
//       console.log(innerEl);
//     });
//     // generateTable(el);
//   }
// });
//for now adding new row can be done here

// const getDataFromStorage = (obj) => {
//   let items = [];
//   return new Promise((resolve) => {
//     chrome.storage.sync.get((items) => {
//       console.log(items);
//       if (!(Object.keys(items).length > 0) && !items.data) {
//         items.data = [obj];
//       } else {
//         items.data.push(obj);
//       }
//       resolve(items);
//     });
//   });
// };
const setStorage = (obj) => {
  chrome.storage.sync.get((items) => {
    if (!(Object.keys(items).length > 0) && !items.data) {
      items.data = [obj];
    } else {
      items.data.push(obj);
    }
    chrome.storage.sync.set(items, () => {});
  });
};
const saveToStorage = (tabId) => {
  let obj = {
    id: tabId,
    currentUrl: "",
    cookiesUrls: "",
    cookiesAmount: "",
  };
  setStorage(obj);
};

//====================================
//Not needed anymore
//====================================
// const updateObjValue = (id, key, value) => {
//   let tabData = tabsData.find((tab) => tab.id === id);
//   if (tabData && tabData[key] !== value) {
//     tabData[key] = value;

//     // console.log(tabsData);
//   }
// };

const updateRequired = (currDom, tabId) => {
  return new Promise((resolve) => {
    chrome.storage.sync.get("data", (items) => {
      console.log(items);
      const objIndex = items.data.findIndex((elem) => elem.id === tabId);
      if (objIndex == "-1") return;
      let obj = items.data[objIndex];
      if (currDom === obj.currentUrl) {
        resolve(false);
      } else {
        obj.currentUrl = currDom;
        chrome.storage.sync.set(items, () => {});
        resolve(true);
      }
    });

    // items.data[objIndex].currentUrl = "testing";
  });
};

const setBadgeColor = (color) => {
  chrome.browserAction.setBadgeBackgroundColor({ color: color });
};

const setBadgeText = (text) => {
  console.log(text);
  chrome.browserAction.setBadgeText({ text: text });
};

const getCookies = () => {
  chrome.tabs.executeScript(
    {
      code: 'performance.getEntriesByType("resource").map(el => el.name)',
    },
    (data) => {
      if (!data) return;
      const urls = data[0].map((url) => url.split(/[#?]/)[0]);
      const uniqueUrls = [...new Set(urls).values()].filter(Boolean);
      Promise.all(
        uniqueUrls.map(
          (url) =>
            new Promise((resolve) => {
              console.log(url);
              chrome.cookies.getAll({ url }, resolve);
            })
        )
      ).then((result) => {
        const cookies = [
          ...new Map(
            [].concat(...result).map((c) => [JSON.stringify(c), c])
          ).values(),
        ];
        console.log(cookies);
      });
    }
  );
};

const getDomain = (tabUrl) => {
  let url = new URL(tabUrl);
  let domain = url.hostname;
  return domain;
};
//onCreated
chrome.tabs.onCreated.addListener((tab) => {
  // console.log("onCreated");
  saveToStorage(tab.id);
  // console.log(tabsData);
});

//onRemoved
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // tabsData = tabsData.filter((obj) => obj.id != tabId);
});

//onActivated
chrome.tabs.onActivated.addListener((activeInfo) => {
  // console.log("onactivated");
  activeTab = activeInfo.tabId;
  setBadgeColor("red");
  setBadgeText("#");
});

//onUpdated
chrome.tabs.onUpdated.addListener(
  (listener = (tabId, changeInfo, tab) => {
    console.log("onupdated");
    let domain = getDomain(tab.url);
    if (!tab.url.startsWith("http")) return;
    if (typeof tab.url === "undefined" || typeof domain === "undefined") return;
    if (tab.status !== "complete") return;

    updateRequired(domain, tabId).then((result) => {
      if (!result) {
        console.log("update not required");
        return;
      } else {
        console.log("updateRequired");
        getCookies();
        // getCookies().then((result) => {
        //   console.log(result);
        //   // setBadgeColor("green");
        //   // setBadgeText(result.toString());
        // });
      }
    });

    // if (!updateRequired(domain, tabId)) {
    //   console.log("update not required");
    //   return;
    // } else {
    //   console.log("updateRequired");
    //   // updateObjValue(tabId, "currentUrl", domain);q
    //   setBadgeColor("green");
    //   getCookies().then((result) => setBadgeText(result.toString()));
    // }
  })
);
