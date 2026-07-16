"use client";

import { useEffect } from "react";

const SIZES: Record<string, string> = {
  A5: "14.8cm 21cm",
  A4: "21cm 29.7cm",
  B5: "17.6cm 25cm",
};

export function Paper({
  size = "A4",
  landscape = true,
  ready = true,
  autoPrint = true,
  children,
}: {
  size?: string;
  landscape?: boolean;
  ready?: boolean;
  autoPrint?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (ready && autoPrint) {
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, [ready, autoPrint]);

  const dim = SIZES[size] ?? SIZES.A4;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');
        @page { size: ${dim} ${landscape ? "landscape" : ""}; margin: 1.4cm; }
        html, body { margin: 0; padding: 0; background: #fff; }
        .print-root { font-family: 'Sarabun', sans-serif; color: #0f3e92; }
        @media screen {
          body { background: #e8eefc; }
          .print-root { background: #fff; margin: 24px auto; padding: 2cm; max-width: 900px;
            box-shadow: 0 4px 24px rgba(0,86,150,.15); border-radius: 8px; }
        }
      `,
        }}
      />
      <div className="print-root">{children}</div>
    </>
  );
}
