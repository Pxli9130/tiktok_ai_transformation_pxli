# spec.md — TikTok Creator Insight Assistant (MVP)

## 0) Spec-Driven Development Contract (MUST)
This project must be implemented using **Spec-Driven Development**:
1) Write/iterate this `spec.md` (or `.kiro`) first.
2) Use AI-native tooling (Cursor / Claude Code / Windsurf) to generate code **from this spec**.
3) If AI-generated code is wrong, **fix the spec**, then regenerate/refactor accordingly.
4) Final submission will be evaluated on both **running result** and **spec quality**.

---

## 1) Product Background

### 1.1 Pain Points
In short-video ecosystems, creators often face:
- **Idea drought** (“创意枯竭”)
- **Trend mismatch** (“趋势脱节”)

Traditional topic selection relies on manual trend collection, which is time-consuming and unstructured, leading to a long **Time-to-Publish** cycle.

### 1.2 Value Proposition
Build an MVP “**TikTok Creator Insight Assistant**” that uses generative AI to convert vague creative intent into:
- **Structured script outlines (3 distinct styles)**
- **Trend-like suggestions (hashtags + background music vibe)**

Goal: enable **Data-Driven Creativity** and improve content production efficiency.

---

## 2) Scope, Goals, Non-Goals

### 2.1 MVP Goals (MUST)
1) Accept a vague topic/niche as input, supporting **Chinese/English**.
2) Generate:
   - **3** distinct short-video script structures, each containing:
     - Hook / 黄金3秒
     - Core Narrative
     - Call to Action (CTA)
   - **5–10 hashtags**
   - **Background music style/vibe** (1–2 lines)
3) Present results in **structured Cards** (not a long text blob).
4) Provide **Loading**, **Error Handling**, and **One-click Copy**.
5) LLM provider must be **Aliyun Bailian**, API key stored in **.env** (no hardcoding).

### 2.2 Non-Goals (Out of MVP)
- No real-time scraping of TikTok trends (LLM-suggested trends only)
- No login, personalization, storage of user history
- No publish-to-TikTok integration

---

## 3) Technical Stack Constraints (Implementation Target)

- Framework: **Next.js 14+ (App Router)**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- Icons: **lucide-react**
- UI Components: **shadcn/ui optional**
- Deployment: **Vercel** or local Node
- LLM Provider: **Aliyun Bailian**
  - Suggested models: `deepseek-v3`, `deepseek-r1`, `qwen-max`

---

## 4) User Stories & Acceptance Criteria

### US-1 Input & Intent (Input Layer)
**As a** creator, **I want to** input a topic (zh/en), **so that** I can get ideas relevant to my niche.
- AC-1.1: Input supports Chinese and English text (no encoding issues).
- AC-1.2: Empty/whitespace-only topic is blocked with inline validation.
- AC-1.3: Topic length is limited (default 2–120 chars); show friendly message if exceeded.

### US-2 Generate Insights (Processing Layer)
**As a** creator, **I want to** click "Generate" and receive 3 scripts + trends.
- AC-2.1: On success, response contains **exactly 3 scripts**.
- AC-2.2: Each script contains non-empty `hook`, `narrative`, `cta`.
- AC-2.3: Response contains `hashtags` list length **between 5 and 10**.
- AC-2.4: Response contains non-empty `bgm_suggestion` (1–2 lines recommended).
- AC-2.5: 3 scripts must be meaningfully different in style/angle (not minor rewording).

### US-3 Structured Visualization (Presentation Layer)
**As a** creator, **I want to** scan results in card layout.
- AC-3.1: Render **3 Script Cards** (one per script).
- AC-3.2: Render **1 Trend Card/Panel** for hashtags + bgm.
- AC-3.3: No “wall of text”: narrative is displayed as bullets or clearly separated beats.

### US-4 Operational Utility (Copy)
**As a** creator, **I want to** copy scripts/hashtags with one click.
- AC-4.1: Each Script Card has “Copy Script”.
- AC-4.2: Trend Card has “Copy Hashtags”.
- AC-4.3: Show success feedback (toast/snackbar).
- AC-4.4: If Clipboard API fails, show fallback instruction.

### US-5 Loading & Error Handling
**As a** creator, **I want to** see progress and recover from errors.
- AC-5.1: While generating, disable button and show Loading (spinner or skeleton).
- AC-5.2: On error, show a friendly message + “Retry”.
- AC-5.3: If model output is invalid JSON/schema, backend performs **one automatic format-fix retry**.
- AC-5.4: If still invalid, return a structured error code `MODEL_OUTPUT_INVALID`.

---

## 5) Data Models (Schema) — MUST be enforced

### 5.1 Request/Response Contracts (TypeScript)
The backend must validate LLM output against a runtime schema (e.g., zod) and only return valid `InsightResponse`.

```ts
export type Lang = "zh" | "en";

export interface GenerateRequest {
  topic: string;
  language: Lang; // desired output language
}

export interface InsightResponse {
  request_id: string;     // uuid
  topic: string;
  language: Lang;
  scripts: VideoScript[]; // MUST be length=3
  trends: TrendInsight;   // MUST exist
  provider: { name: "aliyun-bailian"; model: string };
  created_at: string;     // ISO timestamp
}

export type ScriptStyle =
  | "Educational"
  | "Entertaining"
  | "Emotional"
  | "Vlog"
  | "Other";

export interface VideoScript {
  id: string;            // uuid
  style: ScriptStyle;
  hook: string;          // 黄金3秒
  narrative: string[];   // 3–7 bullet beats recommended
  cta: string;           // Call to Action
}

export interface TrendInsight {
  hashtags: string[];      // MUST be length 5–10
  bgm_suggestion: string;  // MUST be non-empty (1–2 lines recommended)
}
