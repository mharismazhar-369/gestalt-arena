import { createClient } from '@supabase/supabase-js';

// Lazy initialization with a safety net for the build compiler
const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If keys are missing (e.g., during cloud deployment), return null instead of crashing
    if (!url || !key) {
        console.warn("⚠️ Supabase keys missing. Operating in degraded mode.");
        return null;
    }

    return createClient(url, key);
};

export async function getEmporiumConfig() {
    const supabaseAdmin = getSupabaseAdmin();

    // Fallback dictionary if the database connection cannot be established
    if (!supabaseAdmin) {
        return { categories: [], targetRoles: [], tiers: [] };
    }

    const [categories, roles, tiers] = await Promise.all([
        supabaseAdmin.from('platform_categories').select('*'),
        supabaseAdmin.from('platform_roles').select('*'),
        supabaseAdmin.from('platform_tiers').select('*')
    ]);

    return {
        categories: categories.data || [],
        targetRoles: roles.data || [],
        tiers: tiers.data || []
    };
}

export async function getCampaignsFromDB() {
    const supabaseAdmin = getSupabaseAdmin();

    // Return an empty feed if the database connection cannot be established
    if (!supabaseAdmin) return [];

    const { data, error } = await supabaseAdmin
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map(ad => ({
        ...ad,
        userId: ad.user_id,
        targetRole: ad.target_role,
        ctaText: ad.cta_text,
        ctaUrl: ad.cta_url,
        durationDays: ad.duration_days,
        createdAt: ad.created_at,
        metrics: {
            impressions: ad.impressions || 0,
            clicks: ad.clicks || 0,
            ctr: 0,
            conversions: ad.conversions || 0
        }
    }));
}