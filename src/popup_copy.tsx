import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import "./popup.css"

ChartJS.register(ArcElement, Tooltip, Legend);

type DistributionItem = {
  label: string
  duration: string
  percent: number
  color: string
}

type TopSiteItem = {
  domain: string
  time: string
  percent: number // 用于进度条宽度
  iconUrl: string
}

type PopupData = {
  totalTime: string
  distribution: DistributionItem[]
  topSites: TopSiteItem[]
  focusEnabled: boolean
}

const defaultData: PopupData = {
  totalTime: "3h 42m",
  distribution: [
    { label: "Work", duration: "1h 40m (45%)", percent: 45, color: "#165DFF" },
    { label: "Entertainment", duration: "1h 06m (30%)", percent: 30, color: "#1EC18C" },
    { label: "Social", duration: "56m (25%)", percent: 25, color: "#FF8A3D" }
  ],
  topSites: [
    { domain: "google.com", time: "1h 12m", percent: 70, iconUrl: "https://www.google.com/favicon.ico" },
    { domain: "youtube.com", time: "45m", percent: 45, iconUrl: "https://www.youtube.com/favicon.ico" },
    { domain: "facebook.com", time: "32m", percent: 30, iconUrl: "https://www.facebook.com/favicon.ico" }
  ],
  focusEnabled: true
}
import Dashboard from "./pages/dashboard"
// import PopupCopy from "./popup_copy"
// const Dashboard = () => (
//   <div className="min-h-screen bg-slate-50 p-6">
//     <h1 className="text-2xl font-bold">Dashboard</h1>
//     <p>Full dashboard content here.</p>
//   </div>
// )
import Settings from "./pages/settings"
// const Settings = () => (
//   <div className="min-h-screen bg-slate-50 p-6">
//     <h1 className="text-2xl font-bold">Settings</h1>
//     <p>Settings content here.</p>
//   </div>
// )

export default function Popup() {
  const [data, setData] = useState<PopupData>(defaultData)
  const [activePage, setActivePage] = useState('popup')

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash === 'dashboard' || hash === 'settings') {
      setActivePage(hash)
    } else {
      setActivePage('popup')
    }
  }, [])

  useEffect(() => {
    // 模拟从 chrome.storage 获取数据
    const storage = typeof chrome !== 'undefined' ? chrome.storage?.local : null;
    storage?.get(["webtimeData"], (result) => {
      if (result?.webtimeData) setData(result.webtimeData);
    });
  }, [])

  const toggleFocus = () => {
    setData(prev => ({ ...prev, focusEnabled: !prev.focusEnabled }));
  }

  const handleDashboardClick = () => {
    chrome.tabs.create(
      // { url: chrome.runtime.getURL("popup.html") + "#popup_copy" },
      { url: chrome.runtime.getURL("popup.html") + "#dashboard" },
      (tab) => {
        if (tab.windowId !== undefined) {
          chrome.windows.update(tab.windowId);
        }
      }
    );
  }

  const handleSettingsClick = () => {
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html') + '#settings',
      type: 'popup',
      width: 800,
      height: 700
    });
  }
  // 准备图表数据
  const chartData = {
    labels: data.distribution.map(item => item.label),
    datasets: [
      {
        data: data.distribution.map(item => item.percent),
        backgroundColor: data.distribution.map(item => item.color),
        borderWidth: 1, // Removes white borders for a cleaner look
        hoverOffset: 0,
      },
    ],
  };
  // 图表配置选项
  const chartOptions = {
    plugins: {
      legend: {
        display: false, // 我们在下面使用自定义标签，因此隐藏了默认的图例
      },
      tooltip: {
        enabled: false,
        // callbacks: {
        //   label: (context: any) => ` ${context.label}: ${context.raw}%`,
        // },
      },
    },
    maintainAspectRatio: true, // 允许我们通过Tailwind内容控制尺寸
    cutout: '70%', // 这将饼图转换为设计中的甜甜圈图
  };
  if (activePage === 'dashboard') return <Dashboard />
  // if (activePage === 'popup_copy') return <PopupCopy />

  if (activePage === 'settings') return <Settings />

  return (
    <div className="popup-container w-[410px] h-[660px] bg-white flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#165DFF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" />
              <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">WebTime</h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Tracker & Focus Guard</p>
          </div>
        </div>
        <div className="bg-[#165DFF] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold shadow-sm">
          <span>★</span> PRO
        </div>
      </header>

      {/* Main Content Scrollable Area */}
      <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Total Time Section */}
        <section className="text-center py-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">Today's Total Time</p>
          <h2 className="text-[52px] font-extrabold text-[#165DFF] leading-none tracking-tight">
            {data.totalTime}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-medium">Total browsing time</p>
        </section>

        {/* Time Distribution Card */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Time Distribution</h2>
            <span className="text-[10px] font-bold text-[#165DFF] bg-blue-50 px-2 py-1 rounded-md">TODAY</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Chart Container */}
            <div className="relative w-32 h-32">
              <Pie data={chartData} options={chartOptions} />
              {/* Center Text for Donut Style */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Total</span>
                <span className="text-sm font-black text-slate-800">{data.totalTime}</span>
              </div>
            </div>

            {/* Custom Legend Labels */}
            <div className="flex-1 space-y-2" >
              {data.distribution.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* 小圆点颜色标识 */}
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {/* Label 名称：使用 Times New Roman，不加粗 */}
                    <span 
                      className="text-[11px] text-slate-900 " 
                      
                    >
                      {item.label}
                    </span>
                  </div>
                  {/* 时间和百分比：使用 Times New Roman，灰色，不加粗 */}
                  <span 
                    className="text-[10px] text-slate-400" 
                  >
                    {item.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Websites Card */}
        <section className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
          <h3 className="text-xs font-bold mb-4">Top Websites</h3>
          <div className="space-y-5">
            {data.topSites.map((site) => (
              <div key={site.domain} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={site.iconUrl} className="w-5 h-5 rounded" alt="" />
                    <span className="text-xs font-bold text-slate-800">{site.domain}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">{site.time}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#165DFF] rounded-full"
                    style={{ width: `${site.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Focus Mode Button */}
        {/* <button 
          onClick={toggleFocus}
          className="w-full bg-[#165DFF] rounded-[22px] p-4 flex items-center justify-between shadow-lg shadow-blue-100 transition-transform active:scale-95"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 border-2 border-white/30 rounded-full flex items-center justify-center">
               <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                 <div className="w-1 h-1 bg-white rounded-full" />
               </div>
            </div>
            <div>
              <p className="text-white text-sm font-bold">Focus Mode</p>
              <p className="text-white/70 text-[10px]">Block distracting websites and stay focused</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${data.focusEnabled ? 'bg-white' : 'bg-white/30'}`}>
            <div className={`w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${data.focusEnabled ? 'translate-x-6 bg-[#165DFF]' : 'translate-x-0 bg-white'}`} />
          </div>
        </button> */}
      </main>

      {/* Footer Navigation */}
      <nav className="p-4 flex gap-3 bg-slate-50/50">
        <button
          onClick={handleDashboardClick}
          className="flex-1 min-w-0 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#D2D5DB] text-xs font-bold transition-all text-[#165DFF] hover:bg-slate-100 "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20V14" /></svg>
          Dashboard
        </button>
        {/* <button 
          onClick={handleSettingsClick}
          className="flex-1 min-w-0 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all text-slate-400 hover:bg-slate-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          Settings
        </button> */}
      </nav>
    </div>
  )
}