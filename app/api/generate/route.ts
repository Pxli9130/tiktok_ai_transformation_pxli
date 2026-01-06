import { NextResponse } from "next/server";
import { generateInsights, ModelOutputInvalidError } from "@/lib/llm";
import { generateRequestSchema } from "@/lib/schema";
import type { ApiError } from "@/lib/types";

function jsonError(
  status: number,
  code: string,
  message: string,
  retryable: boolean
) {
  const payload: ApiError = {
    error: { code, message, retryable }
  };
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return jsonError(400, "INVALID_REQUEST", "Invalid JSON body", false);
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      "INVALID_REQUEST",
      "Topic must be 2-120 characters and language must be zh or en.",
      false
    );
  }

  try {
    const data = await generateInsights(parsed.data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof ModelOutputInvalidError) {
      return jsonError(
        502,
        "MODEL_OUTPUT_INVALID",
        "Model output was invalid. Please retry.",
        true
      );
    }

    const message =
      error instanceof Error ? error.message : "Unexpected error";
    return jsonError(500, "UPSTREAM_ERROR", message, true);
  }
}
