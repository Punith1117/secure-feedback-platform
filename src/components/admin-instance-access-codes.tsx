"use client";

import { useState } from "react";
import type { StudentAccessCode } from "@/lib/db/schema";

type AdminInstanceAccessCodesProps = {
  instanceId: string;
  initialAccessCodes: StudentAccessCode[];
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function copyToClipboard(text: string, onSuccess: () => void) {
  navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    onSuccess();
  });
}

export default function AdminInstanceAccessCodes({
  instanceId,
  initialAccessCodes,
}: AdminInstanceAccessCodesProps) {
  const [accessCodes] = useState<StudentAccessCode[]>(initialAccessCodes);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "used">("all");

  const filteredCodes = accessCodes.filter((code) => {
    if (filter === "available") return !code.used;
    if (filter === "used") return code.used;
    return true;
  });

  const availableCount = accessCodes.filter((c) => !c.used).length;
  const usedCount = accessCodes.filter((c) => c.used).length;

  function handleCopy(codeId: string, codeValue: string) {
    copyToClipboard(codeValue, () => {
      setCopiedId(codeId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Access Codes</h2>
          <p className="text-sm text-slate-600">Student access codes for this feedback instance.</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-xl bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
            {availableCount} available
          </span>
          <span className="rounded-xl bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {usedCount} used
          </span>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            filter === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("available")}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            filter === "available"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Available
        </button>
        <button
          type="button"
          onClick={() => setFilter("used")}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            filter === "used"
              ? "bg-slate-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Used
        </button>
      </div>

      {filteredCodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
          No access codes found.
        </div>
      ) : (
        <div className="max-h-120 space-y-2 overflow-y-auto">
          {filteredCodes.map((code) => (
            <div
              key={code.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm font-medium text-slate-900">{code.code}</code>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      code.used
                        ? "bg-slate-200 text-slate-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {code.used ? "Used" : "Available"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {code.used ? `Used: ${formatDate(code.usedAt)}` : `Created: ${formatDate(code.createdAt)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(code.id, code.code)}
                className="shrink-0 rounded-xl bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-200"
              >
                {copiedId === code.id ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
