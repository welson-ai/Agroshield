'use client'

import { Toaster } from 'react-hot-toast'

export function ToasterComponent() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#059669',
          color: '#ffffff',
          border: '1px solid #047857',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          duration: 5000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#dc2626',
            secondary: '#ffffff',
          },
        },
        loading: {
          duration: 3000,
          iconTheme: {
            primary: '#059669',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
