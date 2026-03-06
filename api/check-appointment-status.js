import { createClient } from '@supabase/supabase-js';
import { sanitizePhone } from './_utils/sanitize.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { phone, reference } = req.body;

        if (!phone || !reference) {
            return res.status(400).json({
                success: false,
                error: 'Please provide both your phone number and appointment reference.'
            });
        }

        const sanitizedPhone = sanitizePhone(phone);
        if (!sanitizedPhone) {
            return res.status(400).json({ success: false, error: 'Please provide a valid phone number.' });
        }

        const refUpper = reference.trim().toUpperCase();
        if (refUpper.length < 8) {
            return res.status(400).json({ success: false, error: 'Reference number must be at least 8 characters.' });
        }

        // Query appointments by phone number
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select('id, service, branch, preferred_date, preferred_time, full_name, status, created_at')
            .eq('phone', sanitizedPhone)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ success: false, error: 'Could not look up your appointment.' });
        }

        // Match by first 8 chars of UUID (case insensitive)
        const match = appointments?.find(a => a.id.substring(0, 8).toUpperCase() === refUpper.substring(0, 8));

        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'No appointment found with that phone and reference combination. Please check your details.'
            });
        }

        return res.status(200).json({
            success: true,
            appointment: {
                reference: match.id.substring(0, 8).toUpperCase(),
                service: match.service,
                branch: match.branch,
                date: match.preferred_date,
                time: match.preferred_time,
                patient_name: match.full_name,
                status: match.status,
                booked_on: match.created_at
            }
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
    }
}
