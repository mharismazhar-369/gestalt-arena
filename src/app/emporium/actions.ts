'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const getSupabaseAdmin = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

async function getSecureSession() {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
            },
        }
    );
    const { data: { user }, error } = await supabaseAuth.auth.getUser();
    if (error || !user) throw new Error("Unauthorized Access.");
    return user.id;
}

// ==========================================
// 1. CAMPAIGN CREATION & LIFECYCLE
// ==========================================

export async function createCampaign(formData: any) {
    const supabaseAdmin = getSupabaseAdmin();
    const userId = await getSecureSession();

    // 1. Server-bound Role & Profile Verification
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role, tier')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        throw new Error("Validation Failed: Unable to verify user role and tier.");
    }

    // 2. Map broad profile.role to a valid foreign key ID in public.platform_roles
    let resolvedCreatorRole = 'startup_seed'; // Default fallback
    if (profile.role === 'investor') {
        resolvedCreatorRole = 'investor_vc';
    } else if (profile.role === 'admin') {
        resolvedCreatorRole = 'all';
    } else if (profile.role === 'startup') {
        resolvedCreatorRole = 'startup_seed';
    }

    const campaignId = `ad-${Date.now()}`;

    // 3. Map payload with strict server-side ownership bindings
    const newCampaign = {
        id: campaignId,
        user_id: userId,
        creator_role: resolvedCreatorRole, // Uses a valid ID from platform_roles
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        category: formData.category,
        target_role: formData.targetRole,
        tier: formData.tier,
        cta_text: formData.ctaText,
        cta_url: formData.ctaUrl,
        company_name: formData.companyName,
        contact_email: formData.contactEmail,
        product_type: formData.productType,
        duration_days: 30,
        status: 'pending_approval',
    };

    const { error } = await supabaseAdmin.from('campaigns').insert([newCampaign]);

    if (error) {
        throw new Error(`Database Insertion Failed: ${error.message}`);
    }

    revalidatePath('/emporium');
    redirect(`/emporium/checkout/${campaignId}`);
}

export async function updateCampaignStatus(campaignId: string, newStatus: string) {
    const supabaseAdmin = getSupabaseAdmin();
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
// 2. FINANCIAL TRANSACTIONS (Zero Trust RPC)
// ==========================================

export async function processCheckout(formData: FormData) {
    const campaignId = formData.get('campaignId') as string;
    const userId = await getSecureSession();
    const supabaseAdmin = getSupabaseAdmin();

    // Trigger the atomic Postgres function
    const { error: rpcError } = await supabaseAdmin.rpc('process_campaign_payment', {
        p_user_id: userId,
        p_campaign_id: campaignId
    });

    if (rpcError) {
        console.error("Transaction Failed:", rpcError.message);
        throw new Error(rpcError.message || "Financial transaction failed.");
    }

    // Invalidate cache and redirect on successful database transaction
    revalidatePath('/emporium', 'layout');
    redirect(`/emporium/${campaignId}?success=true`);
}
// Add this to the bottom of app/emporium/actions.ts

export async function updateCampaignConfig(campaignId: string, formData: FormData) {
    const supabaseAdmin = getSupabaseAdmin();
    const userId = await getSecureSession();

    const updates = {
        title: formData.get('title') as string,
        cta_url: formData.get('ctaUrl') as string,
        description: formData.get('description') as string,
    };

    const { error } = await supabaseAdmin
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId)
        .eq('user_id', userId); // Strictly enforces ownership

    if (error) {
        throw new Error("Failed to update campaign configuration.");
    }

    revalidatePath(`/emporium/${campaignId}`);
    revalidatePath('/emporium');
}
// Add this to the bottom of app/emporium/actions.ts

export async function softDeleteCampaign(campaignId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const userId = await getSecureSession();

    const { error } = await supabaseAdmin
        .from('campaigns')
        .update({ status: 'archived' })
        .eq('id', campaignId)
        .eq('user_id', userId);

    if (error) {
        throw new Error("Unauthorized: Failed to delete campaign.");
    }

    revalidatePath('/emporium');
}