'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function processCheckout(formData: FormData) {
    const campaignId = formData.get('campaignId') as string;
    const amount = Number(formData.get('amount'));

    // ==========================================
    // FUTURE: LEMON SQUEEZY IMPLEMENTATION
    // ==========================================
    /*
    const lsCheckoutUrl = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              custom: { campaign_id: campaignId } // Crucial: Pass the ID so the webhook knows what to activate
            }
          },
          relationships: {
            store: { data: { type: "stores", id: process.env.LS_STORE_ID } },
            variant: { data: { type: "variants", id: process.env.LS_VARIANT_ID } }
          }
        }
      })
    }).then(res => res.json());
  
    redirect(lsCheckoutUrl.data.attributes.url);
    */

    // ==========================================
    // CURRENT: MOCK GESTALT CREDIT SYSTEM
    // ==========================================

    // 1. Check user's mock credit balance in DB
    // 2. Deduct 'amount' from user's wallet
    // 3. Update campaign status from 'pending_approval' to 'active'
    // await supabase.from('campaigns').update({ status: 'active' }).eq('id', campaignId);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    revalidatePath('/emporium');
    redirect(`/emporium/${campaignId}?success=true`);
}