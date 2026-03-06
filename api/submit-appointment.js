import { createClient } from '@supabase/supabase-js';
import { sanitizeString, sanitizeEmail, sanitizePhone } from './_utils/sanitize.js';

export default async function handler(req, res) {
    // Only allow POST
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
        const { service, branch, date, time, fullname, phone, email, dob, reason, first_visit, consent } = req.body;

        // Validate required fields
        if (!service || !branch || !date || !time || !fullname || !phone || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Please fill in all required fields.'
            });
        }

        if (!consent) {
            return res.status(400).json({
                success: false,
                error: 'You must consent to data processing to book an appointment.'
            });
        }

        // Sanitize inputs
        const sanitizedFullName = sanitizeString(fullname, 100);
        const sanitizedPhone = sanitizePhone(phone);
        const sanitizedEmail = email ? sanitizeEmail(email) : null;
        const sanitizedReason = sanitizeString(reason, 1000);
        const sanitizedService = sanitizeString(service, 100);
        const sanitizedBranch = sanitizeString(branch, 150);
        const sanitizedTime = sanitizeString(time, 50);

        if (!sanitizedFullName) {
            return res.status(400).json({ success: false, error: 'Please provide a valid full name.' });
        }
        if (!sanitizedPhone) {
            return res.status(400).json({ success: false, error: 'Please provide a valid phone number (10-15 digits).' });
        }
        if (email && !sanitizedEmail) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ success: false, error: 'Invalid date format.' });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                service: sanitizedService,
                branch: sanitizedBranch,
                preferred_date: date,
                preferred_time: sanitizedTime,
                full_name: sanitizedFullName,
                phone: sanitizedPhone,
                email: sanitizedEmail,
                date_of_birth: dob || null,
                reason: sanitizedReason,
                is_first_visit: !!first_visit,
                consent_given: true,
                status: 'pending'
            })
            .select('id')
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({
                success: false,
                error: 'We could not save your appointment. Please try again or call us directly.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Appointment booked successfully',
            id: data.id
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred. Please try again later.'
        });
    }
}
