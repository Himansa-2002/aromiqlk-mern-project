import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

// POST /api/newsletter
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      if (!existing.subscribed) {
        existing.subscribed = true;
        await existing.save();
      }
      return res.json({ success: true, message: 'Subscription confirmed.' });
    }

    await NewsletterSubscriber.create({ email });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/newsletter/unsubscribe
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    const sub = await NewsletterSubscriber.findOneAndUpdate({ email }, { subscribed: false }, { new: true });
    if (!sub) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Admin: Newsletter (Module 13) ----

// GET /api/admin/newsletter/subscribers
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/newsletter/export — returns CSV text
export const exportSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find({ subscribed: true });
    const csv = ['email,subscribedAt', ...subscribers.map(s => `${s.email},${s.createdAt.toISOString()}`)].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('subscribers.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
