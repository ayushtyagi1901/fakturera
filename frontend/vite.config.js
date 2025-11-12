import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '7421544600a1.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})
