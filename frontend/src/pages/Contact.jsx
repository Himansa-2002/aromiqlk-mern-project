import { useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", subject: "", message: "" });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ fullName: "", phone: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const infoRow = (icon, label, value) => (
    <div className="flex gap-4 py-4 border-b border-line last:border-b-0">
      <div className="text-gold mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <h5 className="text-xs uppercase tracking-wider text-gold mb-1">{label}</h5>
        <div className="text-sm text-muted">{value}</div>
      </div>
    </div>
  );

  return (
    <>
      <section className="py-16 border-b border-line bg-gradient-to-br from-gold/10 to-transparent">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Get In Touch</span>
          <h1 className="font-display font-semibold text-4xl md:text-5xl mt-2.5">Contact Us</h1>
          <div className="text-xs text-muted mt-3"><Link to="/" className="text-gold">Home</Link> / Contact Us</div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-[0.85fr_1.15fr] gap-14">

          <div className="border border-line bg-panel p-8">
            {infoRow(
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.6.7 5 2 7.1L3 29l6.4-2.2c2 1.1 4.3 1.7 6.6 1.7 7 0 12.7-5.7 12.7-12.8C28.7 8.7 23 3 16 3Z" /></svg>,
              "Phone / WhatsApp",
              <a href="tel:0788778808" className="hover:text-gold-bright">078 877 8808</a>
            )}
            {infoRow(
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>,
              "Email",
              <a href="mailto:info@aromiq.lk" className="hover:text-gold-bright">info@aromiq.lk</a>
            )}
            {infoRow(
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
              "Instagram",
              <a href="https://instagram.com/aromiq.lk" target="_blank" rel="noreferrer" className="hover:text-gold-bright">@aromiq.lk</a>
            )}
            {infoRow(
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>,
              "Location",
              "Sri Lanka — Islandwide Delivery"
            )}
            {infoRow(
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>,
              "Business Hours",
              <table className="w-full text-xs">
                <tbody>
                  <tr><td className="py-0.5">Monday – Friday</td><td className="py-0.5 text-right text-warm">9:00 AM – 8:00 PM</td></tr>
                  <tr><td className="py-0.5">Saturday</td><td className="py-0.5 text-right text-warm">9:00 AM – 6:00 PM</td></tr>
                  <tr><td className="py-0.5">Sunday</td><td className="py-0.5 text-right text-warm">10:00 AM – 4:00 PM</td></tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="border border-line bg-panel p-10">
            <h3 className="font-display text-2xl mb-6">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-gold">Full Name</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your name" required className="bg-ink border border-line px-3.5 py-3 text-sm text-warm outline-none focus:border-gold" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-gold">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="07X XXX XXXX" className="bg-ink border border-line px-3.5 py-3 text-sm text-warm outline-none focus:border-gold" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-gold">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className="bg-ink border border-line px-3.5 py-3 text-sm text-warm outline-none focus:border-gold" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-gold">Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" className="bg-ink border border-line px-3.5 py-3 text-sm text-warm outline-none focus:border-gold" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-gold">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Write your message..." required className="bg-ink border border-line px-3.5 py-3 text-sm text-warm outline-none focus:border-gold resize-y" />
              </div>
              <button type="submit" disabled={status === "sending"} className="px-8 py-4 text-xs uppercase tracking-widest bg-gradient-to-br from-gold-bright to-gold-deep text-ink font-medium hover:brightness-110 transition disabled:opacity-60">
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
              {status === "success" && <p className="text-gold-bright text-sm">Thanks for reaching out — we'll be in touch soon.</p>}
              {status === "error" && <p className="text-red-400 text-sm">Something went wrong — please try again.</p>}
            </form>
          </div>

        </div>

        <div className="max-w-6xl mx-auto px-8">
          <div className="aspect-[16/7] border border-line bg-panel flex items-center justify-center text-muted text-sm mt-16">
            Google Map embed goes here (once a showroom/office address is confirmed)
          </div>
        </div>
      </section>
    </>
  );
}
