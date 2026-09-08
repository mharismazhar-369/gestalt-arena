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

    const { error: connError } = await supabase.from('connections').insert({
        requester_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
    })

    if (connError) {
        throw new Error(`Connection request failed: ${connError.message}`)
    }

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