import { useEffect, useRef } from 'react'

import type { Piece as PieceType_i } from '../../game/types'
import { getPieceLabel } from '../../game/pieces'

const ANIMATION_DURATION = 300

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
  const captureAnimRef = useRef<Animation | null>(null)

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
    const liftY = Math.min(Math.max(Math.abs(dx), Math.abs(dy)) * 0.12, 24)

    const mainAnim = el.animate(
      [
        { transform: 'translate(0px, 0px) scale(1)', easing: 'cubic-bezier(0.15, 0, 0.3, 1)' },
        {
          transform: `translate(${dx * 0.5}px, ${dy * 0.5 - liftY}px) scale(1.08)`,
          easing: 'cubic-bezier(0.55, 0, 0.85, 1)',
          offset: 0.38,
        },
        { transform: `translate(${dx}px, ${dy}px) scale(1)` },
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
      captureAnimRef.current = captureAnim
      animations.push(captureAnim.finished)
    }

    Promise.all(animations)
      .then(() => {
        if (!completedRef.current) {
          completedRef.current = true
          onComplete()
        }
      })
      .catch(() => {
        if (!completedRef.current) {
          completedRef.current = true
          onComplete()
        }
      })

    return () => {
      mainAnim.cancel()
      captureAnimRef.current?.cancel()
    }
  }, [])

  const mainLabel = getPieceLabel(piece.type)
  const isGoteMain = piece.owner === 'gote'

  return (
    <>
      <span
        ref={pieceRef}
        className="piece-wrap piece-wrap--flying"
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
        <span className={`piece piece--${piece.owner}${isGoteMain ? ' piece--rotated' : ''}`}>
          {[...mainLabel].map((char, i) => <span key={char + i}>{char}</span>)}
        </span>
      </span>
      {capturePiece && captureStartRect && (
        <span
          ref={captureRef}
          className="piece-wrap piece-wrap--flying"
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
          <span className={`piece piece--${capturePiece.owner}${capturePiece.owner === 'gote' ? ' piece--rotated' : ''}`}>
            {[...getPieceLabel(capturePiece.type)].map((char, i) => <span key={char + i}>{char}</span>)}
          </span>
        </span>
      )}
    </>
  )
}
