import { createClient } from '@supabase/supabase-js';
import { sanitizeEmail } from './_utils/sanitize.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ success: false, error: 'Server configuration error: Database credentials missing.' });
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide an email address.' });
        }

        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }

        // Check for existing subscription
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id, is_active')
            .eq('email', sanitizedEmail)
            .single();

        if (existing) {
            if (existing.is_active) {
                return res.status(200).json({
                    success: true,
                    message: "You're already subscribed! Thank you for staying connected."
                });
            } else {
                // Re-activate
                await supabase
                    .from('newsletter_subscribers')
                    .update({ is_active: true, subscribed_at: new Date().toISOString() })
                    .eq('id', existing.id);

                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! Your subscription has been reactivated.'
                });
            }
        }

        // Insert new subscriber
        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert({ email: sanitizedEmail, is_active: true });

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({
                success: false,
                error: 'Could not subscribe. Please try again later.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Successfully subscribed! You\'ll receive health tips and updates.'
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred. Please try again later.'
        });
    }
}
