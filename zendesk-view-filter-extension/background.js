// on extension installation initialize local view storage, get views from open Zendesk tabs, and listen for view updates
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["views"], value => {
    if (Object.keys(value.views).length == 0) {
      chrome.storage.local.set({ views: {} }); // create views object if none exists
    }
  });

  chrome.tabs.query({ url: "https://datadog.zendesk.com/agent/*" }, tabs => {
    tabs.forEach(tab => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["syncViews.js"],
        });
    });
  });
});

// sync view state when tab is navigated back to
chrome.tabs.onActivated.addListener(() => {
  callSyncViewState()
});

// sync view state when window focus is changed
chrome.windows.onFocusChanged.addListener(() => {
  callSyncViewState()
});

function callSyncViewState() {
  chrome.tabs.query({ active: true, currentWindow: true, url: "https://datadog.zendesk.com/agent/*" }, tabs => {
    if (tabs.length != 1) return;
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["syncViewState.js"],
      });
  });
}