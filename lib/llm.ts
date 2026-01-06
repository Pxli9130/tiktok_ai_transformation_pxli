import { randomUUID } from "crypto";
import { callBailian } from "./bailian";
import {
  buildFormatFixPrompt,
  buildSystemPrompt,
  buildUserPrompt
} from "./prompt";
import { insightResponseSchema } from "./schema";
import type { InsightResponse, Lang } from "./types";

export class ModelOutputInvalidError extends Error {
  code = "MODEL_OUTPUT_INVALID" as const;
  retryable = true;

  constructor(message = "Model output invalid") {
    super(message);
  }
}

function parseModelJson(content: string) {
  try {
    return { ok: true as const, value: JSON.parse(content) };
  } catch (error) {
    return { ok: false as const, error };
  }
}

function logModelFailure(params: {
  reason: string;
  content: string;
  formatFix?: boolean;
  details?: string;
}) {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  const prefix = params.formatFix ? "[llm][format-fix]" : "[llm]";
  const details = params.details ? `\nDetails: ${params.details}` : "";
  console.warn(`${prefix} Invalid model output (${params.reason}).${details}\n${params.content}`);
}

async function attemptGenerate(params: {
  topic: string;
  language: Lang;
  requestId: string;
  createdAt: string;
  model: string;
  formatFix?: boolean;
  previousOutput?: string;
}): Promise<{ data?: InsightResponse; raw: string }> {
  const systemPrompt = params.formatFix
    ? "You fix JSON outputs. Return JSON only with no markdown."
    : buildSystemPrompt({
        topic: params.topic,
        language: params.language,
        requestId: params.requestId,
        createdAt: params.createdAt,
        model: params.model
      });

  const userPrompt = params.formatFix
    ? buildFormatFixPrompt({
        topic: params.topic,
        language: params.language,
        requestId: params.requestId,
        createdAt: params.createdAt,
        model: params.model,
        previousOutput: params.previousOutput ?? ""
      })
    : buildUserPrompt({ topic: params.topic, language: params.language });

  const { content } = await callBailian(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    {
      temperature: params.formatFix ? 0.1 : 0.2,
      responseFormat: "json_object"
    }
  );

  const parsed = parseModelJson(content);
  if (!parsed.ok) {
    logModelFailure({
      reason: "invalid JSON",
      content,
      formatFix: params.formatFix
    });
    return { raw: content };
  }

  const validated = insightResponseSchema.safeParse(parsed.value);
  if (!validated.success) {
    logModelFailure({
      reason: "schema mismatch",
      content,
      formatFix: params.formatFix,
      details: validated.error.issues.map((issue) => issue.message).join("; ")
    });
    return { raw: content };
  }

  return { data: validated.data, raw: content };
}

export async function generateInsights(params: {
  topic: string;
  language: Lang;
}): Promise<InsightResponse> {
  const model = process.env.BAILIAN_MODEL ?? "";
  const requestId = randomUUID();
  const createdAt = new Date().toISOString();

  const firstAttempt = await attemptGenerate({
    topic: params.topic,
    language: params.language,
    requestId,
    createdAt,
    model
  });

  if (firstAttempt.data) {
    return firstAttempt.data;
  }

  const secondAttempt = await attemptGenerate({
    topic: params.topic,
    language: params.language,
    requestId,
    createdAt,
    model,
    formatFix: true,
    previousOutput: firstAttempt.raw
  });

  if (secondAttempt.data) {
    return secondAttempt.data;
  }

  throw new ModelOutputInvalidError();
}
