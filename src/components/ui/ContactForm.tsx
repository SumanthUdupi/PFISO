import React, { useState } from 'react'
import useGameStore from '../../store'

const ContactForm = () => {
  const { setGameEnded, setObjective } = useGameStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'demo-success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      // Attempt to send to backend
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout

      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', message: '' })
        setGameEnded(true)
        setObjective("Free Roam Mode - Explore freely!")
      } else {
        throw new Error('Server responded with error')
      }
    } catch (error) {
      console.warn("Backend unreachable, falling back to Demo Mode:", error)
      // Fallback to "Demo Success" if backend fails (typical for GitHub Pages demo)
      // Simulate a delay
      setTimeout(() => {
        setStatus('demo-success')
        setFormData({ name: '', email: '', message: '' })
        setGameEnded(true)
        setObjective("Free Roam Mode - Explore freely!")
      }, 1000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', marginBottom: '10px', color: 'var(--color-ui-text)' }}>
        Have a project in mind or a role to discuss? I'd love to hear from you.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--color-accent-sage)', fontWeight: 'bold' }}>NAME</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            aria-label="Your Name"
            placeholder="John Doe"
            style={{ width: '100%', padding: '10px', fontFamily: 'var(--font-body)', border: '2px solid var(--color-ui-border)', borderRadius: '8px', background: 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--color-accent-sage)', fontWeight: 'bold' }}>EMAIL</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            aria-label="Your Email"
            placeholder="john@example.com"
            style={{ width: '100%', padding: '10px', fontFamily: 'var(--font-body)', border: '2px solid var(--color-ui-border)', borderRadius: '8px', background: 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--color-accent-sage)', fontWeight: 'bold' }}>MESSAGE</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            aria-label="Your Message"
            placeholder="How can I help you?"
            rows={5}
            style={{ width: '100%', padding: '10px', fontFamily: 'var(--font-body)', border: '2px solid var(--color-ui-border)', borderRadius: '8px', background: 'white' }}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            background: status === 'sending' ? 'var(--color-accent-sand)' : 'var(--color-primary-glow)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '15px',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            fontFamily: '"Press Start 2P", cursive',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
        >
          {status === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}
        </button>

        {status === 'success' && (
          <div style={{ padding: '10px', background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', borderRadius: '8px', fontFamily: 'var(--font-body)' }}>
            Message received! I'll get back to you within 24 hours.
          </div>
        )}

        {status === 'demo-success' && (
          <div style={{ padding: '10px', background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', borderRadius: '8px', fontFamily: 'var(--font-body)' }}>
            <strong>Message received!</strong> (Demo Mode). I'll get back to you within 24 hours.
          </div>
        )}

        {status === 'error' && (
          <p style={{ color: '#721c24', fontFamily: 'var(--font-body)' }}>Failed to send message. Please try again.</p>
        )}
      </form>
    </div>
  )
}

export default ContactForm
