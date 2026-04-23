'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="zh-TW">
      <body style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        color: '#0f172a',
        padding: '1.5rem',
        margin: 0,
      }}>
        <div style={{
          maxWidth: '28rem',
          width: '100%',
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
            應用程式發生嚴重錯誤
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1.5rem' }}>
            請嘗試重新整理頁面。若問題持續，請聯繫支援人員。
          </p>
          <button
            onClick={reset}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            重試
          </button>
        </div>
      </body>
    </html>
  )
}
