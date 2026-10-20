import { useEffect, useRef, useState } from 'react'
import { Sheet } from './ui'

/** Skeniranje bar koda kamerom. Koristi ugrađeni BarcodeDetector (Android Chrome), inače ZXing. */
export function Scanner({ onResult, onClose }: { onResult: (code: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const cb = useRef(onResult)
  cb.current = onResult

  useEffect(() => {
    let stopped = false
    let stream: MediaStream | null = null
    let raf = 0
    let zxingControls: { stop: () => void } | null = null

    const done = (code: string) => {
      if (stopped) return
      stopped = true
      navigator.vibrate?.(80)
      cb.current(code.trim())
    }

    ;(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Native = (window as any).BarcodeDetector
        if (Native) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          if (stopped || !video.current) return stream.getTracks().forEach((t) => t.stop())
          video.current.srcObject = stream
          await video.current.play()
          const detector = new Native()
          const tick = async () => {
            if (stopped || !video.current) return
            try {
              const codes = await detector.detect(video.current)
              if (codes.length) return done(codes[0].rawValue)
            } catch {
              /* sledeći kadar */
            }
            raf = requestAnimationFrame(tick)
          }
          tick()
        } else {
          const { BrowserMultiFormatReader } = await import('@zxing/browser')
          const reader = new BrowserMultiFormatReader()
          if (stopped || !video.current) return
          zxingControls = await reader.decodeFromConstraints({ video: { facingMode: 'environment' } }, video.current, (res) => {
            if (res) done(res.getText())
          })
          if (stopped) zxingControls.stop()
        }
      } catch (e) {
        const name = (e as Error).name
        setError(
          name === 'NotAllowedError'
            ? 'Kamera nije dozvoljena. Dozvoli pristup kameri u podešavanjima pregledača.'
            : name === 'NotFoundError'
              ? 'Kamera nije pronađena.'
              : 'Kamera ne radi ovde. Skeniranje radi samo preko https adrese (instalirana aplikacija).',
        )
      }
    })()

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      zxingControls?.stop()
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <Sheet title="Skeniraj broj pošiljke" onClose={onClose}>
      {error ? (
        <div className="notice red">{error}</div>
      ) : (
        <>
          <div className="scanner">
            <video ref={video} playsInline muted />
            <div className="scanner-frame" />
          </div>
          <p className="small muted" style={{ textAlign: 'center' }}>
            Usmeri kameru na bar kod sa nalepnice kurira.
          </p>
        </>
      )}
    </Sheet>
  )
}
