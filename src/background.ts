// background.ts
interface TimeData {
  [domain: string]: {
    totalTime: number
    lastActive: number
    focusTime: number
  }
}

interface TabInfo {
  tabId: number
  domain: string
  activatedTime: number
}

interface Category {
  id: string
  name: string
  color: string
}

interface DomainCategoryMap {
  [domain: string]: string
}

interface StorageData {
  webtimeData: TimeData
  categories: Category[]
  domainCategories: DomainCategoryMap
}

let currentTab: TabInfo | null = null
let timeData: TimeData = {}
let categories: Category[] = [
  { id: "work", name: "Work", color: "#165DFF" },
  { id: "entertainment", name: "Entertainment", color: "#1EC18C" },
  { id: "social", name: "Social", color: "#FF8A3D" },
  { id: "other", name: "Other", color: "#94A3B8" }
]
let domainCategories: DomainCategoryMap = {}

// 内存存储作为回退
let inMemoryStorage: StorageData = {
  webtimeData: {},
  categories: categories,
  domainCategories: {}
}

// 从 storage 加载数据
async function loadData() {
  return new Promise((resolve) => {
    try {
      if (!chrome?.storage?.local) {
        console.warn("chrome.storage.local is not available, using in-memory storage")
        // 使用内存存储
        timeData = inMemoryStorage.webtimeData
        categories = inMemoryStorage.categories
        domainCategories = inMemoryStorage.domainCategories
        resolve(timeData)
        return
      }

      chrome.storage.local.get(["webtimeData", "categories", "domainCategories"], (result) => {
        if (result?.webtimeData) {
          timeData = result.webtimeData
        }
        if (result?.categories) {
          categories = result.categories
        }
        if (result?.domainCategories) {
          domainCategories = result.domainCategories
        }
        resolve(timeData)
      })
    } catch (error) {
      console.error("Error loading data:", error)
      resolve(timeData)
    }
  })
}

// 保存数据
function saveData() {
  try {
    if (!chrome?.storage?.local) {
      console.warn("chrome.storage.local is not available, using in-memory storage")
      // 保存到内存存储
      inMemoryStorage = {
        webtimeData: timeData,
        categories: categories,
        domainCategories: domainCategories
      }
      return
    }
    chrome.storage.local.set({ 
      webtimeData: timeData,
      categories: categories,
      domainCategories: domainCategories
    })
  } catch (error) {
    console.error("Error saving data:", error)
  }
}

// 从URL提取域名
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // 排除扩展自身的页面
    if (urlObj.protocol === "chrome-extension:") {
      return "extension"
    }
    
    return urlObj.hostname
  } catch {
    return "unknown"
  }
}

// 初始化数据结构
function initDomain(domain: string) {
  // 排除扩展自身的页面
  if (domain === "extension") {
    return
  }
  
  if (!timeData[domain]) {
    timeData[domain] = {
      totalTime: 0,
      lastActive: Date.now(),
      focusTime: 0
    }
  }
}

// 监听标签页激活
if (chrome?.tabs) {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await loadData()

    // 如果之前有活跃标签页，计算停留时间
    if (currentTab) {
      const timeSpent = Date.now() - currentTab.activatedTime
      initDomain(currentTab.domain)
      timeData[currentTab.domain].totalTime += Math.floor(timeSpent / 1000) // 转换为秒
      saveData()
    }

    // 切换到新标签页
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab?.url) {
        const domain = extractDomain(tab.url)
        // 排除扩展自身的页面
        if (domain !== "extension") {
          currentTab = {
            tabId: activeInfo.tabId,
            domain,
            activatedTime: Date.now()
          }
          initDomain(domain)
          timeData[domain].lastActive = Date.now()
          saveData()
        } else {
          // 如果是扩展自身的页面，不跟踪
          currentTab = null
        }
      }
    })
  })

  // 监听标签页更新（用户在同一标签页切换网址）
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      const domain = extractDomain(tab.url)

      if (currentTab?.tabId === tabId && currentTab.domain !== domain) {
        // 用户在同一标签页导航到不同网站
        const timeSpent = Date.now() - currentTab.activatedTime
        // 只统计非扩展页面的时间
        if (currentTab.domain !== "extension") {
          initDomain(currentTab.domain)
          timeData[currentTab.domain].totalTime += Math.floor(timeSpent / 1000)
        }

        // 只跟踪非扩展页面
        if (domain !== "extension") {
          currentTab = {
            tabId,
            domain,
            activatedTime: Date.now()
          }
          initDomain(domain)
          saveData()
        } else {
          // 如果是扩展自身的页面，不跟踪
          currentTab = null
        }
      }
    }
  })

  // 监听标签页关闭
  chrome.tabs.onRemoved.addListener(async (tabId) => {
    await loadData()

    if (currentTab?.tabId === tabId && currentTab) {
      const timeSpent = Date.now() - currentTab.activatedTime
      // 只统计非扩展页面的时间
      if (currentTab.domain !== "extension") {
        initDomain(currentTab.domain)
        timeData[currentTab.domain].totalTime += Math.floor(timeSpent / 1000)
        saveData()
      }
      currentTab = null
    }
  })
}

// 处理消息（Popup可以请求数据）
if (chrome?.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTimeData") {
      if (chrome?.storage?.local) {
        chrome.storage.local.get(["webtimeData", "categories", "domainCategories"], (result) => {
          sendResponse({
            timeData: result?.webtimeData || {},
            categories: result?.categories || categories,
            domainCategories: result?.domainCategories || domainCategories
          })
        })
      } else {
        // 使用内存存储的数据
        sendResponse({
          timeData: inMemoryStorage.webtimeData || {},
          categories: inMemoryStorage.categories || categories,
          domainCategories: inMemoryStorage.domainCategories || domainCategories
        })
      }
      return true
    }
  })
}

// 初始化
loadData().catch(error => {
  console.error("Failed to initialize data:", error)
})

// 初始化
loadData()