import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getEmporiumConfig() {
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