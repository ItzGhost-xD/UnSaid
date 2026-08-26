"use client";

import { LockKey, Trash } from "@phosphor-icons/react";
import { useState } from "react";

export function ManageContribution() {
  const [code, setCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [removed, setRemoved] = useState(false);

  async function remove(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryCode: code }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "The contribution could not be removed.");
      setRemoved(true);
      setMessage("The contribution has been removed from the public library.");
      setCode("");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "The contribution could not be removed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={remove}>
      <label className="form-label">
        Recovery code
        <span className="relative block">
          <LockKey className="absolute top-1/2 left-4 -translate-y-1/2 text-ink/45" size={21} aria-hidden="true" />
          <input className="field pl-12 font-mono tracking-wider uppercase" value={code} onChange={(event) => setCode(event.target.value)} required placeholder="UNS-00000-00000" autoComplete="off" />
        </span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        <span><Trash size={20} aria-hidden="true" /> I understand this removes the contribution from public view.</span>
      </label>
      <button className="button-danger" type="submit" disabled={!confirmed || !code || loading}>{loading ? "Removing..." : "Remove contribution"}</button>
      {message ? <p className={removed ? "text-sage" : "text-danger"} role="status">{message}</p> : null}
    </form>
  );
}
