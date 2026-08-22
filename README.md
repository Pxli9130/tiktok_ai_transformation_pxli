# TikTok Creator Insight Assistant (MVP)

This project is an MVP of the “TikTok Creator Insight Assistant.” It implements an end-to-end workflow that generates three scripts and trend insights from a user-provided topic. The project strictly follows Spec-Driven Development.

## Deliverables Index

- Deliverable A (Specification): [spec.md](spec.md)
- Deliverable B (Source Code): Key entry points:
  - UI: [app/page.tsx](app/page.tsx)
  - API: [app/api/generate/route.ts](app/api/generate/route.ts) (server-side calls to Aliyun Bailian)
  - Schema validation: [lib/schema.ts](lib/schema.ts)
  - LLM integrations: [lib/bailian.ts](lib/bailian.ts), [lib/llm.ts](lib/llm.ts)
- Deliverable C (Process Documentation): [process.md](process.md)
- Deliverable D (Proof of Work): `proof/` (screenshots)

## Project Overview

Enter a topic in Chinese or English (2–120 characters), and the application uses Aliyun Bailian to generate:

- Three short-form video scripts in different styles (Hook / Narrative / CTA)
- 5–10 hashtags
- BGM recommendations

Results are displayed as cards. The application also provides loading states, error handling with retry, and one-click copying with toast notifications.

## Features

- Topic input and language selection (`zh`/`en`)
- Generation of three scripts and one trend card
- Loading state and disabled button during generation
- Error messages and retry functionality
- Copy Script / Copy Hashtags with toast notifications

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- lucide-react
- zod
- LLM provider: Aliyun Bailian (the API key is accessed only on the server)

## Directory Structure

```bash
app/
  api/generate/route.ts   # POST /api/generate
  page.tsx                # Main page
  layout.tsx              # Global layout
  globals.css             # Global styles
components/               # UI components (Cards/Loading/Error/Copy/Toast)
lib/
  schema.ts               # zod schema
  bailian.ts              # Aliyun Bailian client
  llm.ts                  # LLM call + one format-fix retry
  prompt.ts               # LLM prompt
spec.md                   # Specification document (Deliverable A)
process.md                # Development retrospective (Deliverable C)
proof/                    # Proof of operation (Deliverable D)
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Add the following values to `.env.local`:

- `BAILIAN_API_KEY`
- `BAILIAN_MODEL` (for example, `qwen3-max`)
- Optional: `BAILIAN_BASE_URL`, `BAILIAN_TIMEOUT_MS`

3. Start the development server:

```bash
npm run dev
```

4. Open the application in your browser:

- `http://localhost:3000`

## Environment Variable Configuration

Example `.env.local`:

```ini
BAILIAN_API_KEY=your_key_here
BAILIAN_MODEL=qwen3-max
BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
BAILIAN_TIMEOUT_MS=20000
```

Notes:

- `BAILIAN_API_KEY` is used only on the server and is never exposed to the client.
- `BAILIAN_MODEL` can be changed at any time.
- `BAILIAN_TIMEOUT_MS` can be adjusted based on the model’s response time.

## Acceptance Testing

Verify the following key acceptance criteria defined in [spec.md](spec.md):

- The input supports `zh` and `en` and enforces a length limit of 2–120 characters, with a validation message for blank input.
- Clicking Generate returns three Script Cards and one Trend Card.
- A loading state is shown and the button is disabled during generation.
- An error message and Retry option are displayed when generation fails.
- Copy Script and Copy Hashtags work correctly and display toast notifications.
