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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          style={{ width: '100%', padding: '10px', fontFamily: 'inherit', border: '2px solid #ccc' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          style={{ width: '100%', padding: '10px', fontFamily: 'inherit', border: '2px solid #ccc' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px' }}>Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={5}
          style={{ width: '100%', padding: '10px', fontFamily: 'inherit', border: '2px solid #ccc' }}
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
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>

      {status === 'success' && (
        <div style={{ padding: '10px', background: '#DFF0D8', border: '2px solid #3C763D', color: '#3C763D' }}>
            Message sent successfully to backend!
        </div>
      )}

      {status === 'demo-success' && (
        <div style={{ padding: '10px', background: '#FCF8E3', border: '2px solid #8A6D3B', color: '#8A6D3B' }}>
            <strong>Demo Mode:</strong> Backend not connected, but form submission simulated successfully!
        </div>
      )}

      {status === 'error' && (
        <p style={{ color: 'red' }}>Failed to send message. Please try again.</p>
      )}
    </form>
  )
}

export default ContactForm
