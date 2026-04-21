import { useEffect, useState } from "react"
// 1. 导入 Chart.js 相关组件
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
// 2. 注册组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
// 定义数据类型
type SummaryCard = {
  title: string
  value: string
  subtitle: string
  btnText: string
  isPro?: boolean
}

type TopSite = {
  rank: number
  domain: string
  totalTime: string
  focusTime: string
  productivity: string | number
  isLocked: boolean
}

export default function Dashboard() {
  const [isPro, setIsPro] = useState(false)
  const [activeTab, setActiveTab] = useState("Dashboard")
  // ... 在组件内部添加搜索状态
  const [searchQuery, setSearchQuery] = useState("");

  // --- 柱状图数据配置 ---
  const barData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [40, 70, 45, 90, 65, 30, 50],
        // 通过回调函数实现：周四（索引3）为蓝色，其他为浅灰色
        backgroundColor: (context: any) => {
          const index = context.dataIndex;
          return index === 3 ? '#165DFF' : '#F1F5F9';
        },
        hoverBackgroundColor: (context: any) => {
          const index = context.dataIndex;
          return index === 3 ? '#144FE0' : '#E2E8F0';
        },
        borderRadius: 20, // 高度还原图片中的圆润感
        borderSkipped: false, // 确保四个角都是圆的
        barThickness: 32, // 控制柱子宽度
      },
    ],
  };

  // --- 柱状图样式配置 ---
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // 隐藏图例
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 12,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false }, // 隐藏网格线
        border: { display: false }, // 隐藏轴线
        ticks: {
          color: '#94A3B8',
          font: { size: 11, weight: '900' as const },
          padding: 10,
        }
      },
      y: {
        display: false, // 隐藏Y轴以保持极简视觉
        grid: { display: false },
      }
    },
    // 增加鼠标交互动画
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    }
  };
  // 模拟数据
  const summaryData: SummaryCard[] = [
    { title: "Total Time", value: "21h 30m", subtitle: "Total browsing time", btnText: "Export CSV" },
    // { title: "Focus Time", value: "10h 12m", subtitle: "Time spent focusing", btnText: "Export CSV" },
    { title: "Productivity Score", value: "80 High", subtitle: "Productive browsing percentage", btnText: "Export PRO", isPro: true },
  ]

  const topSites: TopSite[] = [
    { rank: 1, domain: "google.com", totalTime: "5h 32m", focusTime: "4h 20m", productivity: 91, isLocked: false },
    { rank: 2, domain: "youtube.com", totalTime: "4h 10m", focusTime: "31%", productivity: "Locked PRO", isLocked: true },
    { rank: 3, domain: "facebook.com", totalTime: "3h 14m", focusTime: "31%", productivity: "Locked PRO", isLocked: true },
    { rank: 4, domain: "news.com", totalTime: "2h 18m", focusTime: "—", productivity: "Locked PRO", isLocked: true },
    { rank: 5, domain: "reddit.com", totalTime: "1h 55m", focusTime: "—", productivity: "Locked PRO", isLocked: true },
  ]
  for (let i = 0; i < 100; i++) {
    topSites.push({ ...topSites[i % topSites.length], rank: i + 1 });
  }
  // 假设 topSites 是一个包含 100 条数据的数组
  const filteredSites = topSites.filter(site =>
    site.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="w-[98vw] min-h-screen bg-[#F0F2F5] p-0 flex items-center justify-center font-sans overflow-x-hidden">
      <div className="w-full h-full bg-[#F8FAFF]/80 backdrop-blur-xl rounded-[40px] shadow-[0_40px_100px_rgba(22,93,255,0.08)] flex flex-col border border-white/50">

        {/* Header Section */}
        <header className="px-10 py-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#165DFF] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white text-2xl font-bold">⏱</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">WebTime Tracker</h1>
          </div>

          <nav className="flex items-center gap-8">
            {['Dashboard', 'Reports', 'Settings', 'Upgrade'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold transition-all relative py-1 ${activeTab === tab ? 'text-[#165DFF]' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#165DFF] rounded-full" />}
              </button>
            ))}
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-4">
              <button className="bg-[#165DFF] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-100 hover:scale-105 transition">
                Upgrade
              </button>
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <img src="https://ui-avatars.com/api/?name=User&background=EEF2FF&color=165DFF" alt="avatar" />
              </div>
            </div>
          </nav>
        </header>

        {/* Main Dashboard Body */}
        <main className="flex-1 p-8 overflow-y-auto space-y-8">

          {/* Top Row: Summary Cards */}
          <div className="grid grid-cols-2 gap-6">
            {summaryData.map((card, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${idx === 2 ? 'bg-blue-50 text-blue-500' : 'bg-blue-50 text-blue-500'}`}>
                      {idx === 0 && '⏱'}
                      {idx === 1 && '🎯'}
                      {idx === 2 && '🛡'}
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                  </div>
                  <h2 className={`text-4xl font-extrabold ${idx === 2 ? 'text-emerald-500' : 'text-[#165DFF]'} tracking-tighter`}>
                    {card.value}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 font-medium">{card.subtitle}</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition border border-slate-100">
                  {card.isPro ? '🔒' : '📥'} {card.btnText}
                </button>
              </div>
            ))}
          </div>

          {/* Middle Row: Usage and Distribution */}
          <div className="grid grid-cols-3 gap-6">
            {/* Daily Usage Bar Chart */}
            {/* <div className="col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 flex flex-col relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Daily Usage</h3>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#165DFF] rounded-full" /> Browsing Time
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-50 text-[#165DFF] px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">🔒 CSV</button>
                  <button className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-lg text-xs font-bold border border-slate-100">🔒 PDF</button>
                </div>
              </div>

              <div className="absolute top-[35%] left-[45%] bg-white p-3 rounded-2xl shadow-xl border border-slate-100 z-10 scale-90">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tue April 23</p>
                <p className="text-xs font-extrabold text-[#165DFF]">Focus Time 1h 45m</p>
              </div>

              <div className="flex-1 flex items-end justify-between px-4 pb-2">
                {[
                  { d: 'Mon', h: 40 }, { d: 'Tue', h: 90, active: true }, { d: 'Wed', h: 50 },
                  { d: 'Thu', h: 65 }, { d: 'Fri', h: 55 }, { d: 'Sat', h: 60 }, { d: 'Sun', h: 35 }
                ].map(item => (
                  <div key={item.d} className="flex flex-col items-center gap-4 flex-1 group">
                    <div className={`w-10 rounded-2xl transition-all duration-300 ${item.active ? 'bg-[#165DFF] shadow-lg shadow-blue-100' : 'bg-blue-50 group-hover:bg-blue-100'}`} style={{ height: `${item.h * 1.8}px` }} />
                    <span className={`text-xs font-bold ${item.active ? 'text-[#165DFF]' : 'text-slate-400'}`}>{item.d}</span>
                  </div>
                ))}
              </div>
            </div> */}

            <section className="col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)]">
              <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-tight">Daily Usage</h3>
              <div className="h-[220px] w-full">
                <Bar data={barData} options={barOptions} />
              </div>
            </section>

            {/* Category Distribution Donut */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 flex flex-col items-center">
              <h3 className="w-full text-left text-lg font-bold text-slate-800 mb-8">Category Distribution</h3>
              <div className="relative w-48 h-48 mb-8">
                {/* Donut Implementation with CSS Conic Gradient */}
                <div className="w-full h-full rounded-full" style={{ background: 'conic-gradient(#165DFF 0 46%, #1EC18C 46% 78%, #FF8A3D 78% 100%)' }} />
                <div className="absolute inset-[18%] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Top Use</p>
                  <p className="text-xl font-black text-slate-800">Work</p>
                </div>
                {/* Labels on Chart */}
                <span className="absolute top-1/4 right-4 text-[11px] font-bold text-white">46%</span>
                <span className="absolute bottom-8 left-8 text-[11px] font-bold text-white">32%</span>
                <span className="absolute top-8 left-12 text-[11px] font-bold text-white">22%</span>
              </div>
              <div className="w-full space-y-4">
                {[
                  { label: "Work", color: "#165DFF", val: "9h 42m", p: 46 },
                  { label: "Entertainment", color: "#1EC18C", val: "6h 47m", p: 32 },
                  { label: "Social", color: "#FF8A3D", val: "5h 01m", p: 22 },
                ].map(cat => (
                  <div key={cat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-bold text-slate-500">{cat.label}</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-800">{cat.val} ({cat.p}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Table and Detailed List */}
          <div className="grid grid-cols-3 gap-6 pb-4">
            {/* Top Websites Table */}
            {/* <div className="col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Top Websites</h3>
                <div className="flex gap-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4">
                  <span>Time Spent</span>
                  <span>Productivity</span>
                </div>
              </div>
              <div className="space-y-3">
                {topSites.map((site) => (
                  <div key={site.domain} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${site.isLocked ? 'bg-slate-50/50 grayscale-[0.5]' : 'bg-blue-50/30 border border-blue-50/50'}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${site.isLocked ? 'bg-slate-100 text-slate-400' : 'bg-[#165DFF] text-white'}`}>
                        {site.rank}
                      </div>
                      <div className="w-32">
                        <p className="text-sm font-bold text-slate-800">{site.domain}</p>
                        <p className="text-[10px] font-bold text-[#165DFF]">{site.totalTime}</p>
                      </div>
                      {!site.isLocked && (
                        <div className="flex-1 max-w-[150px] h-1.5 bg-blue-100 rounded-full overflow-hidden ml-4">
                          <div className="h-full bg-[#165DFF] rounded-full w-[78%]" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-12 text-right">
                      <span className="text-xs font-bold text-slate-600 w-16">{site.isLocked ? '🔒 ' + site.focusTime : site.focusTime}</span>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-lg min-w-[90px] text-center ${site.isLocked ? 'bg-slate-200/50 text-slate-400' : 'bg-emerald-50 text-emerald-500'}`}>
                        {site.productivity === 91 ? '91%' : '🔒 Locked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            <section className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Top Sites</h3>

                {/* 搜索框：应对 100 条数据的利器 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* 滚动容器：设置固定高度 max-h */}
              <div className="overflow-y-auto max-h-[600px] pr-6 custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <th className="pb-4 border-b border-slate-50">Rank</th>
                      <th className="pb-4 border-b border-slate-50">Website</th>
                      <th className="pb-4 border-b border-slate-50 text-center">Total Time</th>
                      <th className="pb-4 border-b border-slate-50 text-right">Productivity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredSites.map((site) => (
                      <tr key={site.rank} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-4">
                          <span className="text-xs font-black text-slate-400">{site.rank}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {/* 可以加个 favicon 占位符 */}
                            <div className="w-6 h-6 bg-slate-100 rounded-lg" />
                            <span className="font-bold text-sm text-slate-700">{site.domain}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center text-xs font-bold text-slate-500">{site.totalTime}</td>
                        <td className="py-4 text-right">
                          <span className="text-xs font-black text-[#165DFF]">{site.productivity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 底部空状态反馈 */}
                {filteredSites.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 text-sm font-medium">No websites found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>

              {/* 底部页脚/统计 */}
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-300 uppercase">Showing {filteredSites.length} results</p>
                <button className="text-[10px] font-black text-[#165DFF] hover:underline">VIEW ALL INSIGHTS</button>
              </div>
            </section>

            {/* Category Secondary View */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Category</h3>
                <button className="text-[10px] font-bold bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1">🔒 Export PRO</button>
              </div>
              <div className="space-y-6">
                {[
                  { label: "Work", val: "9h 42m", p: 46, color: "#165DFF" },
                  { label: "Entertainment", val: "6h 47m", p: 32, color: "#1EC18C" },
                  { label: "Social", val: "5h 01m", p: 22, color: "#FF8A3D" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.val} ({item.p}%)</p>
                    </div>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full">
                      <div className="h-full rounded-full" style={{ backgroundColor: item.color, width: `${item.p}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}