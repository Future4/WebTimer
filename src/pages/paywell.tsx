import { useEffect, useState } from "react"

type PaywellState = {
  isPro: boolean
  selectedPlan: "monthly" | "yearly" | "lifetime" | null
}

const DEFAULT_STATE: PaywellState = {
  isPro: false,
  selectedPlan: null
}

const PLANS = [
  {
    key: "monthly",
    title: "MONTHLY",
    price: "$4.99",
    subtitle: "MOST FLEXIBLE",
    perks: ["Advanced Focus Tools", "Full Block Control", "Multi-Device Sync"]
  },
  {
    key: "yearly",
    title: "YEARLY",
    price: "$29.99",
    subtitle: "BEST VALUE",
    badge: "Save 50%",
    perks: ["Advanced Focus Tools", "Full Block Control", "Multi-Device Sync", "Export & Reporting"]
  },
  {
    key: "lifetime",
    title: "LIFETIME",
    price: "$19.99",
    subtitle: "LIMITED-TIME OFFER",
    perks: ["Advanced Focus Tools", "Full Block Control", "Multi-Device Sync"]
  }
]

const FEATURE_ROWS = [
  { name: "Unlimited Focus Sessions", free: "✕", pro: "✓" },
  { name: "Website Blocker", free: "Basic", pro: "Advanced, unlimited" },
  { name: "Cloud Sync across devices", free: "✕", pro: "✓" },
  { name: "Data Export & Reporting", free: "Limited", pro: "Detailed, export" }
]

export default function Paywell() {
  const [state, setState] = useState<PaywellState>(DEFAULT_STATE)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    const storage = chrome?.storage?.local
    if (!storage) {
      return
    }
    storage.get(["paywellState"], (result) => {
      if (result.paywellState) {
        setState(result.paywellState as PaywellState)
      } else {
        storage.set({ paywellState: DEFAULT_STATE })
      }
    })
  }, [])

  useEffect(() => {
    const storage = chrome?.storage?.local
    if (!storage) {
      return
    }
    storage.set({ paywellState: state })
  }, [state])

  const selectPlan = (plan: PaywellState["selectedPlan"]) => {
    setState((prev) => ({ ...prev, selectedPlan: plan }))
    setStatusMessage(`Selected ${plan ? plan : "no"} plan.`)
    window.setTimeout(() => setStatusMessage(""), 2400)
  }

  const togglePro = () => {
    setState((prev) => ({ ...prev, isPro: !prev.isPro }))
    setStatusMessage(state.isPro ? "Switched to Free mode." : "Pro mode activated.")
    window.setTimeout(() => setStatusMessage(""), 2400)
  }

  return (
    <div className="min-h-screen bg-[#F4F7FF] px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-[1024px] space-y-8">
        <div className="rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(22,93,255,0.12)]">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Unlock Full Pro Features.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div key={plan.key} className="rounded-[28px] border border-slate-200 bg-[#F8FAFD] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#E8EEFF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#165DFF]">
                    {plan.subtitle}
                  </span>
                  {plan.badge ? (
                    <span className="rounded-full bg-[#165DFF] px-2.5 py-1 text-xs font-semibold text-white">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <div className="mt-6">
                  <p className="text-5xl font-semibold text-slate-900">{plan.price}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-500">{plan.title}</p>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-3">
                      <span className="text-[#165DFF]">•</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => selectPlan(plan.key as PaywellState["selectedPlan"])}
                  className={`mt-8 w-full rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                    state.selectedPlan === plan.key
                      ? "bg-[#165DFF] text-white"
                      : "bg-white text-[#165DFF] hover:bg-[#E8EEFF]"
                  } border border-[#D1D5DB]`}
                >
                  {state.selectedPlan === plan.key ? "Selected" : "Choose"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Feature Comparison</p>
            </div>
            <button
              onClick={togglePro}
              className="rounded-full bg-[#165DFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#144fe0]"
            >
              {state.isPro ? "Pro Active" : "Activate Pro"}
            </button>
          </div>
          <div className="overflow-hidden rounded-[32px] border border-slate-200">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-0 bg-slate-100 px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center">Pro</div>
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {FEATURE_ROWS.map((row) => (
                <div key={row.name} className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-0 px-5 py-4 text-sm text-slate-600">
                  <div>{row.name}</div>
                  <div className="text-center">{row.free}</div>
                  <div className="text-center text-slate-900">{row.pro}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Ready to upgrade?</p>
              <p className="mt-2 text-sm text-slate-500">
                {state.isPro
                  ? "You are using Pro. Enjoy advanced tools and unlimited blocking."
                  : "Upgrade now to unlock the full WebTime Pro experience."}
              </p>
            </div>
            <button
              onClick={togglePro}
              className="rounded-[20px] bg-[#165DFF] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#144fe0]"
            >
              {state.isPro ? "Pro Activated" : "Upgrade Now"}
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-[#F8FAFD] p-5">
              <p className="text-sm font-semibold text-slate-900">30-Day Money-Back Guarantee</p>
              <p className="mt-2 text-sm text-slate-500">If you are not satisfied, request a refund within 30 days.</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-[#F8FAFD] p-5">
              <p className="text-sm font-semibold text-slate-900">Secure Payment</p>
              <p className="mt-2 text-sm text-slate-500">Pay with all major cards & PayPal via a secure checkout process.</p>
            </div>
          </div>
        </div>

        {statusMessage ? (
          <div className="rounded-[28px] bg-[#165DFF]/10 px-5 py-4 text-sm text-[#165DFF] shadow-sm">
            {statusMessage}
          </div>
        ) : null}
      </div>
    </div>
  )
}
