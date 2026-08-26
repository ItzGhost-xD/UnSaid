"use client";

import { Flag, X } from "@phosphor-icons/react";
import { useState } from "react";

const reportReasons = [
  { value: "private_information", label: "It contains private or identifying information" },
  { value: "unsafe_advice", label: "It encourages something unsafe" },
  { value: "harassment", label: "It targets or attacks someone" },
  { value: "spam", label: "It is spam or promotion" },
  { value: "other", label: "Something else" },
];

export function ReportDialog({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/posts/${postId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "The report could not be sent.");
      setOpen(false);
      setMessage("Report received. Thank you for helping protect the library.");
      setReason("");
      setDetails("");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "The report could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button type="button" className="quiet-link inline-flex items-center gap-2" onClick={() => setOpen(true)}>
        <Flag size={19} aria-hidden="true" /> Report
      </button>
      {message ? <p className="mt-3 text-sm text-sage" role="status">{message}</p> : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="w-full max-w-lg border border-ink bg-paper p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="report-heading">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm tracking-[0.16em] text-sage uppercase">Private report</p>
                <h2 id="report-heading" className="mt-2 text-3xl">Tell the moderation team.</h2>
              </div>
              <button type="button" className="icon-button" aria-label="Close report dialog" onClick={() => setOpen(false)}>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 leading-relaxed text-ink/65">Reports are not shown to the contributor. Repeated reports can temporarily hide an entry for review.</p>
            <form className="mt-6 space-y-5" onSubmit={submitReport}>
              <label className="form-label">
                What is wrong with this entry?
                <select className="field" value={reason} onChange={(event) => setReason(event.target.value)} required>
                  <option value="">Choose a reason</option>
                  {reportReasons.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="form-label">
                Extra detail <span className="text-ink/45">(optional)</span>
                <textarea className="field min-h-24" value={details} maxLength={240} onChange={(event) => setDetails(event.target.value)} />
              </label>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button className="button-quiet" type="button" onClick={() => setOpen(false)}>Cancel</button>
                <button className="button-solid" type="submit" disabled={sending || !reason}>{sending ? "Sending..." : "Send report"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

