"use client";

import { useEffect } from "react";

export function SessionBootstrap() {
  useEffect(() => {
    void fetch("/api/session", { credentials: "same-origin" });
  }, []);
  return null;
}

