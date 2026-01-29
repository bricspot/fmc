import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { method } = req;

    // Handle POST: Saving Data
    if (method === 'POST') {
        try {
            const { type, data } = req.body;

            if (!type || !data) {
                return res.status(400).json({ error: 'Missing type or data' });
            }

            const key = type === 'appointment' ? 'focusAppointments' : 'focusContacts';

            // Get existing data
            const existing = await kv.get(key) || [];

            // Add metadata
            const newItem = {
                ...data,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                status: type === 'appointment' ? 'pending' : 'unread'
            };

            existing.push(newItem);

            // Save back to KV
            await kv.set(key, existing);

            return res.status(200).json({ success: true, item: newItem });
        } catch (error) {
            console.error('KV Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Handle GET: Retrieving Data (for Admin)
    if (method === 'GET') {
        try {
            const { password, type } = req.query;

            // Simple security check using the default admin password
            if (password !== 'Focus2024!') {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const key = type === 'appointments' ? 'focusAppointments' : 'focusContacts';
            const data = await kv.get(key) || [];

            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
