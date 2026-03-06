import { createClient } from '@supabase/supabase-js';
import { sanitizeString, sanitizeEmail, sanitizePhone } from './_utils/sanitize.js';

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
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please fill in your name, email, and message.'
            });
        }

        // Sanitize
        const sanitizedName = sanitizeString(name, 100);
        const sanitizedEmail = sanitizeEmail(email);
        const sanitizedPhone = phone ? sanitizePhone(phone) : null;
        const sanitizedSubject = subject ? sanitizeString(subject, 200) : 'General Inquiry';
        const sanitizedMessage = sanitizeString(message, 2000);

        if (!sanitizedName) {
            return res.status(400).json({ success: false, error: 'Please provide a valid name.' });
        }
        if (!sanitizedEmail) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }
        if (!sanitizedMessage) {
            return res.status(400).json({ success: false, error: 'Please provide a message.' });
        }

        const { data, error } = await supabase
            .from('contact_messages')
            .insert({
                name: sanitizedName,
                email: sanitizedEmail,
                phone: sanitizedPhone,
                subject: sanitizedSubject,
                message: sanitizedMessage,
                status: 'unread'
            })
            .select('id')
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({
                success: false,
                error: 'We could not save your message. Please try again or call us directly.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Message sent successfully! We\'ll get back to you soon.'
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred. Please try again later.'
        });
    }
}
