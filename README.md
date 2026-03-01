# LLM Adventure Game - Frontend

一个基于 LLM 的文字冒险游戏，前端项目。

## 功能

- **文字冒险**: 通过打字和点击与游戏互动
- **LLM 对话**: 与 AI 游戏主持人对话推进故事
- **服务端存档**: 游戏进度保存在后端服务器
- **响应式设计**: 适配桌面和移动设备

## 快速开始

### 本地运行

直接在浏览器中打开 `index.html` 文件即可。

### 部署到 GitHub Pages

1. 创建 GitHub 仓库
2. 将 `frontend/` 目录内容推送到仓库
3. 在仓库设置中启用 GitHub Pages
4. 选择 `main` 分支作为源
5. 访问 `https://yourusername.github.io/your-repo/`

## 配置

游戏启动后，点击右上角的设置按钮（⚙️）进行配置：

- **后端 API 地址**: 您的后端服务器地址（如 `http://localhost:3000` 或 `https://your-server.com`）
- **玩家 ID**: 自动生成或手动设置

## 项目结构

```
frontend/
├── index.html          # 主页面
├── styles/
│   └── main.css        # 样式文件
├── js/
│   ├── config.js       # 配置
│   ├── game.js         # 游戏逻辑
│   ├── llm.js          # LLM 集成
│   ├── save-manager.js # 存档管理
│   └── ui.js           # UI 交互
└── README.md
```

## 游戏操作

### 开始游戏
点击「开始游戏」按钮启动新游戏。

### 与游戏互动
1. 在输入框中输入行动或对话
2. 按回车键或点击「发送」按钮
3. 游戏主持人会根据你的输入回应

### 存档和读取
- 点击「💾 保存」保存当前进度
- 点击「📂 加载」读取上次保存的进度

### 获取帮助
点击「帮助」按钮查看游戏操作说明。

## 技术栈

- 纯原生 JavaScript（无框架依赖）
- CSS3（暗色主题）
- Fetch API（与后端通信）

## 依赖

需要后端 API 服务支持，详见 [backend/README.md](../backend/README.md)。

## 自定义

### 修改游戏主题
编辑 `styles/main.css` 中的 CSS 变量：

```css
:root {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --accent: #e94560;
  /* ... */
}
```

### 修改游戏提示
编辑 `js/llm.js` 中的系统提示词：

```javascript
{
  role: 'system',
  content: `你是一个文字冒险游戏的游戏主持人...`
}
```

### 修改游戏状态解析
编辑 `js/game.js` 中的 `parseGameStateUpdate` 方法。

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari
- 其他现代浏览器

## 注意事项

1. 确保后端服务已启动并可访问
2. 如果使用 HTTPS 部署，后端也需要使用 HTTPS
3. 跨域问题：确保后端配置了正确的 CORS

## 许可证

MIT
