let previousDomain = "";

let activeTab = "";
let removingTab = false;
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
const addNewTab = (tabId) => {
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
const getObjectById = (objArr, tabId) => {
  let obj = {};
  const objIndex = objArr.findIndex((elem) => elem.id === tabId);
  if (objIndex == "-1") return obj;
  obj = objArr[objIndex];
  return obj;
};

const updateRequired = (currDom, tabId) => {
  return new Promise((resolve) => {
    chrome.storage.sync.get("data", (items) => {
      let obj = getObjectById(items.data, tabId);
      // if (!obj) resolve(false);
      if (currDom === obj.currentUrl) {
        resolve(false);
      } else {
        obj.currentUrl = currDom;
        chrome.storage.sync.set(items, () => {});
        resolve(true);
      }
    });
  });
};

const updateTabData = (key, value, tabId) => {
  chrome.storage.sync.get((items) => {
    let obj = getObjectById(items.data, tabId);
    // if (!obj) return false;
    obj[key] = value;
    console.log(obj);
    console.log(items);
    chrome.storage.sync.set(items, () => {});
  });
};

const removeTab = (tabId) => {
  chrome.storage.sync.get((items) => {
    if (Object.keys(items).length > 0 && items.data) {
      items.data = items.data.filter((elem) => elem.id !== tabId);
      console.log("Removing");
      console.log(items);
      chrome.storage.sync.set(items, () => {});
    }
  });
};

const setBadgeColor = (color) => {
  chrome.browserAction.setBadgeBackgroundColor({ color: color });
};

const setBadgeText = (text) => {
  chrome.browserAction.setBadgeText({ text: text });
};

const getCookies = (tabId) => {
  chrome.tabs.executeScript(
    {
      code: 'performance.getEntriesByType("resource").map(el => el.name)',
    },
    (data) => {
      console.log("tabId in cookies - " + tabId);
      if (!data || !data[0] || chrome.runtime.lastError) {
        console.log("getCookies failed on if");
        return;
      }
      const urls = data[0].map((url) => url.split(/[#?]/)[0]);
      const uniqueUrls = [...new Set(urls).values()].filter(Boolean);
      Promise.all(
        uniqueUrls.map(
          (url) =>
            new Promise((resolve) => {
              chrome.cookies.getAll({ url }, resolve);
            })
        )
      ).then((result) => {
        const cookies = [
          ...new Map(
            [].concat(...result).map((elem) => [JSON.stringify(elem), elem])
          ).values(),
        ];
        setBadgeColor("green");
        setBadgeText(cookies.length.toString());
        updateTabData("cookiesAmount", cookies.length.toString(), tabId);
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
// chrome.tabs.onCreated.addListener((tab) => {
//   // console.log("onCreated");
//   console.log(tab);
//   addNewTab(tab.id);
//   // console.log("onCreated done");
//   // console.log(tabsData);
// });

//onRemoved
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log("removing - " + tabId);
  removingTab = true;
  removeTab(tabId);
});

const setBadgeData = (items, activeTab) => {
  console.log(items);
  let obj = getObjectById(items, activeTab);
  if (Object.keys(obj).length > 0 && obj) {
    console.log(obj);
    setBadgeColor("green");
    setBadgeText(obj.cookiesAmount.toString());
  } else {
    setBadgeColor("red");
    setBadgeText("#");
  }
};

//onActivated
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("////////// onActivated //////////");
  console.log(activeTab);
  console.log(activeInfo.tabId);
  if (removingTab) {
    console.log("Removing in progress");
    removingTab = false;
    return;
  }
  console.log("All good ======");

  activeTab = activeInfo.tabId;
  console.log(activeTab);
  chrome.storage.sync.get((items) => {
    console.log("onActivated storage get");
    console.log(items);

    if (!(Object.keys(items).length > 0) && !items.data) {
      addNewTab(activeTab);
      new Promise((resolve) => {
        console.log("ACTIVATED - New Promise");
        chrome.storage.onChanged.addListener(resolve);
      }).then((data) => {
        console.log("ACTIVATED - Promise.then");
        console.log(data.data.newValue);
        setBadgeData(data.data.newValue, activeTab);
      });
    } else if (!items.data.find((elem) => elem.id === activeTab)) {
      addNewTab(activeTab);
      new Promise((resolve) => {
        console.log("ACTIVATED - New Promise 2");
        chrome.storage.onChanged.addListener(resolve);
      }).then((data) => {
        console.log("ACTIVATED - Promise.then 2");
        console.log(data.data.newValue);
        setBadgeData(data.data.newValue, activeTab);
      });
    } else {
      console.log("No Promise");
      console.log(items);
      setBadgeData(items.data, activeTab);
    }
  });
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
        getCookies(tabId);
      }
    });
  })
);
