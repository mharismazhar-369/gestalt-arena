import Link from 'next/link';
import React from 'react';

export function formatPostText(content: string) {
    if (!content) return content;

    // Regex to match hashtags (# followed by alphanumeric characters)
    const parts = content.split(/(#[A-Za-z0-9_]+)/g);

    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            const tag = part.substring(1); // remove the # for the search query
            return (
                <Link
                    key={index}
                    href={`/feed?tag=${tag}`}
                    className="text-[var(--accent)] font-bold hover:underline inline-block"
                    onClick={(e) => e.stopPropagation()} // Prevent card click conflicts
                >
                    {part}
                </Link>
            );
        }
        return part;
    });
}