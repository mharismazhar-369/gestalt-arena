import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-signature');
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

        // 1. Verify the payload actually came from Lemon Squeezy
        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature || '', 'utf8');

        if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);

        // 2. Process the successful payment
        if (payload.meta.event_name === 'order_created') {
            const customData = payload.meta.custom_data;
            const campaignId = customData.campaign_id;

            // TODO: Update campaign status in database to 'active'
            // await supabase.from('campaigns').update({ status: 'active' }).eq('id', campaignId);

            console.log(`Successfully activated campaign: ${campaignId}`);
        }

        return NextResponse.json({ status: 'success' }, { status: 200 });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}