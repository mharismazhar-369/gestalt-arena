import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Bypass RLS securely for server-side financial ledger operations
const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Matching pricing matrix from PricingPage
const PRICING = {
    startup: {
        gold: { monthly: 19, biannual: 99, annual: 169 },
        platinum: { monthly: 69, biannual: 349, annual: 599 },
    },
    investor: {
        gold: { monthly: 38, biannual: 198, annual: 338 },
        platinum: { monthly: 138, biannual: 698, annual: 1198 },
    },
};

export async function processMockSubscription(
    userId: string,
    role: 'startup' | 'investor',
    tier: 'gold' | 'platinum',
    cycle: 'monthly' | 'biannual' | 'annual'
) {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Calculate base USD price
    const usdPrice = PRICING[role]?.[tier]?.[cycle];
    if (!usdPrice) throw new Error("Invalid subscription plan parameters.");

    // 2. Fetch Exact Exchange Rate (1G = $1)
    const { data: rateData } = await supabaseAdmin
        .from('exchange_rates')
        .select('usd_rate')
        .eq('currency_code', 'G')
        .single();

    const exchangeRate = rateData?.usd_rate || 1.00;
    const gCoinCost = Math.ceil(usdPrice / exchangeRate); // Conversion Math

    // 3. Verify User Wallet Balance
    const { data: wallet } = await supabaseAdmin
        .from('user_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

    if (!wallet || wallet.balance < gCoinCost) {
        throw new Error(`Insufficient funds. Plan costs ${gCoinCost}G, but balance is ${wallet?.balance || 0}G.`);
    }

    // 4. Deduct G-Coins from Wallet
    const { error: walletError } = await supabaseAdmin
        .from('user_wallets')
        .update({
            balance: wallet.balance - gCoinCost,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    if (walletError) throw new Error("Failed to process G-Coin deduction.");

    // 5. Upgrade Profile Tier
    const { error: tierError } = await supabaseAdmin
        .from('profiles')
        .update({ tier: tier, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (tierError) throw new Error("Failed to apply tier upgrade to profile.");

    // 6. Record Immutable Transaction
    const txId = uuidv4();
    await supabaseAdmin.from('transaction_ledger').insert([{
        id: txId,
        user_id: userId,
        amount_deducted: gCoinCost,
        transaction_type: `subscription_${tier}_${cycle}` // Distinguishes from campaigns
    }]);

    return { success: true, transactionId: txId, amount: gCoinCost };
}