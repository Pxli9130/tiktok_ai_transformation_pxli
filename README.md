# TikTok Creator Insight Assistant (MVP)

## Setup
1) Copy `.env.example` to `.env.local` and fill in values.
2) Install dependencies: `npm install`.
3) Run the dev server: `npm run dev`.
4) Open `http://localhost:3000`.

### Environment variables
- `BAILIAN_API_KEY`: Aliyun Bailian API key.
- `BAILIAN_BASE_URL`: Base URL for the Bailian API.
- `BAILIAN_MODEL`: Model name (e.g. `qwen-max`, `deepseek-v3`).
- `BAILIAN_TIMEOUT_MS`: Optional timeout for the API call in milliseconds.

## End-to-end checklist
- [ ] `.env.local` set with valid Bailian credentials
- [ ] App loads and accepts zh/en input
- [ ] Generate returns 3 scripts + trend card
- [ ] Loading and error states display correctly
- [ ] Copy buttons show toast feedback

## Assumptions
- `ApiError` uses the shape `{ error: { code, message, retryable } }` because it is not defined in `spec.md`.
- When `BAILIAN_BASE_URL` is not provided, the server defaults to `https://dashscope.aliyuncs.com/compatible-mode/v1` (Aliyun OpenAI-compatible endpoint). Update `.env.local` if your Bailian endpoint differs.
