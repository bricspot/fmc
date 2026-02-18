import { kv } from '@vercel/kv';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Focus2024!';

export default async function handler(req, res) {
    const { method } = req;

    // Handle POST: Saving Data (Public)
    if (method === 'POST') {
        try {
            const { type, data } = req.body;

            if (!type || !data) {
                return res.status(400).json({ error: 'Missing type or data' });
            }

            const key = type === 'appointment' ? 'focusAppointments' : 'focusContacts';

            // Get existing data
            const existing = await kv.get(key) || [];

            // Add metadata (respect existing if provided)
            const newItem = {
                id: data.id || Date.now().toString(),
                createdAt: data.createdAt || new Date().toISOString(),
                status: data.status || (type === 'appointment' ? 'pending' : 'unread'),
                ...data
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

            // Simple security check
            if (password !== ADMIN_PASSWORD) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const key = type === 'appointments' ? 'focusAppointments' : 'focusContacts';
            const data = await kv.get(key) || [];

            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Handle PUT: Updating Data (e.g., Status)
    if (method === 'PUT') {
        try {
            const { type, id, updates, password } = req.body;

            // Simple security check
            if (password !== ADMIN_PASSWORD) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!type || !id || !updates) {
                return res.status(400).json({ error: 'Missing type, id, or updates' });
            }

            const key = type === 'appointment' ? 'focusAppointments' : 'focusContacts';

            // Get existing data
            const existing = await kv.get(key);

            if (!existing || !Array.isArray(existing)) {
                return res.status(404).json({ error: 'Database key not found or corrupt' });
            }

            // Find and update item
            const index = existing.findIndex(item => item.id === id);

            if (index !== -1) {
                existing[index] = { ...existing[index], ...updates, updatedAt: new Date().toISOString() };
                await kv.set(key, existing);
                return res.status(200).json({ success: true });
            }

            return res.status(404).json({ error: 'Item not found' });
        } catch (error) {
            console.error('KV PUT Error:', error);
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    // Handle DELETE: Removing Data
    if (method === 'DELETE') {
        try {
            const { type, id, password } = req.body;

            // Simple security check
            if (password !== ADMIN_PASSWORD) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!type || !id) {
                return res.status(400).json({ error: 'Missing type or id' });
            }

            const key = type === 'appointment' ? 'focusAppointments' : 'focusContacts';

            // Get existing data
            const existing = await kv.get(key);

            if (!existing || !Array.isArray(existing)) {
                return res.status(404).json({ error: 'Database key not found or corrupt' });
            }

            // Filter out the item
            const filtered = existing.filter(item => item.id !== id);

            if (filtered.length === existing.length) {
                return res.status(404).json({ error: 'Item not found' });
            }

            // Save back to KV
            await kv.set(key, filtered);

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('KV DELETE Error:', error);
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
