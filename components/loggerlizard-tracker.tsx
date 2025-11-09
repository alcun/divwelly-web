'use client'

import { useEffect } from 'react'
import LoggerLizard from '@loggerlizard/lizard'

export default function LoggerLizardTracker() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_LOGGERLIZARD_API_KEY

    if (!apiKey) {
      return
    }

    // Initialize LoggerLizard with auto-tracking
    new LoggerLizard(apiKey, {
      autoTrack: true,
    })
  }, [])

  return null
}
