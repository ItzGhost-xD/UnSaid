import assert from "node:assert/strict";
import test from "node:test";
import { generateAnonymousAlias, generateRecoveryCode, hashPrivateValue } from "../lib/aliases.ts";

test("generates a per-contribution anonymous animal name", () => {
  assert.match(generateAnonymousAlias(), /^Anonymous [A-Za-z]+$/);
});

test("generates a readable recovery code", () => {
  assert.match(generateRecoveryCode(), /^UNS-[A-F0-9]{5}-[A-F0-9]{5}$/);
});

test("hashes private identifiers consistently without returning the input", () => {
  const first = hashPrivateValue("test-value");
  const second = hashPrivateValue("test-value");
  assert.equal(first, second);
  assert.notEqual(first, "test-value");
  assert.equal(first.length, 64);
});
