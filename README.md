# WebTimer - 浏览器时长追踪扩展

一个强大的浏览器扩展，用于实时追踪用户在不同网站上的浏览时长，提供详细的使用统计和分析。

## ✨ 功能特性

- 🕒 **实时时长追踪** - 自动记录用户在每个网站上的停留时间
- 📊 **Top Websites 统计** - 显示最常访问的网站及其使用时长
- 🎯 **智能数据聚合** - 按域名聚合数据，支持多标签页统计
- 💾 **本地数据存储** - 使用 Chrome Storage API 安全存储数据
- 🔄 **实时更新** - Popup 界面每5秒自动刷新最新数据
- 🎨 **现代化UI** - 基于 Tailwind CSS 的美观界面设计

## 🏗️ 技术架构

### 核心组件

```
WebTimer Extension
├── background.ts      # 后台服务，监听标签页切换
├── popup.tsx         # 主界面，显示统计数据
├── manifest.json     # 扩展配置和权限
└── storage           # Chrome 本地存储
```

### 数据流程

1. **监听标签页** - Background Worker 监听 `tabs.onActivated` 和 `tabs.onUpdated`
2. **记录时长** - 计算用户在每个网站的停留时间
3. **数据存储** - 将统计数据保存到 `chrome.storage.local`
4. **界面展示** - Popup 页面读取并展示实时数据

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 安装扩展

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `build/chrome-mv3-dev` (开发) 或 `build/chrome-mv3-prod` (生产) 目录

## 📋 使用说明

### 基本使用

1. **安装扩展**后，点击浏览器工具栏中的扩展图标
2. **查看统计** - Popup 界面会显示今日总浏览时长和 Top 5 网站
3. **实时更新** - 数据会自动更新，无需手动刷新

### 数据说明

- **总时长**: 今日累计浏览时间
- **Top Websites**: 按使用时长排序的前5个网站
- **进度条**: 表示该网站占总时长的比例

## 🔧 开发指南

### 项目结构

```
src/
├── background.ts      # 后台监听逻辑
├── popup.tsx         # 主界面组件
├── pages/            # 其他页面
│   ├── dashboard.tsx
│   ├── settings.tsx
│   └── ...
└── utils/            # 工具函数
```

### 核心 API

#### Background.ts

```typescript
// 监听标签页激活
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // 记录时长逻辑
});

// 监听URL变化
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 处理导航逻辑
});
```

#### Popup.tsx

```typescript
// 获取实时数据
const fetchTimeData = async () => {
  const timeData = await chrome.runtime.sendMessage({
    action: "getTimeData"
  });
  // 处理数据...
};
```

### 数据格式

```typescript
interface TimeData {
  [domain: string]: {
    totalTime: number    // 总时长（秒）
    lastActive: number   // 最后活跃时间戳
    focusTime: number    // 专注时间（秒）
  }
}
```

## 🧪 测试

打开 `test.html` 文件进行功能测试：

```bash
# 在浏览器中打开
start test.html
```

测试包括：
- 数据存储/读取
- 时间格式化
- 域名提取
- 浏览行为模拟

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 此扩展需要相应的浏览器权限来监听标签页活动。请确保在安装时授予必要权限。