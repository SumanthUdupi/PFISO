import React, { useState } from 'react'
import useGameStore from '../../store'
import { trackEvent } from '../../utils/analytics'

const FeedbackSurvey: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [rating, setRating] = useState(5)
    const [comments, setComments] = useState('')
    const { setHasShownSurvey } = useGameStore()

    const submit = () => {
        trackEvent('feedback_submitted', { rating, comments })
        console.log('Feedback:', { rating, comments })
        // Send to analytics
        setHasShownSurvey()
        onClose()
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '10px',
                maxWidth: '400px',
                width: '90%'
            }}>
                <h2>Feedback Survey</h2>
                <label htmlFor="rating">How would you rate your experience?</label>
                <select id="rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2</option>
                    <option value={3}>3 - Average</option>
                    <option value={4}>4</option>
                    <option value={5}>5 - Excellent</option>
                </select>
                <label htmlFor="comments">Any comments?</label>
                <textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} rows={4} style={{ width: '100%' }} placeholder="Enter your comments here" />
                <button onClick={submit}>Submit</button>
                <button onClick={onClose}>Skip</button>
            </div>
        </div>
    )
}

export default FeedbackSurvey