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
  id: string;
  style: ScriptStyle;
  hook: string;
  narrative: string[];
  cta: string;
}

export interface TrendInsight {
  hashtags: string[];
  bgm_suggestion: string;
}

export interface InsightResponse {
  request_id: string;
  topic: string;
  language: Lang;
  scripts: VideoScript[];
  trends: TrendInsight;
  provider: { name: "aliyun-bailian"; model: string };
  created_at: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
