export const topics = [
  "School",
  "Family",
  "Friendship",
  "Identity",
  "Starting over",
  "Setbacks",
  "Uncertainty",
  "Rebuilding",
] as const;

export type Topic = (typeof topics)[number];

export const topicDescriptions: Record<Topic, string> = {
  School: "Exams, results, changing direction, pressure, and learning.",
  Family: "Expectations, boundaries, responsibility, and feeling heard.",
  Friendship: "Belonging, drifting apart, loneliness, and new connections.",
  Identity: "Values, self-trust, comparison, and becoming more yourself.",
  "Starting over": "Moving, changing paths, rebuilding routines, and new chapters.",
  Setbacks: "Rejection, mistakes, missed opportunities, and plans that changed.",
  Uncertainty: "Decisions, the future, unclear next steps, and doubt.",
  Rebuilding: "Quiet progress, confidence, consistency, and beginning again.",
};

export function isTopic(value: string): value is Topic {
  return topics.includes(value as Topic);
}

