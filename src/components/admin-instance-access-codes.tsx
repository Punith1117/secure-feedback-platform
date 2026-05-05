"use client";

import { useState, useEffect } from "react";
import type { StudentAccessCode } from "@/lib/db/schema";
import jsPDF from "jspdf";
import { Realtime } from "ably";

type AdminInstanceAccessCodesProps = {
  instanceId: string;
  initialAccessCodes: StudentAccessCode[];
  adminUsername?: string;
  joinCode?: string;
  instanceTitle?: string;
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
  adminUsername = "Admin",
  joinCode = "N/A",
  instanceTitle = "Feedback Instance",
}: AdminInstanceAccessCodesProps) {
  const [accessCodes, setAccessCodes] = useState<StudentAccessCode[]>(initialAccessCodes);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [filter, setFilter] = useState<"all" | "available" | "used">("all");

  // Subscribe to Ably for real-time access code updates
  useEffect(() => {
    if (!joinCode || joinCode === "N/A") return;

    const ably = new Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY || "");
    const channel = ably.channels.get(`access-codes:${joinCode}`);

    channel.subscribe((message: unknown) => {
      const data = (message as { data: { accessCodeId: string; code: string; instanceId: string; timestamp: string } }).data;

      setAccessCodes((prev) =>
        prev.map((code) =>
          code.id === data.accessCodeId
            ? { ...code, used: true, usedAt: new Date(data.timestamp) }
            : code
        )
      );
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [joinCode]);

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

  const handleCopyAllAvailable = async () => {
    if (accessCodes.length == 0) return;
    const availableCodes = accessCodes.filter(c => !c.used).map(c => c.code).join('\n');
    await navigator.clipboard.writeText(availableCodes);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrintPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add header page with instance info
      pdf.setFontSize(20);
      pdf.text(instanceTitle, 105, 30, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text(`Admin: ${adminUsername}`, 105, 50, { align: 'center' });
      pdf.text(`Join Code: ${joinCode}`, 105, 65, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 105, 80, { align: 'center' });

      pdf.setFontSize(16);
      pdf.text('Available Access Codes', 105, 100, { align: 'center' });

      // Get available codes
      const availableCodes = accessCodes.filter(c => !c.used);
      
      if (availableCodes.length === 0) {
        pdf.setFontSize(12);
        pdf.text('No available access codes', 105, 140, { align: 'center' });
      } else {
        // Simple pagination: 2 columns, 14 rows per page = 28 codes per page
        const codesPerPage = 24;
        const totalPages = Math.ceil(availableCodes.length / codesPerPage);
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
            // Add page header
            pdf.setFontSize(14);
            pdf.text(`${instanceTitle} - Page ${page + 1}`, 105, 20, { align: 'center' });
            pdf.setFontSize(12);
            pdf.text('Available Access Codes (continued)', 105, 30, { align: 'center' });
          }
          
          const startIndex = page * codesPerPage;
          const endIndex = Math.min(startIndex + codesPerPage, availableCodes.length);
          const pageCodes = availableCodes.slice(startIndex, endIndex);
          
          // Draw codes in 2-column grid
          const startY = page === 0 ? 120 : 50;
          const columnWidth = 95;
          const leftMargin = 10;
          const rightMargin = 105;
          const rowHeight = 15;
          
          pageCodes.forEach((code, index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const x = column === 0 ? leftMargin : rightMargin;
            const y = startY + (row * rowHeight);
            
            // Draw code box
            pdf.setDrawColor(200);
            pdf.rect(x - 2, y - 8, columnWidth, 12);
            
            // Add code number and value
            pdf.setFontSize(10);
            pdf.text(`#${startIndex + index + 1}`, x, y - 2);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(code.code, x + 15, y - 2);
            pdf.setFont('helvetica', 'normal');
          });
        }
      }
      
      pdf.save(`access-codes-${joinCode}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Access Codes</h2>
          <p className="text-sm text-slate-600">Student access codes for this feedback instance.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopyAllAvailable} className="text-blue-700 hover:bg-gray-100 rounded-xl px-3 py-1.5 cursor-pointer">
            {copiedAll ? 'Available copied' : 'Copy available'}
          </button>
          <button onClick={handlePrintPDF} className="text-green-700 hover:bg-green-100 rounded-xl px-3 py-1.5 cursor-pointer">
            Print Available
          </button>
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
          {availableCount} Available
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
          {usedCount} Used
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
    </>
  );
}
