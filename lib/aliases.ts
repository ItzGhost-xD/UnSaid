import { createHmac, randomBytes, randomInt } from "node:crypto";

const animals = [
  "Badger",
  "Deer",
  "Finch",
  "Fox",
  "Hare",
  "Heron",
  "Lynx",
  "Moth",
  "Otter",
  "Robin",
  "Seal",
  "Wren",
] as const;

function secret() {
  return process.env.UNSAID_SERVER_SECRET || "unsaid-local-testing-secret";
}

export function generateAnonymousAlias() {
  return `Anonymous ${animals[randomInt(animals.length)]}`;
}

export function generateRecoveryCode() {
  const raw = randomBytes(5).toString("hex").toUpperCase();
  return `UNS-${raw.slice(0, 5)}-${raw.slice(5)}`;
}

export function hashPrivateValue(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

