import { useEffect, useState } from "react"
import "./settings.css"
type SettingsState = {
  isPro: boolean
  notificationsEnabled: boolean
  accountName: string
  version: string
}

type Category = {
  id: string
  name: string
  color: string
}

type DomainCategoryMap = {
  [domain: string]: string
}

const DEFAULT_STATE: SettingsState = {
  isPro: false,
  notificationsEnabled: true,
  accountName: "FREE USER",
  version: "2.1.3"
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "Work", color: "#165DFF" },
  { id: "entertainment", name: "Entertainment", color: "#1EC18C" },
  { id: "social", name: "Social", color: "#FF8A3D" },
  { id: "other", name: "Other", color: "#94A3B8" }
]

export default function Settings() {
  const [state, setState] = useState<SettingsState>(DEFAULT_STATE)
  const [statusMessage, setStatusMessage] = useState("")
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [domainCategories, setDomainCategories] = useState<DomainCategoryMap>({})
  const [timeData, setTimeData] = useState<{ [domain: string]: { totalTime: number } }>({})
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#165DFF")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // 从 Chrome 存储加载数据
  useEffect(() => {
    const storage = chrome?.storage?.local
    console.log("111111", chrome, chrome.storage)
    if (!storage) return
    storage.get(["settingsState", "categories", "domainCategories", "webtimeData"], (result) => {
      console.log("Loaded data:", result)
      if (result.settingsState) {
        setState(result.settingsState as SettingsState)
      } else {
        storage.set({ settingsState: DEFAULT_STATE })
      }
      if (result.categories) {
        setCategories(result.categories)
      }
      if (result.domainCategories) {
        setDomainCategories(result.domainCategories)
      }
      if (result.webtimeData) {
        setTimeData(result.webtimeData)
        console.log("Loaded webtimeData:", result.webtimeData)
      }
    })
  }, [])

  // 状态变更保存
  useEffect(() => {
    chrome?.storage?.local?.set({ settingsState: state })
  }, [state])

  // 分类变更保存
  useEffect(() => {
    chrome?.storage?.local?.set({ categories })
  }, [categories])

  // 域名分类映射变更保存
  useEffect(() => {
    chrome?.storage?.local?.set({ domainCategories })
  }, [domainCategories])

  const togglePro = () => {
    setState(prev => ({ ...prev, isPro: !prev.isPro }))
    setStatusMessage(state.isPro ? "Pro mode disabled." : "Pro mode enabled.")
    setTimeout(() => setStatusMessage(""), 2000)
  }

  const clearLocalData = () => {
    if (confirm("Are you sure you want to clear all local data?")) {
      chrome?.storage?.local?.clear(() => {
        setStatusMessage("Local data cleared.")
        setTimeout(() => setStatusMessage(""), 2000)
      })
    }
  }

  // 添加分类
  const addCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory: Category = {
      id: `category_${Date.now()}`,
      name: newCategoryName.trim(),
      color: newCategoryColor
    }
    
    setCategories(prev => [...prev, newCategory])
    setNewCategoryName("")
    setStatusMessage(`Category "${newCategory.name}" added.`)
    setTimeout(() => setStatusMessage(""), 2000)
  }

  // 编辑分类
  const startEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryColor(category.color)
  }

  const saveEditCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return
    
    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, name: newCategoryName.trim(), color: newCategoryColor }
        : cat
    ))
    
    setEditingCategory(null)
    setNewCategoryName("")
    setStatusMessage(`Category "${newCategoryName}" updated.`)
    setTimeout(() => setStatusMessage(""), 2000)
  }

  const cancelEditCategory = () => {
    setEditingCategory(null)
    setNewCategoryName("")
  }

  // 删除分类
  const deleteCategory = (categoryId: string) => {
    if (categoryId === "other") {
      setStatusMessage("Cannot delete 'Other' category.")
      setTimeout(() => setStatusMessage(""), 2000)
      return
    }
    
    if (confirm("Are you sure you want to delete this category? Websites in this category will be moved to 'Other'.")) {
      // 将该分类下的网站移至"other"分类
      setDomainCategories(prev => {
        const newDomainCategories = { ...prev }
        Object.keys(newDomainCategories).forEach(domain => {
          if (newDomainCategories[domain] === categoryId) {
            newDomainCategories[domain] = "other"
          }
        })
        return newDomainCategories
      })
      
      // 删除分类
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      setStatusMessage("Category deleted.")
      setTimeout(() => setStatusMessage(""), 2000)
    }
  }

  // 分配域名到分类
  const assignDomainToCategory = (domain: string, categoryId: string) => {
    setDomainCategories(prev => ({
      ...prev,
      [domain]: categoryId
    }))
    setStatusMessage(`Domain "${domain}" assigned to category.`)
    setTimeout(() => setStatusMessage(""), 2000)
  }

  return (
    <div className="settings-page-root min-h-screen bg-[#F8FAFC] p-4 sm:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[800px] space-y-6">
        
        {/* Header Section */}
        <header className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#165DFF] rounded-full flex items-center justify-center text-white font-bold italic shadow-lg shadow-blue-200">
            E
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-slate-800">Extension Settings</h1>
        </header>

        {/* Account Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Account</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-700 tracking-wider">{state.accountName}</span>
          </div>
          <button 
            onClick={togglePro}
            className="w-full bg-[#165DFF] hover:bg-[#144fe0] text-white py-3.5 rounded-xl font-bold text-sm tracking-widest transition shadow-md shadow-blue-100"
          >
            {state.isPro ? "PRO ACTIVE" : "UPGRADE TO PRO"}
          </button>
        </section>

        {/* Category Management Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Category Management</h2>
          
          {/* Add/Edit Category Form */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <h3 className="text-sm font-bold mb-3">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#165DFF]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer"
                />
                {editingCategory ? (
                  <div className="flex gap-2">
                    <button
                      onClick={saveEditCategory}
                      className="px-4 py-2 bg-[#165DFF] text-white rounded-lg text-sm font-bold hover:bg-[#144fe0]"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditCategory}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-[#165DFF] text-white rounded-lg text-sm font-bold hover:bg-[#144fe0]"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Categories List */}
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3">Existing Categories</h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="px-3 py-1 border border-red-300 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Domain Category Assignment */}
          <div>
            <h3 className="text-sm font-bold mb-3">Domain Category Assignment</h3>
            {Object.keys(timeData).length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.keys(timeData).map((domain) => (
                  <div key={domain} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <span className="text-sm font-medium">{domain}</span>
                    <select
                      value={domainCategories[domain] || "other"}
                      onChange={(e) => assignDomainToCategory(domain, e.target.value)}
                      className="px-3 py-1 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#165DFF]"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No websites tracked yet.</p>
            )}
          </div>
        </section>

        {/* Data Management Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Data Management</h2>
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <span className="text-[10px] text-slate-500">🔒 Pro Only</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <button 
                onClick={clearLocalData}
                className="flex items-center gap-2 border border-[#165DFF] text-[#165DFF] px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-50 transition"
              >
                CLEAR LOCAL DATA <span className="text-base">🗑️</span>
              </button>
              <p className="text-xs text-slate-500 leading-relaxed">
                Remove all temporary files, cache, and extension data stored locally.
              </p>
            </div>

            <div className="space-y-3 opacity-40">
              <button disabled className="bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed">
                BACKUP & RESTORE
              </button>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatic or manual backups to the cloud (Pro Feature).
              </p>
            </div>
          </div>
        </section>

        {/* Notifications Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Notifications & Alerts</h2>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setState(p => ({ ...p, notificationsEnabled: !p.notificationsEnabled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${state.notificationsEnabled ? 'bg-[#165DFF]' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${state.notificationsEnabled ? 'translate-x-6' : ''}`} />
                </button>
                <span className="text-xs font-bold uppercase tracking-tighter">Usage Alert</span>
              </div>
              <p className="text-xs text-slate-500">Get a notification when you reach your daily usage limit.</p>
            </div>
          </div>
        </section>

        {/* Privacy Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-2">Privacy & Data Storage</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Your data is stored locally on your device within the browser extension's secure data directory. We do not collect personal information or transmit data to external servers.
          </p>
          <button className="text-[#165DFF] text-xs font-bold hover:underline">
            [View Privacy Policy Link]
          </button>
        </section>

        {/* About Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-2">About</h2>
          <div className="space-y-1 mb-4">
            <p className="text-xs text-slate-800 font-bold uppercase">Version {state.version}</p>
            <p className="text-xs text-slate-400">Developed by [Fictional Company]</p>
          </div>
          <button className="text-[#165DFF] text-xs font-bold flex items-center gap-1 hover:underline">
            [Help & Get Support] <span className="text-[10px]">↗</span>
          </button>
        </section>

        {/* Status Toast */}
        {statusMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#165DFF] text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-bounce">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  )
}