let opening
chrome.action.onClicked.addListener(() => {
  if (opening) return
  opening = (async () => {
    const url = chrome.runtime.getURL('index.html')
    const tabs = await chrome.tabs.query({})
    const existing = tabs.find((tab) => tab.url?.split('?')[0].split('#')[0] === url)
    if (existing?.id) {
      await chrome.tabs.update(existing.id, { active: true })
      await chrome.windows.update(existing.windowId, { focused: true })
    } else {
      await chrome.tabs.create({ url })
    }
  })()
    .catch(console.error)
    .finally(() => {
      opening = undefined
    })
})
