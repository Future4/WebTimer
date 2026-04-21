import { useEffect, useMemo, useState } from "react"

type BlockItem = {
  id: string
  site: string
  limit: string
  locked: boolean
}

type WebsiteBlockerState = {
  isPro: boolean
  activeTab: "Blacklist" | "Whitelist" | "Schedule"
  search: string
  newSite: string
  items: BlockItem[]
}

const DEFAULT_STATE: WebsiteBlockerState = {
  isPro: false,
  activeTab: "Blacklist",
  search: "",
  newSite: "",
  items: [
    { id: "1", site: "youtube.com", limit: "30 min", locked: false },
    { id: "2", site: "tiktok.com", limit: "30 min", locked: false },
    { id: "3", site: "twitter.com", limit: "10 min", locked: true },
    { id: "4", site: "reddit.com", limit: "30 min", locked: true },
    { id: "5", site: "instagram.com", limit: "10 min", locked: true },
    { id: "6", site: "ligex.com", limit: "10 min", locked: true }
  ]
}

const LIMIT_OPTIONS = ["10 min", "20 min", "30 min", "1 hr"]

export default function WebsiteBlocker() {
  const [state, setState] = useState<WebsiteBlockerState>(DEFAULT_STATE)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    const storage = chrome?.storage?.local
    if (!storage) {
      return
    }
    storage.get(["websiteBlockerState"], (result) => {
      if (result.websiteBlockerState) {
        setState(result.websiteBlockerState as WebsiteBlockerState)
      } else {
        storage.set({ websiteBlockerState: DEFAULT_STATE })
      }
    })
  }, [])

  useEffect(() => {
    const storage = chrome?.storage?.local
    if (!storage) {
      return
    }
    storage.set({ websiteBlockerState: state })
  }, [state])

  const filteredItems = useMemo(() => {
    const query = state.search.toLowerCase()
    return state.items.filter((item) => item.site.toLowerCase().includes(query))
  }, [state.search, state.items])

  const addSite = () => {
    const site = state.newSite.trim()
    if (!site) {
      return
    }
    const newItem: BlockItem = {
      id: `${Date.now()}`,
      site,
      limit: "30 min",
      locked: !state.isPro
    }
    setState((prev) => ({ ...prev, newSite: "", items: [newItem, ...prev.items] }))
    setStatusMessage("Website added to the list.")
    window.setTimeout(() => setStatusMessage(""), 2500)
  }

  const updateLimit = (id: string, limit: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, limit } : item))
    }))
  }

  const deleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id)
    }))
  }

  const togglePro = () => {
    setState((prev) => ({ ...prev, isPro: !prev.isPro }))
    setStatusMessage(state.isPro ? "Switched to Free mode." : "Pro enabled. Schedule blocking unlocked.")
    window.setTimeout(() => setStatusMessage(""), 2500)
  }

  const canChangeSchedule = state.isPro

  return (
    <div className="min-h-screen bg-[#F4F7FF] p-6 text-slate-900">
      <div className="mx-auto max-w-[960px] rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(22,93,255,0.12)]">
        <div className="mb-4 flex items-center justify-between rounded-[24px] bg-[#165DFF] px-5 py-4 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white text-[#165DFF]">🔒</div>
            <div>
              <p className="text-sm font-semibold">WebTime Tracker</p>
              <p className="text-xs text-white/80">PRO</p>
            </div>
          </div>
          <button
            onClick={togglePro}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#165DFF] shadow-sm transition hover:bg-slate-100"
          >
            {state.isPro ? "Pro Active" : "Activate Pro"}
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[24px] bg-[#F4F7FF] px-4 py-3">
          {(["Blacklist", "Whitelist", "Schedule"] as const).map((tab) => (
            <button
              key={tab}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${state.activeTab === tab ? "bg-white text-[#165DFF] shadow-sm" : "text-slate-500 hover:text-[#165DFF]"}`}
              onClick={() => setState((prev) => ({ ...prev, activeTab: tab }))}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              value={state.search}
              onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#165DFF]"
              placeholder="Search"
            />
          </div>
          <div className="flex-1">
            <div className="flex gap-3 rounded-3xl bg-[#165DFF] p-2 shadow-sm">
              <input
                value={state.newSite}
                onChange={(e) => setState((prev) => ({ ...prev, newSite: e.target.value }))}
                className="w-full rounded-3xl border border-transparent bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                placeholder="example.com"
              />
              <button
                onClick={addSite}
                className="rounded-3xl bg-[#0D4ED8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0B43C4]"
              >
                Add to list
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#F9FAFB] shadow-sm">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-500">
            <span>Site</span>
            <span>Daily Limit</span>
            <span>Actions</span>
          </div>
          <div className="space-y-2 px-5 py-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                    {item.site[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.site}</span>
                </div>
                <div>
                  <select
                    value={item.limit}
                    onChange={(e) => updateLimit(item.id, e.target.value)}
                    disabled={!state.isPro && item.locked}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#165DFF] disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    {LIMIT_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-red-300 hover:text-red-600"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[28px] bg-[#F4F7FF] px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Schedule blocking</p>
              <p className="text-xs text-slate-500">Set time-based blocking rules for your list.</p>
            </div>
            <button
              onClick={() => {
                if (!canChangeSchedule) {
                  setStatusMessage("Schedule blocking is a Pro feature.")
                  window.setTimeout(() => setStatusMessage(""), 2500)
                }
              }}
              className="rounded-full bg-[#165DFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#144fe0]"
            >
              {state.isPro ? "Edit schedule" : "Locked PRO"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Free version includes basic blocking. Unlock schedule blocking, limits, and advanced site filters with Pro.
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-[24px] bg-[#165DFF]/10 px-4 py-3 text-sm text-[#165DFF]">{statusMessage}</div>
        ) : null}
      </div>
    </div>
  )
}
