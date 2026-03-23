// src/hooks/useOrderAlert.js
import { useRef, useCallback } from 'react'

export const useOrderAlert = () => {
  const audioCtxRef = useRef(null)
  const intervalRef = useRef(null)
  const isPlayingRef = useRef(false)

  // ── Get or create AudioContext ─────────────────────────────────────────
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  // ── MUST call this on first user click to unlock browser audio ─────────
  const unlockAudio = useCallback(() => {
    try {
      const ctx = getCtx()
      // Resume context if suspended
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      // Play a silent buffer to unlock
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
    } catch(e) {}
  }, [getCtx])

  // ── Play single beep ───────────────────────────────────────────────────
  const playBeep = useCallback((freq = 880, duration = 0.15, volume = 0.8, delay = 0) => {
    try {
      const ctx = getCtx()
      if (ctx.state === 'suspended') ctx.resume()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      gain.gain.setValueAtTime(0, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration)

      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + duration + 0.05)
    } catch(e) {
      console.warn('Audio error:', e)
    }
  }, [getCtx])

  // ── Fire alarm pattern ─────────────────────────────────────────────────
  const playAlarmPattern = useCallback(() => {
    playBeep(1200, 0.12, 0.9, 0.00)
    playBeep(800,  0.12, 0.9, 0.16)
    playBeep(1200, 0.12, 0.9, 0.32)
    playBeep(800,  0.12, 0.9, 0.48)
    playBeep(1200, 0.12, 0.9, 0.64)
  }, [playBeep])

  // ── Start repeating alarm ──────────────────────────────────────────────
  const startAlarm = useCallback(() => {
    if (isPlayingRef.current) return
    isPlayingRef.current = true

    try {
      const ctx = getCtx()
      if (ctx.state === 'suspended') ctx.resume()
    } catch(e) {}

    playAlarmPattern()
    intervalRef.current = setInterval(() => {
      if (isPlayingRef.current) playAlarmPattern()
    }, 3000)
  }, [playAlarmPattern, getCtx])

  // ── Stop alarm ─────────────────────────────────────────────────────────
  const stopAlarm = useCallback(() => {
    isPlayingRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // ── Single notification beep ───────────────────────────────────────────
  const playNotifSound = useCallback(() => {
    playBeep(880,  0.1, 0.6, 0.00)
    playBeep(1100, 0.1, 0.6, 0.12)
    playBeep(1320, 0.15, 0.7, 0.25)
  }, [playBeep])

  return { startAlarm, stopAlarm, playNotifSound, unlockAudio, isPlaying: isPlayingRef }
}