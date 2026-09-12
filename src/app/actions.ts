'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function trackInteractionAction(eventType: "CLICK" | "INPUT", element: string, metadata?: any) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('log_telemetry_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_element: element,
        p_metadata: metadata || {}
    });
}