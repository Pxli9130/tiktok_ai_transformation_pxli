import { z } from "zod";

export const langSchema = z.enum(["zh", "en"]);

export const generateRequestSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  language: langSchema
});

export const scriptStyleSchema = z.enum([
  "Educational",
  "Entertaining",
  "Emotional",
  "Vlog",
  "Other"
]);

export const videoScriptSchema = z.object({
  id: z.string().uuid(),
  style: scriptStyleSchema,
  hook: z.string().min(1),
  narrative: z.array(z.string().min(1)).min(1),
  cta: z.string().min(1)
});

export const trendInsightSchema = z.object({
  hashtags: z
    .array(z.string().regex(/^#\S+/))
    .min(5)
    .max(10),
  bgm_suggestion: z.string().min(1)
});

export const insightResponseSchema = z.object({
  request_id: z.string().uuid(),
  topic: z.string().min(1),
  language: langSchema,
  scripts: z.array(videoScriptSchema).length(3),
  trends: trendInsightSchema,
  provider: z.object({
    name: z.literal("aliyun-bailian"),
    model: z.string().min(1)
  }),
  created_at: z.string().datetime()
});

export type InsightResponse = z.infer<typeof insightResponseSchema>;
