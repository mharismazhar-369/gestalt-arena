import React from 'react';

export default function GestaltCoin({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* The core 'G' shape, aggressively geometric */}
            <path d="M17 9c-.8-2.5-3-4.5-6.5-4.5C6 4.5 3.5 8 3.5 12s2.5 7.5 7 7.5 6.5-2.5 6.5-6H11" />
            {/* The proprietary dual-angled strike-through */}
            <path d="M15 2L10 22" className="text-orange-500" strokeWidth="2" />
            <path d="M19 2L14 22" className="text-orange-500" strokeWidth="2" opacity="0.4" />
        </svg>
    );
}