import ContactMessage from '../models/ContactMessage.js';

// POST /api/contact
export const submitContactForm = async (req, res) => {
  try {
    const { fullName, phone, email, subject, message } = req.body;
    if (!fullName || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    const saved = await ContactMessage.create({ fullName, phone, email, subject, message });
    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Admin: Contact Message Management (Module 12) ----

// GET /api/admin/contact-messages
export const getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/contact-messages/:id/read
export const markRead = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/contact-messages/:id/replied
export const markReplied = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status: 'replied' }, { new: true });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/contact-messages/:id/close
export const closeMessage = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/contact-messages/:id/notes
export const addNote = async (req, res) => {
  try {
    const { notes } = req.body;
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { notes }, { new: true });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
