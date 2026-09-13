import { NextRequest, NextResponse } from 'next/server';
import { processMockSubscription } from '@/lib/payments/mockGateway';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Note: Next.js 15+ resolves params asynchronously
) {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') as 'startup' | 'investor';
    const cycle = searchParams.get('cycle') as 'monthly' | 'biannual' | 'annual';

    // Resolve params
    const { id } = await params;
    const tierId = id as 'gold' | 'platinum';

    if (!role || !cycle || !tierId) {
        return NextResponse.redirect(new URL('/pricing?error=invalid_parameters', request.url));
    }

    // Verify Session Securely
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
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Execute the mock financial deduction
        const result = await processMockSubscription(user.id, role, tierId, cycle);

        // Success: Redirect away from 404 directly to the Invoice confirmation
        return NextResponse.redirect(new URL(`/invoice/${result.transactionId}`, request.url));
    } catch (error: any) {
        // Insufficient funds or error: Kick back to pricing page
        return NextResponse.redirect(new URL(`/pricing?error=${encodeURIComponent(error.message)}`, request.url));
    }
}