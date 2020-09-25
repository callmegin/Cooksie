let previousDomain = "";

// let activeTab = "";

let activeDomain = "";

// Setting

const objValuesToArray = (obj) => Object.values(obj);

const objKeyToArray = (obj) => Object.keys(obj);

const generateTable = (obj) => {
  //
};

// arr.map((key) => {
//
// });
// let outerArr = objValuesToArray(obj);
//
// let innerArr = [];
// outerArr.map((el) => {
//   if (typeof el !== "object") {
//     //do smth here
//     //
//   } else {
//     innerArr = objValuesToArray(el);
//     innerArr.map((innerEl) => {
//
//     });
//     // generateTable(el);
//   }
// });
//for now adding new row can be done here

// const getDataFromStorage = (obj) => {
//   let items = [];
//   return new Promise((resolve) => {
//     chrome.storage.local.get((items) => {
//
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
  chrome.storage.local.get((items) => {
    if (!(Object.keys(items).length > 0) && !items.data) {
      items.data = [obj];
    } else {
      items.data.push(obj);
    }
    chrome.storage.local.set(items, () => {});
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

//     //
//   }
// };
const getObjectIndexById = (objArr, tabId) =>
  (objIndex = objArr.findIndex((elem) => elem.id === tabId));

const getObjectById = (objArr, tabId) => {
  let obj = {};
  const objIndex = getObjectIndexById(objArr, tabId);
  if (objIndex == "-1") return obj;
  obj = objArr[objIndex];
  return obj;
};

const updateRequired = (currDom, tabId) => {
  return new Promise((resolve) => {
    chrome.storage.local.get("data", (items) => {
      let obj = getObjectById(items.data, tabId);
      // if (!obj) resolve(false);
      if (!Object.keys(obj).length > 0) resolve(false);
      if (currDom === obj.currentUrl) {
        resolve(false);
      } else {
        obj.currentUrl = currDom;
        chrome.storage.local.set(items, () => {});
        resolve(true);
      }
    });
  });
};

const updateTabData = (key, value, tabId) => {
  chrome.storage.local.get((items) => {
    let obj = getObjectById(items.data, tabId);
    // if (!obj) return false;
    obj[key] = value;

    chrome.storage.local.set(items, () => {});
  });
};
let removingTab = false;
let pendingIds = [];
let removingInProgress = false;

const removeTab = (tabId) => {
  if (tabId) {
    pendingIds.push(tabId);
  }
  if (removingInProgress) {
    return;
  }
  let idToRemove = "";

  new Promise((resolve) => {
    removingInProgress = true;
    idToRemove = pendingIds.shift();

    chrome.storage.local.get(resolve);
  })
    .then((result) => {
      if (Object.keys(result).length > 0 && result.data) {
        return (result.data = result.data.filter((elem) => {
          return elem.id !== idToRemove;
        }));
      }
    })
    .then((result) => {
      return chrome.storage.local.set({ data: result });
    })
    .then((result) => {
      removingInProgress = false;
      if (pendingIds.length > 0) {
        removeTab();
      }
    });

  // new Promise((resolve) => {
  //   chrome.storage.local.get(resolve);
  // })
  //   .then((result) => {
  //     if (Object.keys(result).length > 0 && result.data) {
  //
  //       return (result.data = result.data.filter((elem) => {
  //
  //         return elem.id !== tabId;
  //       }));
  //     }
  //   })
  //   .then((result) => {
  //
  //
  //
  //     return chrome.storage.local.set({ data: result });
  //   });
  // chrome.storage.local.get((items) => {
  //   if (Object.keys(items).length > 0 && items.data) {
  //
  //     items.data = items.data.filter((elem) => {
  //
  //       return elem.id !== tabId;
  //     });
  //     chrome.storage.local.set(items, () => {
  //       chrome.storage.local.get((items) => {
  //
  //
  //       });
  //     });
  //   }
  // });
};

//onRemoved
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  removingTab = true;
  removeTab(tabId);
});

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
      if (!data || !data[0] || chrome.runtime.lastError) {
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
//   //
//
//   addNewTab(tab.id);
//   //
//   //
// });

const setBadgeData = (items, activeTab) => {
  let obj = getObjectById(items, activeTab);

  if (Object.keys(obj).length > 0 && obj.cookiesAmount !== "") {
    setBadgeColor("green");
    setBadgeText(obj.cookiesAmount.toString());
  } else {
    setBadgeColor("red");
    setBadgeText("#");
  }
};
chrome.storage.onChanged.addListener((data, area) => {
  chrome.storage.local.get((items) => {});
});

//onActivated
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (removingTab) {
    removingTab = false;
    return;
  }

  let activeTab = activeInfo.tabId;

  chrome.storage.local.get((items) => {
    if (!(Object.keys(items).length > 0) && !items.data) {
      addNewTab(activeTab);
      new Promise((resolve) => {
        chrome.storage.onChanged.addListener(resolve);
      }).then((data) => {
        updateRequired(domain, tabId).then((result) => {
          if (!result) {
            setBadgeData(data.data.newValue, activeTab);
            return;
          } else {
            getCookies(tabId);
          }
        });
      });
    } else if (!items.data.find((elem) => elem.id === activeTab)) {
      addNewTab(activeTab);
      new Promise((resolve) => {
        chrome.storage.onChanged.addListener(resolve);
      }).then((data) => {});
    } else {
      setBadgeData(items.data, activeTab);
    }
  });
});

//onUpdated
chrome.tabs.onUpdated.addListener(
  (listener = (tabId, changeInfo, tab) => {
    let domain = getDomain(tab.url);
    if (!tab.url.startsWith("http")) return;
    if (typeof tab.url === "undefined" || typeof domain === "undefined") return;
    if (tab.status !== "complete") return;
    updateRequired(domain, tabId).then((result) => {
      if (!result) {
        return;
      } else {
        getCookies(tabId);
      }
    });
  })
);
