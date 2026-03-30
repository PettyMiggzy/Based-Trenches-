// Based Trenches Launcher — background service worker
// Keeps extension alive and handles any background tasks

chrome.runtime.onInstalled.addListener(() => {
  console.log('Based Trenches Launcher installed')
})

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_TAB') {
    chrome.tabs.create({ url: message.url })
    sendResponse({ success: true })
  }
  return true
})
