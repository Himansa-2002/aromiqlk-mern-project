import express from 'express';
import {
  submitContactForm, getMessages, markRead, markReplied, closeMessage, addNote,
} from '../controllers/contactController.js';

const router = express.Router();

router.post('/', submitContactForm);
router.get('/admin/all', getMessages);
router.patch('/admin/:id/read', markRead);
router.patch('/admin/:id/replied', markReplied);
router.patch('/admin/:id/close', closeMessage);
router.patch('/admin/:id/notes', addNote);

export default router;
