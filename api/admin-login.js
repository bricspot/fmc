import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ success: false, error: 'Server configuration error: Database credentials missing.' });
  }

  // Admin client with service role for DB operations (rate limiting)
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Auth client with anon key for signInWithPassword
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabaseAuth = anonKey
    ? createClient(process.env.SUPABASE_URL, anonKey)
    : supabaseAdmin;

  const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const { email, password, recaptchaToken } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';

    // 1. Verify reCAPTCHA (if secret key is configured)
    if (RECAPTCHA_SECRET && recaptchaToken) {
      try {
        const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`
        });
        const recaptchaData = await recaptchaRes.json();
        if (!recaptchaData.success || recaptchaData.score < 0.3) {
          return res.status(403).json({ success: false, error: 'Security verification failed. Please try again.' });
        }
      } catch (e) {
        console.error('reCAPTCHA verify error:', e);
        // Don't block if reCAPTCHA service is down, but log it
      }
    }

    // 2. Check rate limiting
    const { data: attempts } = await supabaseAdmin
      .from('login_attempts')
      .select('*')
      .eq('ip_address', ip)
      .single();

    if (attempts) {
      // Check if currently locked out
      if (attempts.locked_until && new Date(attempts.locked_until) > new Date()) {
        const minutesLeft = Math.ceil((new Date(attempts.locked_until) - new Date()) / 60000);
        return res.status(429).json({ success: false, error: `Too many failed attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.` });
      }

      // Reset if last attempt was more than 15 minutes ago
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      if (new Date(attempts.last_attempt) < fifteenMinsAgo) {
        await supabaseAdmin
          .from('login_attempts')
          .update({ attempt_count: 0, locked_until: null, last_attempt: new Date().toISOString() })
          .eq('ip_address', ip);
        attempts.attempt_count = 0;
      }
    }

    // 3. Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    // 4. Attempt Supabase Auth login using anon key client
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (authError || !authData?.session) {
      // Record failed attempt
      if (attempts) {
        const newCount = attempts.attempt_count + 1;
        const update = { attempt_count: newCount, last_attempt: new Date().toISOString() };
        // Lock after 5 failed attempts for 30 minutes
        if (newCount >= 5) {
          update.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        }
        await supabaseAdmin.from('login_attempts').update(update).eq('ip_address', ip);
      } else {
        await supabaseAdmin.from('login_attempts').insert({ ip_address: ip, attempt_count: 1, last_attempt: new Date().toISOString() });
      }
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // 5. Success - reset attempts
    if (attempts) {
      await supabaseAdmin
        .from('login_attempts')
        .update({ attempt_count: 0, locked_until: null })
        .eq('ip_address', ip);
    }

    return res.status(200).json({
      success: true,
      session: {
        access_token: authData.session.access_token,
        expires_at: authData.session.expires_at,
        user_email: authData.user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
  }
}
