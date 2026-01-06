export type BailianMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface BailianConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

function getConfig(): BailianConfig {
  const apiKey = process.env.BAILIAN_API_KEY;
  const model = process.env.BAILIAN_MODEL;
  const baseUrl =
    process.env.BAILIAN_BASE_URL ??
    "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const timeoutMsRaw = process.env.BAILIAN_TIMEOUT_MS;

  if (!apiKey) {
    throw new Error("Missing BAILIAN_API_KEY");
  }
  if (!model) {
    throw new Error("Missing BAILIAN_MODEL");
  }

  const timeoutCandidate = timeoutMsRaw ? Number(timeoutMsRaw) : 20000;
  const timeoutMs =
    Number.isFinite(timeoutCandidate) && timeoutCandidate > 0
      ? timeoutCandidate
      : 20000;
  return { apiKey, baseUrl, model, timeoutMs };
}

export interface BailianRequestOptions {
  temperature?: number;
  responseFormat?: "json_object";
}

export async function callBailian(
  messages: BailianMessage[],
  options: BailianRequestOptions = {}
) {
  const config = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const body: Record<string, unknown> = {
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.7
    };

    if (options.responseFormat) {
      body.response_format = { type: options.responseFormat };
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Bailian error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Bailian response missing content");
    }

    return { content, model: config.model };
  } finally {
    clearTimeout(timeout);
  }
}
