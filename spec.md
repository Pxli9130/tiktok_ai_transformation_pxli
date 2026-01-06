# TikTok Creator Insight Assistant — MVP (spec.md)

> MVP: Turn a vague creator topic into **three structured short-video scripts** + **trend signals** (hashtags + BGM direction) with a card-based UI, reducing Time-to-Publish.

---

## 0) Spec-Driven Development Contract (MUST)

This project must follow **Spec-Driven Development**:
1) Write/iterate this `spec.md` (or `.kiro`) first.
2) Use AI-native tooling (Cursor / Claude Code / Windsurf / VS Code AI coding assistant) to generate code **from this spec**.
3) If AI-generated code is wrong, **fix the spec first**, then regenerate/refactor accordingly.
4) Final submission is graded on both **running result** and **spec quality** (auditability, correctness, completeness).

---

## 1) Product Background（产品背景）

### 1.1 Pain Points（业务痛点）
In short-video ecosystems, creators often face:
- **Idea drought**（创意枯竭）
- **Trend mismatch**（趋势脱节）

Manual trend searching is time-consuming and unstructured → long **Time-to-Publish**.

### 1.2 Value Proposition（价值主张）
Build an MVP that uses GenAI to convert vague intent into:
- **Structured scripts (3 distinct styles)**
- **Trend-like signals (hashtags + music vibe)**

Goal: enable **Data-Driven Creativity** and improve production efficiency.

---

## 2) Scope

### 2.1 In Scope (MUST)
- Input: topic/niche, multilingual input supported (zh/en)
- Output:
  - **3 scripts** (Hook / Narrative / CTA)
  - **5–10 hashtags**
  - **BGM suggestion** (style/vibe text)
- Presentation:
  - Card layout (not a wall of text)
  - Loading + Error handling + Retry
  - One-click copy (script + hashtags)
- Provider constraints:
  - LLM must be **Aliyun Bailian**
  - API key via **.env** only (no hardcoding)

### 2.2 Out of Scope (NOT in MVP)
- Real TikTok trend scraping
- Accounts/history/persistence
- Publish-to-TikTok integration

---

## 3) Technical Constraints（开发约束）

### 3.1 Frontend / Platform
- Next.js **14+** (App Router)
- TypeScript
- Tailwind CSS
- lucide-react icons
- shadcn/ui optional

### 3.2 Model Provider (MUST)
- Aliyun Bailian (百炼)
- Suggested models: DeepSeek-V3 / DeepSeek-R1 / Qwen-Max
- Key handling:
  - `.env.local` only (never commit)
  - provide `.env.example`

---

## 4) User Stories & Acceptance Criteria（验收标准）

### US-1 Input & Language
**As a** creator, **I want** to input a topic and select language (zh/en), **so that** I get niche-relevant ideas.

- **AC-1.1** Topic accepts Chinese/English characters (no encoding issues).
- **AC-1.2** Empty/whitespace topic is blocked with inline validation.
- **AC-1.3** Topic length must be 2–120 characters; show friendly message if out of range.
- **AC-1.4** Language selector supports English/中文 → API uses `"en"` / `"zh"`.

### US-2 Insight Generation
**As a** creator, **I want** to click Generate and receive 3 scripts + trend signals.

- **AC-2.1** Success response contains **exactly 3 scripts**.
- **AC-2.2** Each script contains non-empty `hook`, `narrative`, `cta`.
- **AC-2.3** `narrative` is an array of beats (recommended 3–7 items).
- **AC-2.4** `trends.hashtags` length is **5–10**.
- **AC-2.5** `trends.bgm_suggestion` is non-empty (1–2 lines recommended).
- **AC-2.6** The three scripts must be meaningfully different (angle/style), not minor rewordings.

### US-3 Structured Presentation
**As a** creator, **I want** a card layout so I can scan quickly.

- **AC-3.1** UI renders one **Trend Card** (hashtags + BGM direction).
- **AC-3.2** UI renders **3 Script Cards** (one per script).
- **AC-3.3** UI avoids a single “wall of text”.

### US-4 One-Click Copy
**As a** creator, **I want** one-click copy so I can paste immediately.

- **AC-4.1** Each Script Card has “Copy Script”.
- **AC-4.2** Trend Card has “Copy Hashtags”.
- **AC-4.3** Show toast/snackbar on copy success/failure.
- **AC-4.4** If Clipboard API fails, show fallback message/instruction.

### US-5 Loading / Error / Retry
**As a** creator, **I want** clear progress + recoverable errors.

- **AC-5.1** While generating: show loading indicator + disable Generate button.
- **AC-5.2** On error: show user-friendly message (not raw stack).
- **AC-5.3** Error state includes a **Retry** action that re-submits the same request.
- **AC-5.4** Backend handles invalid model output with **exactly one format-fix retry** (see Section 7.3).

---

## 5) Data Models (Schema) — MUST be enforced

> Server must validate model output with runtime schema (e.g., zod). Unknown fields must be rejected (strict parsing).

```ts
export type Lang = "zh" | "en";

export interface GenerateRequest {
  topic: string;
  language: Lang;
}

export type ScriptStyle =
  | "Educational"
  | "Entertaining"
  | "Emotional"
  | "Vlog"
  | "Other";

export interface VideoScript {
  id: string;           // UUID (RFC4122-like, hex digits + hyphens)
  style: ScriptStyle;   // string ONLY (NOT array)
  hook: string;
  narrative: string[];  // bullet beats
  cta: string;
}

export interface TrendInsight {
  hashtags: string[];      // 5–10
  bgm_suggestion: string;  // non-empty
}

export interface InsightResponse {
  request_id: string; // uuid
  topic: string;
  language: Lang;
  scripts: VideoScript[]; // MUST be length=3
  trends: TrendInsight;   // MUST exist (TOP-LEVEL only)
  provider: { name: "aliyun-bailian"; model: string };
  created_at: string; // ISO timestamp
}
