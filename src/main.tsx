import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// PERF-035: Log Spam (Strip in Prod)
if (process.env.NODE_ENV === 'production') {
  console.log = () => { }
  console.info = () => { }
  // keeping warn/error for telemetry
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
