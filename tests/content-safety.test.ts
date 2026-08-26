import assert from "node:assert/strict";
import test from "node:test";
import { moderateText, validatePostInput, validateReply } from "../lib/content-safety.ts";

test("accepts a valid post with optional reflection fields left empty", () => {
  const result = validatePostInput({
    topic: "School",
    title: "One result was not the whole story",
    happened: "I expected one result to settle every question, but it only showed me which part of my preparation needed to change.",
  });
  assert.deepEqual(result.errors, []);
  assert.equal(moderateText(Object.values(result.input)).decision, "allow");
});

test("blocks direct private contact information", () => {
  const moderation = moderateText(["Please contact me at example@example.test so I can explain the rest."]);
  assert.equal(moderation.decision, "block");
  assert.match(moderation.issues.join(" "), /email address/i);
});

test("holds possible school or workplace identification for review", () => {
  const moderation = moderateText(["My school is called a name I should remove before publication."]);
  assert.equal(moderation.decision, "review");
});

test("blocks obvious repeated spam", () => {
  const moderation = moderateText(["buy now buy now buy now buy now buy now buy now buy now buy now"]);
  assert.equal(moderation.decision, "block");
});

test("enforces the short reply limit", () => {
  const validation = validateReply("x".repeat(281));
  assert.equal(validation.errors.length, 1);
  assert.match(validation.errors[0], /280/);
});
