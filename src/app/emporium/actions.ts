'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// The Service Role client bypasses RLS for administrative financial updates
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Validates the session and returns the secure user ID from the browser cookies.
 */
async function getSecureSession() {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Critical System Error: Missing Supabase environment variables.");
    }

    const supabaseAuth = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set({ name, value, ...options });
                        });
                    } catch (error) { }
                },
            },
        }
    );

    const { data: { user }, error } = await supabaseAuth.auth.getUser();

    if (error || !user) {
        console.error("Auth Verification Failed:", error);
        throw new Error("Unauthorized Access: Session Invalid.");
    }

    return user.id;
}

// ==========================================
// 1. DATA FETCHING (Dictionaries & Feed)
// ==========================================

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

// ==========================================
// 2. CAMPAIGN CREATION & LIFECYCLE
// ==========================================

export async function createCampaign(formData: any) {
    const userId = await getSecureSession();
    const campaignId = `ad-${Date.now()}`;

    const newCampaign = {
        ...formData,
        id: campaignId,
        user_id: userId,
        target_role: formData.targetRole,
        cta_text: formData.ctaText,
        cta_url: formData.ctaUrl,
        duration_days: formData.durationDays,
        status: 'pending_approval',
    };

    delete newCampaign.targetRole;
    delete newCampaign.ctaText;
    delete newCampaign.ctaUrl;
    delete newCampaign.durationDays;

    const { error } = await supabaseAdmin.from('campaigns').insert([newCampaign]);

    if (error) {
        console.error("SUPABASE INSERTION ERROR:", error);
        throw new Error("Failed to secure campaign payload.");
    }

    revalidatePath('/emporium');
    redirect(`/emporium/checkout/${campaignId}`);
}

export async function updateCampaignStatus(campaignId: string, newStatus: string) {
    const userId = await getSecureSession();

    const { error } = await supabaseAdmin
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId)
        .eq('user_id', userId);

    if (error) throw new Error("Unauthorized: Failed to update campaign status.");

    revalidatePath('/emporium');
}

// ==========================================
// 3. FINANCIAL TRANSACTIONS (Zero Trust)
// ==========================================

export async function processCheckout(formData: FormData) {
    const userId = await getSecureSession();
    const campaignId = formData.get('campaignId') as string;
    const amount = Number(formData.get('amount'));

    // 1. Verify exact balance
    const { data: wallet, error: walletError } = await supabaseAdmin
        .from('user_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

    if (walletError || !wallet || wallet.balance < amount) {
        throw new Error("Insufficient Gestalt Credits or wallet not found.");
    }

    // 2. Deduct credits STRICTLY (Forces an error if 0 rows update)
    const { error: deductError } = await supabaseAdmin
        .from('user_wallets')
        .update({ balance: wallet.balance - amount })
        .eq('user_id', userId)
        .select()
        .single();

    if (deductError) {
        console.error("❌ DEDUCTION ERROR:", deductError);
        throw new Error("Transaction failed during credit deduction.");
    }

    // 3. Write to immutable ledger
    const { error: ledgerError } = await supabaseAdmin.from('transaction_ledger').insert([{
        user_id: userId,
        campaign_id: campaignId,
        amount_deducted: amount,
        transaction_type: 'campaign_deployment'
    }]);

    if (ledgerError) console.error("❌ LEDGER ERROR:", ledgerError);

    // 4. Activate the campaign STRICTLY
    const { error: campaignError } = await supabaseAdmin
        .from('campaigns')
        .update({ status: 'active', published_at: new Date().toISOString() })
        .eq('id', campaignId)
        .eq('user_id', userId)
        .select()
        .single();

    if (campaignError) {
        console.error("❌ ACTIVATION ERROR:", campaignError);
        throw new Error("Database failed to update campaign status.");
    }

    // 5. Nuke the Next.js cache for the entire Emporium layout tree
    revalidatePath('/emporium', 'layout');
    redirect(`/emporium/${campaignId}?success=true`);
}