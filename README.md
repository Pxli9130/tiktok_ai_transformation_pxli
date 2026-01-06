# TikTok Creator Insight Assistant（MVP）

本项目为 “TikTok Creator Insight Assistant” 的 MVP，实现从输入主题到生成 3 份脚本 + 趋势洞察的端到端流程。项目严格遵循 Spec-Driven Development（规格驱动开发）。

## 总索引（Deliverables）

- 交付物 A（Spec）：[`spec.md`](spec.md)
- 交付物 B（Source Code）：核心入口如下
  - UI 入口：[`app/page.tsx`](app/page.tsx)
  - API 入口：[`app/api/generate/route.ts`](app/api/generate/route.ts)（服务端调用 Aliyun Bailian）
  - Schema 校验：[`lib/schema.ts`](lib/schema.ts)
  - LLM 调用封装：[`lib/bailian.ts`](lib/bailian.ts)、[`lib/llm.ts`](lib/llm.ts)
- 交付物 C（Process Documentation）：[`process.md`](process.md)
- 交付物 D（Proof of Work）：`proof/`（截图）

## 项目简介

输入一个中英文主题（2–120 字符），调用 Aliyun Bailian 生成：
- 3 个不同风格短视频脚本（Hook / Narrative / CTA）
- 5–10 个 Hashtags
- BGM 建议

结果以卡片形式展示，并提供 Loading、Error + Retry、以及一键复制（带 toast 提示）。

## 功能概览

- 输入主题 + 语言选择（zh/en）
- 生成 3 份脚本 + 1 份趋势卡片
- Loading 状态与按钮禁用
- 错误提示与 Retry
- Copy Script / Copy Hashtags + toast

## 技术栈

- Next.js 14+（App Router）
- TypeScript
- Tailwind CSS
- lucide-react
- zod
- LLM Provider：Aliyun Bailian（API Key 仅服务端读取）

## 目录结构

```
app/
  api/generate/route.ts   # POST /api/generate
  page.tsx                # 主页面
  layout.tsx              # 全局布局
  globals.css             # 全局样式
components/               # UI 组件（Cards/Loading/Error/Copy/Toast）
lib/
  schema.ts               # zod schema
  bailian.ts              # Aliyun Bailian client
  llm.ts                  # 调用 + 一次 format-fix retry
  prompt.ts               # LLM 提示词
spec.md                   # 规格文档（交付物 A）
process.md                # 开发复盘（交付物 C）
proof/                    # 运行证据（交付物 D）
```

## 快速开始

1) 安装依赖
```bash
npm install
```

2) 配置环境变量
```bash
cp .env.example .env.local
```
在 `.env.local` 中填写：
- `BAILIAN_API_KEY`
- `BAILIAN_MODEL`（例如 `qwen3-max`）
- 可选：`BAILIAN_BASE_URL`、`BAILIAN_TIMEOUT_MS`

3) 启动开发服务
```bash
npm run dev
```

4) 打开浏览器
- `http://localhost:3000`

## 环境变量配置

`.env.local` 示例：
```
BAILIAN_API_KEY=your_key_here
BAILIAN_MODEL=qwen3-max
BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
BAILIAN_TIMEOUT_MS=20000
```

说明：
- `BAILIAN_API_KEY` 仅在服务端使用，不会暴露到客户端。
- `BAILIAN_MODEL` 可随时更换模型。
- `BAILIAN_TIMEOUT_MS` 可根据模型响应速度调整。

## 如何验收

对照 [`spec.md`](spec.md) 的关键验收点：
- 输入支持 zh/en，长度限制 2–120 字符（空白输入提示）
- 点击 Generate 后返回 3 个 Script Cards + 1 个 Trend Card
- 生成过程中有 Loading 状态，按钮禁用
- 失败时显示 Error + Retry
- Copy Script / Copy Hashtags 可用，且有 toast 提示

