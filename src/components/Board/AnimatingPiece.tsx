import { useEffect, useRef } from 'react'

import type { Piece as PieceType_i } from '../../game/types'
import { getPieceLabel } from '../../game/pieces'

const ANIMATION_DURATION = 420

interface AnimatingPieceProps {
  piece: PieceType_i
  startRect: DOMRect
  endRect: DOMRect
  onComplete: () => void
  capturePiece?: PieceType_i
  captureStartRect?: DOMRect
  captureEndRect?: DOMRect
}

export function AnimatingPiece({
  piece,
  startRect,
  endRect,
  onComplete,
  capturePiece,
  captureStartRect,
  captureEndRect,
}: AnimatingPieceProps) {
  const pieceRef = useRef<HTMLSpanElement>(null)
  const captureRef = useRef<HTMLSpanElement>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    const el = pieceRef.current
    if (!el) {
      onComplete()
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = prefersReducedMotion ? 0 : ANIMATION_DURATION

    const dx = endRect.left - startRect.left
    const dy = endRect.top - startRect.top
    const arc = Math.min(Math.max(Math.abs(dx), Math.abs(dy)) * 0.35, 60)

    const mainAnim = el.animate(
      [
        { transform: 'translate(0px, 0px) translateZ(0px)', easing: 'ease-in' },
        {
          transform: `translate(${dx / 2}px, ${dy / 2}px) translateZ(${arc}px)`,
          easing: 'ease-out',
          offset: 0.5,
        },
        { transform: `translate(${dx}px, ${dy}px) translateZ(0px)` },
      ],
      { duration, fill: 'forwards' },
    )

    const animations: Promise<Animation>[] = [mainAnim.finished]

    const cel = captureRef.current
    if (capturePiece && captureStartRect && captureEndRect && cel) {
      const cdx = captureEndRect.left - captureStartRect.left
      const cdy = captureEndRect.top - captureStartRect.top
      const captureAnim = cel.animate(
        [
          { transform: 'translate(0px, 0px)', opacity: '1', easing: 'ease-in' },
          {
            transform: `translate(${cdx * 0.7}px, ${cdy * 0.7}px)`,
            opacity: '0.8',
            offset: 0.6,
          },
          { transform: `translate(${cdx}px, ${cdy}px)`, opacity: '0' },
        ],
        { duration: prefersReducedMotion ? 0 : Math.round(ANIMATION_DURATION * 0.75), fill: 'forwards' },
      )
      animations.push(captureAnim.finished)
    }

    Promise.all(animations)
      .then(() => {
        if (!completedRef.current) {
          completedRef.current = true
          onComplete()
        }
      })
      .catch(() => {})

    return () => {
      mainAnim.cancel()
    }
  }, [])

  const mainLabel = getPieceLabel(piece.type)
  const isGoteMain = piece.owner === 'gote'

  return (
    <>
      <span
        ref={pieceRef}
        className={`piece piece--${piece.owner}${isGoteMain ? ' piece--rotated' : ''} piece--flying`}
        style={{
          position: 'fixed',
          left: startRect.left,
          top: startRect.top,
          width: startRect.width,
          height: startRect.height,
          zIndex: 300,
        }}
        aria-hidden="true"
      >
        {mainLabel}
      </span>
      {capturePiece && captureStartRect && (
        <span
          ref={captureRef}
          className={`piece piece--${capturePiece.owner}${capturePiece.owner === 'gote' ? ' piece--rotated' : ''} piece--flying`}
          style={{
            position: 'fixed',
            left: captureStartRect.left,
            top: captureStartRect.top,
            width: captureStartRect.width,
            height: captureStartRect.height,
            zIndex: 299,
          }}
          aria-hidden="true"
        >
          {getPieceLabel(capturePiece.type)}
        </span>
      )}
    </>
  )
}
