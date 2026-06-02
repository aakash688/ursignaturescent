'use client'

import { useEffect, useRef } from 'react'
import { ClientOnly } from '@/components/shared/ClientOnly'

function GoldCursorInner() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let x = 0
    let y = 0
    let ringX = 0
    let ringY = 0

    const move = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
    }
    window.addEventListener('mousemove', move)

    let frameId = 0
    const animate = () => {
      ringX += (x - ringX) * 0.12
      ringY += (y - ringY) * 0.12
      if (dot.current) {
        dot.current.style.transform = `translate(${x}px, ${y}px)`
      }
      if (ring.current) {
        ring.current.style.transform = `translate(${ringX}px, ${ringY}px)`
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)

    const grow = () => ring.current?.classList.add('expanded')
    const shrink = () => ring.current?.classList.remove('expanded')
    const interactive = document.querySelectorAll('a, button, [role="button"]')
    interactive.forEach((el) => {
      el.addEventListener('mouseenter', grow)
      el.addEventListener('mouseleave', shrink)
    })

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', move)
      interactive.forEach((el) => {
        el.removeEventListener('mouseenter', grow)
        el.removeEventListener('mouseleave', shrink)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={dot}
        className="cursor-dot fixed top-0 left-0 w-1.5 h-1.5 bg-gold rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      />
      <div
        ref={ring}
        className="cursor-ring fixed top-0 left-0 w-8 h-8 border border-gold/40 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-200 [&.expanded]:w-14 [&.expanded]:h-14 [&.expanded]:border-gold/70"
      />
    </>
  )
}

export function GoldCursor() {
  return (
    <ClientOnly>
      <GoldCursorInner />
    </ClientOnly>
  )
}
