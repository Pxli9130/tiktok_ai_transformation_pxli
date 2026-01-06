import type { Lang } from "./types";

const schemaHint = `{
  "request_id": "uuid",
  "topic": "string",
  "language": "zh|en",
  "scripts": [
    {
      "id": "uuid",
      "style": "Educational|Entertaining|Emotional|Vlog|Other",
      "hook": "string",
      "narrative": ["string"],
      "cta": "string"
    }
  ],
  "trends": {
    "hashtags": ["#tag"],
    "bgm_suggestion": "string"
  },
  "provider": { "name": "aliyun-bailian", "model": "string" },
  "created_at": "ISO-8601 timestamp"
}`;

export function buildSystemPrompt(params: {
  topic: string;
  language: Lang;
  requestId: string;
  createdAt: string;
  model: string;
}) {
  return `You are an assistant that returns JSON only.
Follow these rules strictly:
- Output must be a single JSON object, no markdown, no extra text.
- Output language must be ${params.language}.
- Provide exactly 3 scripts, each with hook, narrative array, and cta.
- Each script must have a unique uuid for id.
- styles must be one of: Educational, Entertaining, Emotional, Vlog, Other.
- trends.hashtags must contain 5-10 items and each must start with #.
- trends.bgm_suggestion must be non-empty (1-2 lines recommended).
- Use the exact fixed values:
  request_id: ${params.requestId}
  topic: ${params.topic}
  language: ${params.language}
  provider.name: aliyun-bailian
  provider.model: ${params.model}
  created_at: ${params.createdAt}
Ensure the three scripts are meaningfully different in style or angle.
Return JSON only.`;
}

export function buildUserPrompt(params: { topic: string; language: Lang }) {
  return `Topic: ${params.topic}
Desired language: ${params.language}`;
}

export function buildFormatFixPrompt(params: {
  topic: string;
  language: Lang;
  requestId: string;
  createdAt: string;
  model: string;
  previousOutput: string;
}) {
  return `The previous output was invalid JSON or did not match the required schema.
Return a corrected JSON object ONLY, following this schema exactly:
${schemaHint}

Fixed values:
request_id: ${params.requestId}
topic: ${params.topic}
language: ${params.language}
provider.name: aliyun-bailian
provider.model: ${params.model}
created_at: ${params.createdAt}

Rules:
- JSON only, no markdown, no extra text.
- 3 scripts exactly, each with hook, narrative array, cta.
- hashtags length 5-10, each begins with #.
- Output language must be ${params.language}.

Invalid output to fix:
${params.previousOutput}`;
}
