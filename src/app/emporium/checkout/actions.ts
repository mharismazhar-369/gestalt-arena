'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
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

export async function processCheckout(formData: FormData) {
  const campaignId = formData.get('campaignId') as string;

  const userId = await getSecureSession();
  const supabaseAdmin = getSupabaseAdmin();

  // 1. Verify ownership and get the campaign tier directly from the database
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from('campaigns')
    .select('tier')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .single();

  if (campaignError || !campaign) {
    throw new Error("Campaign verification failed.");
  }

  // 2. Determine exact price from the database (ignoring client inputs)
  const { data: tier } = await supabaseAdmin
    .from('platform_tiers')
    .select('price_credits')
    .eq('id', campaign.tier)
    .single();

  const serverVerifiedAmount = tier?.price_credits || 50;

  // 3. Verify user's mock credit balance
  const { data: wallet, error: walletError } = await supabaseAdmin
    .from('user_wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (walletError || !wallet || wallet.balance < serverVerifiedAmount) {
    throw new Error("Insufficient Gestalt Credits.");
  }

  // 4. Deduct amount from user's wallet
  const { error: deductError } = await supabaseAdmin
    .from('user_wallets')
    .update({ balance: wallet.balance - serverVerifiedAmount })
    .eq('user_id', userId);

  if (deductError) throw new Error("Failed to deduct credits.");

  // 5. Write to the immutable transaction ledger
  await supabaseAdmin.from('transaction_ledger').insert([{
    user_id: userId,
    campaign_id: campaignId,
    amount_deducted: serverVerifiedAmount,
    transaction_type: 'campaign_deployment'
  }]);

  // 6. Activate the campaign
  await supabaseAdmin
    .from('campaigns')
    .update({ status: 'active', published_at: new Date().toISOString() })
    .eq('id', campaignId);

  revalidatePath('/emporium', 'layout');
  redirect(`/emporium/${campaignId}?success=true`);
}