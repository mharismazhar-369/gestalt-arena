"use client";

import { Download } from "lucide-react";

export default function PrintReceiptButton() {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 text-[var(--secondary)]/50 hover:text-[var(--secondary)] bg-transparent"
        >
            <Download size={16} /> Save Receipt
        </button>
    );
}