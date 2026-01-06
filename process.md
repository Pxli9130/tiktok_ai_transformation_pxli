# 开发复盘报告（Deliverable C）— Process Documentation

本项目严格遵循 **Spec-Driven Development（规格驱动开发）**：先将业务需求转成可验证的技术规格[`spec.md`](spec.md)，再用 AI 编码工具按规格生成/修改代码。任何偏差优先通过 **修改规格与提示词契约** 来纠偏。

---

## 1) Tools Used（使用的工具）

### 1.1 IDE & AI-Native Tooling
- IDE：VS Code
- AI 编码助手：OpenAI Codex（VS Code coding assistant extension）

### 1.2 应用内大模型接入（LLM Provider/Model）
- Provider：阿里云百炼（Aliyun Bailian）
- Model：由环境变量 `BAILIAN_MODEL` 配置（本地调试示例：`qwen3-max`）
- Key 管理：使用 `.env.local`（不提交到仓库），仓库仅提供 [`.env.example`](.env.example)

### 1.3 关键技术栈
- Next.js 14+（App Router）+ TypeScript
- Tailwind CSS
- zod（服务端运行时 schema 校验）
- lucide-react（图标）

---

## 2) Spec/Prompt-Driven Workflow（规格/提示词驱动流程）

### 2.1 总体流程（体现“架构师”视角）
1. **需求抽象**：从需求文档提炼 MVP 的端到端链路：  
   输入（topic + 语言）→ 生成（3 scripts + trends）→ 卡片化展示 → Loading / Error+Retry → 一键复制。
2. **规格化与可验收化**：在 [`spec.md`](spec.md) 中定义：
   - User Stories + Acceptance Criteria（每条都可测试）
   - Data Models（`GenerateRequest / InsightResponse`）与严格字段约束
   - API Interface（成功/失败返回结构）
   - UI 组件层级与状态机（Idle/Loading/Success/Error）
3. **主提示词驱动生成**：以 [`spec.md`](spec.md) 作为唯一真源（source of truth），用 Codex 生成：
   - Next.js App Router 项目骨架
   - `app/api/generate` 服务端接口（百炼调用 + zod 校验 + 一次 format-fix retry）
   - UI 组件（TopicForm / TrendCard / ScriptCard / Loading / Error / Copy + toast）
4. **运行验证与偏差定位**：本地运行 `npm run dev`，重点检查：
   - LLM 是否仅在服务端调用（不泄露 key）
   - 返回是否严格符合 schema（字段、数量、类型）
   - UI 是否具备 Loading / Error+Retry / Copy feedback
5. **先修规格/契约，再最小化补丁**：当出现模型输出不稳定导致 schema mismatch 时：
   - 先在 [`spec.md`](spec.md) 里把“允许/禁止的结构”写成硬约束（可验证）
   - 再让 Codex 根据更新后的 spec 对提示词/校验逻辑做最小范围修复
6. **回归验证**：使用多组 topic（中/英、长短不同）重复测试，确认稳定性提升且未引入超规格功能。

### 2.2 Master Prompt（简化转述）
> “仅实现 spec.md；Next.js 14 App Router + TS + Tailwind；LLM 仅用阿里云百炼且只能在服务端 route 调用；服务端必须用 zod 校验模型 JSON；若无效只允许一次 format-fix 重试，否则返回结构化 ApiError；UI 必须包含输入、语言选择、Loading、Error+Retry、卡片化结果、一键复制（带 toast）。”

---

## 3) Crucial Fixes（关键修正，1–2 个真实案例）

> 两个问题都体现了：**模型输出 ≠ 强类型契约**。解决策略不是“放松 schema”，而是把契约写得更明确（spec + prompt contract），并通过运行时校验保证系统可控。

### Fix #1：模型输出 `styles`（array）或把 `trends` 下沉到 script 内，导致 schema mismatch

- **Issue observed（现象）**
  - 服务端 zod 校验失败：`style` 不是 string enum（而是 `styles[]`），或每个 script 里出现 `trends`。
  - 触发一次 format-fix retry；若 retry 仍不合规，则返回结构化错误（ApiError）。
- **Impact（影响）**
  - 偶发失败导致用户体验不稳定；同时使输出结构不可预测，难以渲染 UI。
- **Root cause（根因）**
  - 对“script 允许字段集合”的约束在早期不够硬，模型会“自作主张”扩展字段或改变类型。
- **Spec change（规格修正）**
  - 在 [`spec.md`](spec.md) 明确：每个 script **只能**包含 `id, style, hook, narrative, cta`。
  - 明确：`style` 必须是 **string**（禁止 `styles[]`），`trends` 必须 **仅出现在顶层**。
  - 增强“拒绝未知字段”的 runtime rule（strict parsing）。
- **Result（结果）**
  - 输出结构更稳定，schema mismatch 频率显著下降；偶发不合规时能被一次 format-fix retry 修复或以 ApiError 可控失败。

### Fix #2：模型生成非法 UUID（包含 g/h 等非十六进制字符）导致 id 校验失败

- **Issue observed（现象）**
  - `VideoScript.id` 不是合法 UUID（出现非 hex 字符），zod `.uuid()` 拒绝。
  - retry 有时仍保留非法 id → 返回结构化错误（ApiError）。
- **Impact（影响）**
  - UI 渲染依赖稳定 id（key / copy / list rendering），非法 id 会导致不可预测行为或直接失败。
- **Root cause（根因）**
  - “UUID”对模型是软概念；若不强调 **hex-only**，模型会生成“看起来像 UUID”的字符串。
- **Spec change（规格修正）**
  - 在 [`spec.md`](spec.md) 将 id 约束写成硬规则：仅允许 **0–9 / a–f + hyphens**（RFC4122-like）。
  - 在 prompt contract 明确要求：UUID 必须 hex-only，否则视为无效输出。
- **Result（结果）**
  - 非法 UUID 的出现频率明显降低；当仍出现时，服务端能以可解释错误稳定失败并便于继续收敛提示词。

> 备注：为提升可观测性，在开发环境增加了“原始模型输出”定位手段（仅 dev 环境启用，且不记录任何密钥信息），用于快速确认不合规字段来源并指导 spec/prompt 迭代。

---

## 4) Evidence / Proof-of-Work（运行证据指引）

### 4.1 Proof 文件位置（按要求提交）
在仓库放置：
- `/proof/spec/`：spec 编写界面截图
- `/proof/ai-generating/`：VS Code + Codex 生成代码过程截图
- `/proof/app-running/`：Web App 成功返回结果截图

### 4.2 How to reproduce（复现步骤）
1) 环境变量：
- 复制 `.env.example` → `.env.local`
- 填写 `BAILIAN_API_KEY`、`BAILIAN_MODEL`（示例：`qwen3-max`）
- 如需要可填写 `BAILIAN_BASE_URL`、`BAILIAN_TIMEOUT_MS`

2) 安装与运行：
```bash
npm install
npm run dev
