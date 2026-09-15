'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendConnectionRequest(receiverId: string) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Authentication required')
    }

    if (user.id === receiverId) {
        throw new Error('You cannot send a connection request to yourself')
    }

    // NEW: 1. Prevent Double-Clicks / Duplicate Connections
    // Check if any connection (pending, accepted, etc.) already exists between these two users
    const { data: existingConnection } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .maybeSingle()

    // If a connection already exists, silently return success to avoid crashing, 
    // but do not insert duplicates into the database or notifications.
    if (existingConnection) {
        return { success: true, message: 'Connection already exists' }
    }

    // 2. Safe to insert the new connection
    const { error: connError } = await supabase.from('connections').insert({
        requester_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
    })

    if (connError) {
        throw new Error(`Connection request failed: ${connError.message}`)
    }

    // 3. Safe to insert the single notification
    const { error: notifError } = await supabase.from('notifications').insert({
        user_id: receiverId,
        actor_id: user.id,
        type: 'connection_request',
        message: 'sent you a connection request.'
    })

    if (notifError) {
        console.error('Notification creation failed:', notifError.message)
    }

    revalidatePath(`/profile/${receiverId}`)
    return { success: true }
}

export async function updateConnectionStatus(formData: FormData): Promise<void> {
    const supabase = await createClient()

    const connectionId = formData.get('connectionId') as string;
    const status = formData.get('status') as 'accepted' | 'rejected';

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Authentication required')
    }

    // Update connection status, ensuring only the receiver can modify it
    const { data: connection, error: updateError } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId)
        .eq('receiver_id', user.id)
        .select()
        .single()

    if (updateError) {
        throw new Error(`Status update failed: ${updateError.message}`)
    }

    // Optionally notify the requester that their request was accepted
    if (status === 'accepted' && connection) {
        await supabase.from('notifications').insert({
            user_id: connection.requester_id,
            actor_id: user.id,
            type: 'connection_accepted',
            message: 'accepted your connection request.'
        })
    }

    revalidatePath('/network')
    // No return statement here. Next.js forms expect void.
}

// NEW: Function specifically for the NotificationDropdown inline actions
export async function respondToConnection(actorId: string, status: 'accepted' | 'rejected') {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Authentication required')
    }

    // 1. Update the connection status
    const { error: connectionError } = await supabase
        .from('connections')
        .update({
            status: status,
            accepted_at: status === 'accepted' ? new Date().toISOString() : null
        })
        .eq('requester_id', actorId)
        .eq('receiver_id', user.id)

    if (connectionError) {
        throw new Error(`Status update failed: ${connectionError.message}`)
    }

    // 2. Notify the requester that their request was accepted
    if (status === 'accepted') {
        // Prevent duplicate acceptance notifications if they click multiple times rapidly
        const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', actorId)
            .eq('actor_id', user.id)
            .eq('type', 'connection_accepted')
            .maybeSingle();

        if (!existingNotif) {
            await supabase.from('notifications').insert({
                user_id: actorId,     // The person who originally sent the request
                actor_id: user.id,    // You, accepting the request
                type: 'connection_accepted',
                message: 'accepted your connection request.'
            })
        }
    }

    // 3. Delete the original pending notification so it clears from the dropdown
    await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('actor_id', actorId)
        .eq('type', 'connection_request')

    return { success: true }
}