export type StudioProvider = "google" | "openai";
export type StudioAspectRatio = "1:1" | "3:4" | "4:5" | "9:16" | "16:9";

export const SECRET_STUDIO_FALLBACK_REFERENCES = [
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101023/2_ltpa5y.webp",
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101024/6_d2ejcx.webp",
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101030/28_b9o1sc.webp",
];

const providerLabels: Record<StudioProvider, string> = {
  google: "Google Gemini Image",
  openai: "OpenAI GPT Image",
};

export function getStudioProviderLabel(provider: StudioProvider) {
  return providerLabels[provider];
}
