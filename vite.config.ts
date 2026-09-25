/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/bunny-ballers/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
