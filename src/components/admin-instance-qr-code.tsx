"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

interface AdminInstanceQRCodeProps {
  joinCode: string;
  instanceTitle: string;
}

export default function AdminInstanceQRCode({ joinCode, instanceTitle }: AdminInstanceQRCodeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/feedback/${joinCode}`;

  useEffect(() => {
    QRCode.toDataURL(feedbackUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    }).then(setQrCodeDataUrl).catch(console.error);
  }, [feedbackUrl]);

  if (!qrCodeDataUrl) {
    return null;
  }

  return (
    <>
      {/* Small Floating QR Code */}
      <div 
        className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 z-40 cursor-pointer rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md p-1.5 sm:p-3 shadow-sm transition-all hover:scale-105 hover:shadow-md"
        onClick={() => setIsModalOpen(true)}
        title="Click to enlarge QR code"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={qrCodeDataUrl} 
            alt={`QR code for ${instanceTitle} feedback`}
            className="h-12 w-12 sm:h-16 sm:w-16"
          />
          <div className="hidden sm:flex flex-col">
            <p className="text-xs font-semibold text-slate-800">Join Code</p>
            <p className="text-sm font-mono font-bold text-slate-900">{joinCode}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="max-h-[90vh] max-w-4xl w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">QR Code for Feedback</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col items-center space-y-6">
              {/* Large QR Code Image */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={qrCodeDataUrl} 
                  alt={`QR code for ${instanceTitle} feedback`}
                  className="w-full max-w-[20rem] sm:max-w-[32rem] md:max-w-[40rem] h-auto aspect-square"
                />
              </div>

              {/* Join Code Display */}
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="mb-2 text-sm font-medium text-slate-600">Join Code:</p>
                <p className="text-3xl font-mono font-bold text-slate-900">{joinCode}</p>
              </div>
              
              {/* Feedback URL */}
              <div className="w-full">
                <p className="mb-2 text-sm font-medium text-slate-600">Feedback URL:</p>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="break-all text-base text-slate-800 font-mono">{feedbackUrl}</p>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-blue-900">How to share:</span> Share this QR code or URL with students to collect their feedback. 
                  Students can scan the QR code with their mobile devices to access the feedback form.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
