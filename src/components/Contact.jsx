import { useState } from 'react'
import emailjs from '@emailjs/browser'
import useScrollReveal from '../hooks/useScrollReveal'
import styles from './Contact.module.css'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_KEY

export default function Contact() {
  useScrollReveal()
  const [sent, setSent] = useState(null) // null | 'sending' | 'done' | 'error'
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setSent('sending')
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          subject:    form.subject,
          message:    form.message,
        },
        PUBLIC_KEY
      )
      setSent('done')
      setTimeout(() => {
        setSent(null)
        setForm({ name: '', email: '', subject: '', message: '' })
      }, 3000)
    } catch (err) {
      setSent('error')
      setTimeout(() => setSent(null), 3000)
    }
  }

  return (
    <section className={styles.contact} id="contact">
      <div className={styles.glow} />
      <div className="section-header reveal">
        <span className="section-tag">Get In Touch</span>
        <h2 className="section-title">Let's <span className="accent">Work Together</span></h2>
        <p className="section-sub">Have a data challenge? Let's talk about how I can help.</p>
      </div>

      <div className={styles.layout}>
        <div className={`${styles.info} reveal`}>
          <p className={styles.blurb}>
            Whether you need pipelines built, dashboards designed, reporting automated, or just want to
            talk through a data problem — I'm always happy to chat.
          </p>

          <div className={styles.items}>
            {[
              { icon: 'bx-envelope', label: 'Email', value: 'bidpant@gmail.com', href: 'mailto:bidpant@gmail.com' },
              { icon: 'bxl-linkedin', label: 'LinkedIn', value: 'LinkedIn-bidhan', href: 'https://www.linkedin.com/in/bidhan-pant/' },
              { icon: 'bx-map', label: 'Location', value: 'England, United Kingdom', href: null },
            ].map(item => (
              <div key={item.label} className={styles.item}>
                <div className={styles.ciIcon}><i className={`bx ${item.icon}`} /></div>
                <div>
                  <span>{item.label}</span>
                  {item.href
                    ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{item.value}</a>
                    : <span>{item.value}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.availBadge}>
            <div className={styles.availDot} />
            Open to new opportunities
          </div>
        </div>

        <form className={`${styles.form} reveal`} onSubmit={submit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Your name" required />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" required />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Subject</label>
            <input name="subject" value={form.subject} onChange={handle} placeholder="What's this about?" />
          </div>
          <div className={styles.formGroup}>
            <label>Message</label>
            <textarea name="message" rows={5} value={form.message} onChange={handle} placeholder="Tell me about your project or role..." required />
          </div>
          <button type="submit" className={`btn btn-primary btn-full`} disabled={sent === 'sending'}>
            {sent === 'sending' && <><i className="bx bx-loader-alt" /> Sending...</>}
            {sent === 'done'    && <><i className="bx bx-check" /> Message Sent!</>}
            {sent === 'error'   && <><i className="bx bx-error" /> Failed — try again</>}
            {!sent              && <><i className="bx bx-send" /> Send Message</>}
          </button>
        </form>
      </div>
    </section>
  )
}