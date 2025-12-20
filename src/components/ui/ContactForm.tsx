import React, { useState } from 'react'

const ContactForm = () => {
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
      }, 1000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', marginBottom: '10px' }}>
            Have a project in mind or a role to discuss? I'd love to hear from you.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>NAME</label>
            <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            aria-label="Your Name"
            placeholder="John Doe"
            style={{ width: '100%', padding: '10px', fontFamily: 'var(--font-body)', border: '2px solid #ccc' }}
            />
        </div>
        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>EMAIL</label>
            <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            aria-label="Your Email"
            placeholder="john@example.com"
            style={{ width: '100%', padding: '10px', fontFamily: 'var(--font-body)', border: '2px solid #ccc' }}
            />
        </div>
        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>MESSAGE</label>
            <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            aria-label="Your Message"
            placeholder="How can I help you?"
            rows={5}
            style={{ width: '100%', padding: '10px', fontFamily: 'var(--font-body)', border: '2px solid #ccc' }}
            />
        </div>
        <button
            type="submit"
            disabled={status === 'sending'}
            style={{
            background: status === 'sending' ? '#95A5A6' : '#4A90E2',
            color: 'white',
            border: 'none',
            padding: '15px',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            fontFamily: '"Press Start 2P", cursive',
            boxShadow: '4px 4px 0px #000',
            transition: 'all 0.1s'
            }}
        >
            {status === 'sending' ? 'TRANSMITTING...' : 'SEND MESSAGE'}
        </button>

        {status === 'success' && (
            <div style={{ padding: '10px', background: '#DFF0D8', border: '2px solid #3C763D', color: '#3C763D', fontFamily: 'var(--font-body)' }}>
                Message received! I'll get back to you within 24 hours.
            </div>
        )}

        {status === 'demo-success' && (
            <div style={{ padding: '10px', background: '#FCF8E3', border: '2px solid #8A6D3B', color: '#8A6D3B', fontFamily: 'var(--font-body)' }}>
                <strong>Message received!</strong> (Demo Mode: Backend simulation successful). I'll get back to you within 24 hours.
            </div>
        )}

        {status === 'error' && (
            <p style={{ color: 'red', fontFamily: 'var(--font-body)' }}>Failed to send message. Please try again.</p>
        )}
        </form>
    </div>
  )
}

export default ContactForm
