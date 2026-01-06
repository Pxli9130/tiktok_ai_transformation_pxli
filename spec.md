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


```

---

## 6) API Interface (Backend) — MUST

> Goal: Provide a single stable API for the UI to request insights. The API must validate input, call Bailian on server-side, validate output via runtime schema, then return either `InsightResponse` or a structured error object.

### 6.1 Endpoint
- **POST** `/api/generate`
- Content-Type: `application/json`
- Request body: `GenerateRequest`
- Response:
  - `200`: `InsightResponse`
  - `400`: invalid request / validation failure
  - `429`: rate limited (optional)
  - `500`: provider/network/internal errors
  - `502`: `MODEL_OUTPUT_INVALID` (model output cannot be repaired within the one-retry rule)

### 6.2 Error Response Contract (MUST)
All error responses MUST be JSON and MUST follow this schema:

```ts
export type ErrorCode =
  | "BAD_REQUEST"
  | "TOPIC_OUT_OF_RANGE"
  | "ENV_MISSING"
  | "PROVIDER_ERROR"
  | "MODEL_OUTPUT_INVALID"
  | "INTERNAL_ERROR";

export interface ErrorResponse {
  code: ErrorCode;
  message: string;       // user-friendly
  retryable: boolean;    // whether UI should show Retry
  request_id?: string;   // if available
  details?: unknown;     // optional dev-only; avoid leaking secrets
}
````

### 6.3 Request Validation Rules (MUST)

* `topic`:

  * trim whitespace
  * length must be **2–120** chars after trim
* `language` must be `"zh"` or `"en"`
* If invalid → return `400` with `ErrorResponse { code: "BAD_REQUEST" | "TOPIC_OUT_OF_RANGE" }`

### 6.4 Response Assembly Rules (MUST)

The backend MUST:

1. Call model and obtain **LLM-generated payload** (see Section 7).
2. Validate payload strictly with runtime schema (unknown keys rejected).
3. If valid, wrap into `InsightResponse` by adding:

   * `request_id` (uuid)
   * `provider` (name + model)
   * `created_at` (ISO timestamp)

---

## 7) LLM Integration & Output Contract (Aliyun Bailian) — MUST

### 7.1 Environment Variables (MUST)

* `BAILIAN_API_KEY` (required)
* `BAILIAN_MODEL` (required, e.g., `qwen-max` / `deepseek-v3`)
* Optional:

  * `BAILIAN_BASE_URL`
  * `BAILIAN_TIMEOUT_MS`

**Security rule:** API key MUST NOT be sent to the browser. The Bailian call MUST happen server-side only.

### 7.2 What the Model Must Output (MUST)

To reduce schema mismatch, the model should output **ONLY** the following JSON object (no markdown, no extra text):

```ts
export interface LLMGeneratedPayload {
  scripts: VideoScript[]; // MUST be length=3
  trends: TrendInsight;   // TOP-LEVEL only
}
```

### 7.3 Strict JSON Rules (MUST)

Model output MUST satisfy ALL:

* Output is a **single JSON object** (no markdown, no backticks, no commentary).
* `scripts` MUST be **exactly 3** items.
* Each script MUST ONLY have these keys: `id, style, hook, narrative, cta`

  * ❌ No `styles` (array)
  * ❌ No script-level `trends`
* `VideoScript.id` MUST be a valid UUID string:

  * **hex digits 0-9 and a-f + hyphens**
  * (RFC4122-like format; must pass runtime `.uuid()` validation)
* `VideoScript.style` MUST be a **string enum** (`ScriptStyle`) (NOT an array).
* `trends.hashtags`:

  * length **5–10**
  * each item should start with `#`
  * recommended unique, no duplicates
* `trends.bgm_suggestion` non-empty, recommended 1–2 lines.
* Output language:

  * If `language="zh"`: scripts & trends should be Chinese.
  * If `language="en"`: scripts & trends should be English.

### 7.4 One-Retry “Format-Fix” Rule (MUST)

Backend MUST implement:

1. First model call → parse/validate.
2. If invalid JSON/schema → do **exactly one** format-fix retry:

   * Provide the invalid output back to the model
   * Ask it to return a corrected JSON **that strictly matches `LLMGeneratedPayload`**
3. If still invalid after retry → return `502` with:

   * `ErrorResponse { code: "MODEL_OUTPUT_INVALID", retryable: true }`

### 7.5 Prompt Template Requirements (MUST)

Prompt MUST explicitly state:

* “JSON only, no markdown”
* “scripts only contain id/style/hook/narrative/cta”
* “no styles / no script-level trends”
* “UUID must be hex digits”
* “exactly 3 scripts”
* “hashtags 5–10 and start with #”

---

## 8) UI Component Hierarchy & States (Presentation Layer) — MUST

> Goal: Card-based layout for scan-ability (Trend Card + 3 Script Cards), with Loading/Error/Retry/Copy.

### 8.1 Page-Level Hierarchy (Suggested)

* `Page`

  * `Header` (title + one-line pitch)
  * `TopicForm`

    * Topic input
    * Language selector (zh/en)
    * Generate button
  * `StatusRegion`

    * Loading (spinner/skeleton)
    * ErrorBanner + Retry
  * `ResultsRegion` (render only on success)

    * `TrendCard`

      * hashtags list
      * bgm_suggestion text
      * Copy Hashtags button
    * `ScriptCard` x3

      * style badge
      * hook
      * narrative bullets
      * cta
      * Copy Script button
  * `ToastProvider` (copy success/fail)

### 8.2 UI States (MUST)

* `idle`: form visible, no result yet
* `loading`: disable Generate; show loading indicator
* `success`: show TrendCard + 3 ScriptCards
* `error`: show friendly error + Retry (re-submit same topic/language)

### 8.3 Copy Behavior (MUST)

* Copy Script: includes `hook + narrative + cta` in a clean text format
* Copy Hashtags: one line space-separated or newline-separated hashtags
* On failure: show fallback instruction (“Please select and copy manually”)

---

## 9) End-to-End Validation Checklist (QA) — MUST

* Input validation:

  * empty topic → blocked
  * length <2 or >120 → friendly error
* Generation:

  * returns exactly 3 scripts
  * each script has hook/narrative/cta non-empty
  * narrative displayed as bullets
* Trends:

  * 5–10 hashtags, visible on TrendCard
  * bgm_suggestion non-empty
* UX:

  * loading state disables button
  * error banner is friendly (no stack trace)
  * Retry works
  * copy buttons work + toast feedback
* Robustness:

  * if model returns invalid JSON → backend does exactly one format-fix retry
  * if still invalid → `MODEL_OUTPUT_INVALID` (502) + UI shows Retry

---
