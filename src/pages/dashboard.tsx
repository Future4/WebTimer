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
import { Bar, Pie } from 'react-chartjs-2';
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
  btnText?: string
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

type Category = {
  id: string
  name: string
  color: string
}

export default function Dashboard() {
  const [isPro, setIsPro] = useState(false)
  const [activeTab, setActiveTab] = useState("Dashboard")
  // ... 在组件内部添加搜索状态
  const [searchQuery, setSearchQuery] = useState("");
  // 添加状态来存储从background.ts获取的数据
  const [timeData, setTimeData] = useState<{ [domain: string]: { totalTime: number } }>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [domainCategories, setDomainCategories] = useState<{ [domain: string]: string }>({})
  const [dailyUsageData, setDailyUsageData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [totalTime, setTotalTime] = useState(0)

  // 时间格式化辅助函数 - 精确到秒
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    } else if (m > 0) {
      return `${m}m ${s}s`;
    } else {
      return `${s}s`;
    }
  };

  // 从background.ts获取数据
  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        const response = await new Promise((resolve) => {
          try {
            if (!chrome?.runtime?.sendMessage) {
              console.warn("chrome.runtime.sendMessage is not available")
              resolve({ timeData: {}, categories: [], domainCategories: {} })
              return
            }

            chrome.runtime.sendMessage(
              { action: "getTimeData" },
              (response) => {
                resolve(response || { timeData: {}, categories: [], domainCategories: {} })
              }
            )
          } catch (error) {
            console.error("Error sending message:", error)
            resolve({ timeData: {}, categories: [], domainCategories: {} })
          }
        }) as { timeData: Record<string, { totalTime: number }>, categories: Category[], domainCategories: { [domain: string]: string } }

        const { timeData, categories, domainCategories } = response
        setTimeData(timeData)
        setCategories(categories)
        setDomainCategories(domainCategories)

        // 计算总时间
        const totalSeconds = Object.values(timeData).reduce((sum, data) => sum + data?.totalTime, 0)
        setTotalTime(totalSeconds)

        // 生成模拟的每日数据（实际应用中应该从存储中获取每日数据）
        const today = new Date()
        const dailyData = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          // 这里使用随机数据作为示例，实际应该从存储中获取对应日期的数据
          const dayData = Math.floor(Math.random() * 100)
          dailyData.push(dayData)
        }
        setDailyUsageData(dailyData)
      } catch (error) {
        console.error("Error fetching time data:", error)
      }
    }

    fetchTimeData()
    // 每30秒刷新一次数据
    const interval = setInterval(fetchTimeData, 30000)
    return () => clearInterval(interval)
  }, [])

  // --- 柱状图数据配置 ---
  const barData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: dailyUsageData,
        // 通过回调函数实现：今天为蓝色，其他为浅灰色
        backgroundColor: (context: any) => {
          const index = context.dataIndex;
          return index === 6 ? '#165DFF' : '#F1F5F9'; // 假设索引6是今天
        },
        hoverBackgroundColor: (context: any) => {
          const index = context.dataIndex;
          return index === 6 ? '#144FE0' : '#E2E8F0';
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
  // 分类权重配置
  const categoryWeights = {
    work: 1.0,
    entertainment: 0.3,
    social: 0.6,
    other: 0.5
  };

  // 计算生产力分数
  const calculateProductivityScore = () => {
    // 计算各分类的总时间
    const categoryTime: { [categoryId: string]: number } = {};
    let totalTime = 0;

    Object.entries(timeData).forEach(([domain, data]) => {
      const categoryId = domainCategories[domain] || "other";
      if (!categoryTime[categoryId]) {
        categoryTime[categoryId] = 0;
      }
      categoryTime[categoryId] += data.totalTime;
      totalTime += data.totalTime;
    });

    // 计算生产力分数
    let productivityScore = 0;
    Object.entries(categoryTime).forEach(([categoryId, time]) => {
      const weight = categoryWeights[categoryId as keyof typeof categoryWeights] || 0.5;
      const timeRatio = totalTime > 0 ? time / totalTime : 0;
      productivityScore += weight * timeRatio;
    });

    // 转换为百分比
    productivityScore = Math.round(productivityScore * 100);

    // 确定分数等级
    let scoreLevel = "Low";
    if (productivityScore >= 80) {
      scoreLevel = "High";
    } else if (productivityScore >= 60) {
      scoreLevel = "Medium";
    }

    return {
      score: productivityScore,
      level: scoreLevel
    };
  };

  // 计算生产力分数
  const productivity = calculateProductivityScore();

  // 生成汇总数据
  const summaryData: SummaryCard[] = [
    { title: "Total Time", value: formatTime(totalTime), subtitle: "Total browsing time", btnText: "Export CSV" },
    // { title: "Focus Time", value: "10h 12m", subtitle: "Time spent focusing", btnText: "Export CSV" },
    { title: "Productivity Score", value: `${productivity.score} ${productivity.level}`, subtitle: "Productive browsing percentage", btnText: "Export PRO", isPro: true },
  ]

  // 从timeData生成topSites数据
  const topSites: any[] = Object.entries(timeData)
    .map(([domain, data]) => {
      // 获取网站的分类
      const categoryId = domainCategories[domain] || "other"
      // 根据分类计算生产力分数
      const weight = categoryWeights[categoryId as keyof typeof categoryWeights] || 0.5
      const productivityScore = Math.round(weight * 100)
      
      return {
        rank: 0, // 稍后会重新计算排名
        domain,
        totalTime: formatTime(data.totalTime),
        focusTime: "4h 20m", // 这里可以从数据中获取focusTime
        productivity: productivityScore, // 使用计算出的生产力分数
        isLocked: false,
        actualTime: data.totalTime // 存储实际的总时间值用于排序
      }
    })
    .sort((a, b) => {
      // 按实际总时间值排序，时间越长排名越高
      return b.actualTime - a.actualTime
    })
    .map((site, index) => ({
      ...site,
      rank: index + 1 // 重新计算排名
    }))
    .slice(0, 100); // 限制为100个网站

  // 过滤网站
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
            {/* {['Dashboard', 'Reports', 'Settings', 'Upgrade'].map((tab) => ( */}
            {['Settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  chrome.tabs.create(
                    { url: chrome.runtime.getURL("popup.html") + "#settings" },
                    (tab) => {
                      if (tab.windowId !== undefined) {
                        chrome.windows.update(tab.windowId);
                      }
                    }
                  );
                }}
                className={`text-sm font-bold transition-all relative py-1 ${activeTab === tab ? 'text-[#165DFF]' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#165DFF] rounded-full" />}
              </button>
            ))}
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-4">
              {/* <button className="bg-[#165DFF] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-100 hover:scale-105 transition">
                Upgrade
              </button> */}
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                      {idx === 1 && (
                        <div className="relative group">
                          <span className="text-slate-400 hover:text-slate-600 cursor-help">ℹ️</span>
                          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 text-white p-3 rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <p className="font-bold mb-1">Productivity Score</p>
                            <p>衡量您的浏览时间生产力的指标，基于不同分类网站的权重计算。</p>
                            <p className="mt-2">工作类网站权重最高(1.0)，娱乐类网站权重最低(0.3)。</p>
                            <p className="mt-1">分数越高，表示您的网络使用越具生产力。</p>
                          </div>
                        </div>
                      )}
                    </div>
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
                {(() => {
                  // 生成过去7天的日期标签和日期对象
                  const labels = []
                  const dates = []
                  const today = new Date()

                  // 重置时间为当天开始
                  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)

                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(todayStart)
                    date.setDate(date.getDate() - i)
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                    labels.push(dayName)
                    dates.push(date)
                  }

                  // 计算每天的使用时间（分钟）
                  const dailyData = dates.map((date, index) => {
                    // 计算当天开始和结束时间戳
                    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime()
                    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime()

                    // 计算当天的总使用时间
                    let dayTotal = 0

                    Object.entries(timeData).forEach(([domain, data]) => {
                      // 这里简化处理，实际应该根据每个网站的lastActive时间来判断是否属于当天
                      // 目前我们假设所有时间数据都属于当天
                      // 实际应用中，需要在background.ts中存储每个网站的每日使用时间
                      if (index === 6) { // 今天
                        dayTotal += data.totalTime
                      }
                    })

                    // 转换为分钟
                    return Math.floor(dayTotal / 60)
                  })

                  // 柱状图数据
                  const barData = {
                    labels: labels,
                    datasets: [
                      {
                        data: dailyData,
                        // 通过回调函数实现：今天为蓝色，其他为浅灰色
                        backgroundColor: (context: any) => {
                          const index = context.dataIndex;
                          return index === 6 ? '#165DFF' : '#F1F5F9'; // 索引6是今天
                        },
                        hoverBackgroundColor: (context: any) => {
                          const index = context.dataIndex;
                          return index === 6 ? '#144FE0' : '#E2E8F0';
                        },
                        borderRadius: 20, // 高度还原图片中的圆润感
                        borderSkipped: false, // 确保四个角都是圆的
                        barThickness: 32, // 控制柱子宽度
                      },
                    ],
                  };

                  // 柱状图配置
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
                        callbacks: {
                          label: (context: any) => {
                            const value = context.raw
                            // 转换为小时和分钟
                            const hours = Math.floor(value / 60)
                            const minutes = value % 60
                            return `Usage: ${hours}h ${minutes}m`
                          }
                        }
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

                  return <Bar data={barData} options={barOptions} />
                })()}
              </div>
            </section>

            {/* Category Distribution Donut */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 flex flex-col items-center">
              <h3 className="w-full text-left text-lg font-bold text-slate-800 mb-8">Category Distribution</h3>
              <div className="relative w-48 h-48 mb-8">
                {/* 使用Chart.js Pie组件 */}
                {(() => {
                  // 计算各分类的时间
                  const categoryTime: { [categoryId: string]: number } = {}

                  // 初始化各分类时间为0
                  categories.forEach(category => {
                    categoryTime[category.id] = 0
                  })

                  // 遍历所有域名，按分类累加时间
                  Object.entries(timeData).forEach(([domain, data]) => {
                    const categoryId = domainCategories[domain] || "other"
                    categoryTime[categoryId] += data?.totalTime || 0
                  })

                  // 生成饼图数据
                  const pieData = {
                    labels: categories.map(cat => cat.name),
                    datasets: [
                      {
                        data: categories.map(cat => categoryTime[cat.id] || 0),
                        backgroundColor: categories.map(cat => cat.color),
                        borderWidth: 0,
                        hoverOffset: 0
                      }
                    ]
                  }

                  // 时间格式化函数
                  const formatTooltipTime = (seconds: number): string => {
                    const h = Math.floor(seconds / 3600);
                    const m = Math.floor((seconds % 3600) / 60);
                    const s = Math.floor(seconds % 60);

                    if (h > 0) {
                      return `${h}h ${m}m ${s}s`;
                    } else if (m > 0) {
                      return `${m}m ${s}s`;
                    } else {
                      return `${s}s`;
                    }
                  };

                  // 饼图配置
                  const pieOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        enabled: true,
                        backgroundColor: '#1E293B',
                        padding: 12,
                        titleFont: { size: 12, weight: 'bold' as const },
                        bodyFont: { size: 12 },
                        cornerRadius: 12,
                        callbacks: {
                          label: (context: any) => {
                            const categoryIndex = context.dataIndex;
                            const category = categories[categoryIndex];
                            const time = categoryTime[category.id] || 0;
                            const total = Object.values(categoryTime).reduce((sum, t) => sum + t, 0);
                            const percent = total > 0 ? Math.round((time / total) * 100) : 0;
                            return `${category.name}: ${formatTooltipTime(time)} (${percent}%)`;
                          }
                        }
                      }
                    },
                    cutout: '70%' // 甜甜圈图
                  }

                  return (
                    <Pie data={pieData} options={pieOptions} />
                  )
                })()}
                {/* 中心文本 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[12px] font-bold text-slate-300 uppercase">Top Use</p>
                  <p className="text-[14px] text-xl font-black text-slate-800">
                    {(() => {
                      // 找出使用时间最多的分类
                      const categoryTime: { [categoryId: string]: number } = {}

                      categories.forEach(category => {
                        categoryTime[category.id] = 0
                      })

                      Object.entries(timeData).forEach(([domain, data]) => {
                        const categoryId = domainCategories[domain] || "other"
                        categoryTime[categoryId] += data?.totalTime || 0
                      })

                      let maxTime = 0
                      let topCategory = "Other"

                      Object.entries(categoryTime).forEach(([categoryId, time]) => {
                        if (time > maxTime) {
                          maxTime = time
                          const category = categories.find(cat => cat.id === categoryId)
                          if (category) {
                            topCategory = category.name
                          }
                        }
                      })

                      return topCategory
                    })()}
                  </p>
                </div>
              </div>
              <div className="w-full space-y-4">
                {(() => {
                  // 计算各分类的时间
                  const categoryTime: { [categoryId: string]: number } = {}

                  // 初始化各分类时间为0
                  categories.forEach(category => {
                    categoryTime[category.id] = 0
                  })

                  // 遍历所有域名，按分类累加时间
                  Object.entries(timeData).forEach(([domain, data]) => {
                    const categoryId = domainCategories[domain] || "other"
                    categoryTime[categoryId] += data?.totalTime || 0
                  })

                  // 计算总时间
                  const totalSeconds = Object.values(timeData).reduce((sum, data) => sum + data?.totalTime, 0)

                  // 生成分类数据
                  return categories
                    .map(category => {
                      const time = categoryTime[category.id] || 0
                      const percent = totalSeconds > 0 ? Math.round((time / totalSeconds) * 100) : 0
                      return {
                        label: category.name,
                        color: category.color,
                        val: formatTime(time),
                        p: percent
                      }
                    })
                    .filter(item => item.p > 0) // 只显示有时间的分类
                })().map(cat => (
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
                      <th className="pb-4 border-b border-slate-50 text-center">Category</th>
                      <th className="pb-4 border-b border-slate-50 text-center">Total Time</th>
                      <th className="pb-4 border-b border-slate-50 text-right">Productivity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredSites.map((site) => {
                      // 获取网站的分类
                      const categoryId = domainCategories[site.domain] || "other"
                      const category = categories.find(cat => cat.id === categoryId) || { name: "Other", color: "#94A3B8" }

                      return (
                        <tr key={site.rank} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-4">
                            <span className="text-xs font-black text-slate-400">{site.rank}</span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {/* 显示网站的favicon */}
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
                                className="w-6 h-6 rounded-lg"
                                alt={`${site.domain} favicon`}
                              />
                              <span className="font-bold text-sm text-slate-700">{site.domain}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                              <span className="text-xs font-bold text-slate-500">{category.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center text-xs font-bold text-slate-500">{site.totalTime}</td>
                          <td className="py-4 text-right">
                            <span className="text-xs font-black text-[#165DFF]">{site.productivity}</span>
                          </td>
                        </tr>
                      )
                    })}
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
                {/* <button className="text-[10px] font-bold bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1">🔒 Export PRO</button> */}
              </div>
              <div className="space-y-6">
                {(() => {
                  // 计算各分类的时间
                  const categoryTime: { [categoryId: string]: number } = {}

                  // 初始化各分类时间为0
                  categories.forEach(category => {
                    categoryTime[category.id] = 0
                  })

                  // 遍历所有域名，按分类累加时间
                  Object.entries(timeData).forEach(([domain, data]) => {
                    const categoryId = domainCategories[domain] || "other"
                    categoryTime[categoryId] += data?.totalTime || 0
                  })

                  // 计算总时间
                  const totalSeconds = Object.values(timeData).reduce((sum, data) => sum + data?.totalTime, 0)
                  console.log("categories", categories)
                  console.log("categoryTime", categoryTime)
                  console.log("result", categories
                    .map(category => {
                      const time = categoryTime[category.id] || 0
                      const percent = totalSeconds > 0 ? Math.round((time / totalSeconds) * 100) : 0
                      return {
                        label: category.name,
                        val: formatTime(time),
                        p: percent,
                        color: category.color
                      }
                    })
                    .filter(item => item.p > 0))
                  // 生成分类数据
                  return categories
                    .map(category => {
                      const time = categoryTime[category.id] || 0
                      const percent = totalSeconds > 0 ? Math.round((time / totalSeconds) * 100) : 0
                      return {
                        label: category.name,
                        val: formatTime(time),
                        p: percent,
                        color: category.color
                      }
                    })
                    .filter(item => item.p > 0) // 只显示有时间的分类
                })().map(item => (
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