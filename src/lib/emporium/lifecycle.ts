export type AdStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'expired' | 'archived';

// Widened to string to support scalable DB tiers like 'platinum' and 'gold'
export type AdTier = 'standard' | 'featured' | 'spotlight' | string;

export interface AdLifecycleMetrics {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
}

export interface EmporiumAd {
    id: string;
    title: string;
    tagline: string;
    description: string;
    category: string;
    targetRole: string; // Widened from strict literal to support dynamic server roles
    tier: string;       // Widened from strict literal to support dynamic server tiers
    status: AdStatus;
    ctaText: string;
    ctaUrl: string;
    durationDays: number;
    createdAt: string;
    publishedAt?: string;
    expiresAt?: string;
    autoRenew: boolean;
    metrics: AdLifecycleMetrics;
}

export const ALLOWED_TRANSITIONS: Record<AdStatus, AdStatus[]> = {
    draft: ['pending_approval', 'archived'],
    pending_approval: ['active', 'draft', 'archived'],
    active: ['paused', 'expired', 'archived'],
    paused: ['active', 'archived'],
    expired: ['active', 'archived'],
    archived: ['draft'],
};

export function calculateExpiry(startDate: Date, durationDays: number): Date {
    const expiry = new Date(startDate);
    expiry.setDate(expiry.getDate() + durationDays);
    return expiry;
}

export function isValidTransition(current: AdStatus, next: AdStatus): boolean {
    return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

export function evaluateRuntimeStatus(ad: EmporiumAd): AdStatus {
    if (ad.status === 'active' && ad.expiresAt) {
        const now = new Date().getTime();
        const expiry = new Date(ad.expiresAt).getTime();
        if (now >= expiry) {
            return 'expired';
        }
    }
    return ad.status;
}

export function calculateCTR(clicks: number, impressions: number): number {
    if (impressions <= 0) return 0;
    return Number(((clicks / impressions) * 100).toFixed(2));
}

export function transitionAdState(
    ad: EmporiumAd,
    nextStatus: AdStatus
): { success: boolean; updatedAd?: EmporiumAd; error?: string } {
    const currentRuntimeStatus = evaluateRuntimeStatus(ad);

    if (!isValidTransition(currentRuntimeStatus, nextStatus)) {
        return {
            success: false,
            error: `Invalid transition from state '${currentRuntimeStatus}' to '${nextStatus}'.`,
        };
    }

    const now = new Date();
    const updatedAd: EmporiumAd = { ...ad, status: nextStatus };

    if (nextStatus === 'active') {
        updatedAd.publishedAt = now.toISOString();
        updatedAd.expiresAt = calculateExpiry(now, ad.durationDays).toISOString();
    }

    return { success: true, updatedAd };
}