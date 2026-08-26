import { isTopic } from "./topics.ts";
import type { ModerationResult, NewPostInput } from "./types.ts";

const limits = {
  title: { min: 8, max: 90 },
  happened: { min: 40, max: 1800 },
  helped: { min: 0, max: 900 },
  wishKnown: { min: 0, max: 900 },
  reply: { min: 2, max: 280 },
};

const directPrivatePatterns = [
  { label: "an email address", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { label: "a phone number", pattern: /(?:\+?\d[\s().-]*){8,}/ },
  { label: "a social-media username", pattern: /(^|\s)@[a-z0-9_.]{3,}\b/i },
  { label: "an exact street address", pattern: /\b\d{1,5}\s+[a-z][a-z\s]{1,30}\s(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr)\b/i },
  { label: "a web link", pattern: /\b(?:https?:\/\/|www\.)\S+/i },
];

const reviewPatterns = [
  { label: "a school or workplace name", pattern: /\b(?:my|our)\s+(?:school|college|university|workplace|office)\s+(?:is|at|called)\b/i },
  { label: "an exact location", pattern: /\b(?:i live at|my address is|meet me at)\b/i },
  { label: "content requiring a closer safety review", pattern: /\b(?:instructions? to harm|threaten(?:ing)? someone|target(?:ing)? someone)\b/i },
];

const spamPatterns = [
  /\b(?:buy now|promo code|guaranteed followers|click my link)\b/i,
  /(.)\1{9,}/,
];

export function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()
    : "";
}

function collectPrivacyIssues(text: string) {
  return directPrivatePatterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => `Remove ${label} before submitting.`);
}

function collectReviewIssues(text: string) {
  return reviewPatterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => `This appears to include ${label}.`);
}

function collectSpamIssues(text: string) {
  const issues = spamPatterns.some((pattern) => pattern.test(text))
    ? ["The entry looks promotional or repeatedly formatted."]
    : [];

  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  if (words.length > 24) {
    const uniqueRatio = new Set(words).size / words.length;
    if (uniqueRatio < 0.24) issues.push("The entry repeats too much of the same text.");
  }
  return issues;
}

function validateLength(label: string, value: string, min: number, max: number) {
  if (value.length < min) return `${label} needs at least ${min} characters.`;
  if (value.length > max) return `${label} must stay under ${max} characters.`;
  return null;
}

export function validatePostInput(raw: NewPostInput) {
  const input = {
    topic: cleanText(raw.topic),
    title: cleanText(raw.title),
    happened: cleanText(raw.happened),
    helped: cleanText(raw.helped),
    wishKnown: cleanText(raw.wishKnown),
  };

  const errors = [
    !isTopic(input.topic) ? "Choose one of the available topics." : null,
    validateLength("The title", input.title, limits.title.min, limits.title.max),
    validateLength("What happened", input.happened, limits.happened.min, limits.happened.max),
    validateLength("What helped", input.helped, limits.helped.min, limits.helped.max),
    validateLength("What you wish you had known", input.wishKnown, limits.wishKnown.min, limits.wishKnown.max),
  ].filter(Boolean) as string[];

  return { input, errors };
}

export function moderateText(parts: string[]): ModerationResult {
  const text = parts.join("\n");
  const privacyIssues = collectPrivacyIssues(text);
  const spamIssues = collectSpamIssues(text);

  if (privacyIssues.length || spamIssues.length) {
    return { decision: "block", issues: [...privacyIssues, ...spamIssues] };
  }

  const reviewIssues = collectReviewIssues(text);
  if (reviewIssues.length) {
    return { decision: "review", issues: reviewIssues };
  }

  return { decision: "allow", issues: [] };
}

export function validateReply(raw: unknown) {
  const body = cleanText(raw);
  const error = validateLength("The reply", body, limits.reply.min, limits.reply.max);
  const moderation = moderateText([body]);
  return { body, errors: error ? [error] : [], moderation };
}
