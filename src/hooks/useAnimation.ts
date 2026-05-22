import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, RefObject } from 'react'

import type { GameState, PendingAnimation, Player } from '../game/types'
import type { GameAction } from './useGame'

interface AnimationRefs {
  boardRef: RefObject<HTMLDivElement>
  senteCapturedRef: RefObject<HTMLDivElement>
  goteCapturedRef: RefObject<HTMLDivElement>
}

export interface UseAnimationReturn {
  currentAnimation: PendingAnimation | null
  mainStartRect: DOMRect | null
  mainEndRect: DOMRect | null
  captureStartRect: DOMRect | null
  captureEndRect: DOMRect | null
  onComplete: () => void
}

export function useAnimation(
  state: GameState,
  dispatch: Dispatch<GameAction>,
  refs: AnimationRefs,
): UseAnimationReturn {
  const [current, setCurrent] = useState<PendingAnimation | null>(null)
  const [mainStartRect, setMainStartRect] = useState<DOMRect | null>(null)
  const [mainEndRect, setMainEndRect] = useState<DOMRect | null>(null)
  const [captureStartRect, setCaptureStartRect] = useState<DOMRect | null>(null)
  const [captureEndRect, setCaptureEndRect] = useState<DOMRect | null>(null)
  const currentIdRef = useRef<string | null>(null)

  function getCellRect(row: number, col: number): DOMRect | null {
    const board = refs.boardRef.current
    if (!board) return null
    const cell = board.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    return cell?.getBoundingClientRect() ?? null
  }

  function getCapturedRect(owner: Player): DOMRect | null {
    const ref = owner === 'sente' ? refs.senteCapturedRef : refs.goteCapturedRef
    return ref.current?.getBoundingClientRect() ?? null
  }

  useEffect(() => {
    if (state.animationQueue.length === 0 || state.isAnimating) return

    const anim = state.animationQueue[0]

    let mStart: DOMRect | null = null
    let mEnd: DOMRect | null = null

    if (anim.from.type === 'cell') {
      mStart = getCellRect(anim.from.position.row, anim.from.position.col)
    } else {
      mStart = getCapturedRect(anim.from.owner)
    }

    if (anim.to.type === 'cell') {
      mEnd = getCellRect(anim.to.position.row, anim.to.position.col)
    } else {
      mEnd = getCapturedRect(anim.to.owner)
    }

    if (!mStart || !mEnd) {
      dispatch({ type: 'ANIMATION_COMPLETE', payload: anim.id })
      return
    }

    let cStart: DOMRect | null = null
    let cEnd: DOMRect | null = null

    if (anim.captureAnimation) {
      const ca = anim.captureAnimation
      if (ca.from.type === 'cell') {
        cStart = getCellRect(ca.from.position.row, ca.from.position.col)
      }
      if (ca.to.type === 'captured') {
        cEnd = getCapturedRect(ca.to.owner)
      }
    }

    dispatch({ type: 'ANIMATION_START', payload: anim.id })
    currentIdRef.current = anim.id
    setCurrent(anim)
    setMainStartRect(mStart)
    setMainEndRect(mEnd)
    setCaptureStartRect(cStart)
    setCaptureEndRect(cEnd)
  }, [state.animationQueue, state.isAnimating])

  const onComplete = useCallback(() => {
    const id = currentIdRef.current
    if (!id) return
    currentIdRef.current = null
    setCurrent(null)
    setMainStartRect(null)
    setMainEndRect(null)
    setCaptureStartRect(null)
    setCaptureEndRect(null)
    dispatch({ type: 'ANIMATION_COMPLETE', payload: id })
  }, [dispatch])

  return { currentAnimation: current, mainStartRect, mainEndRect, captureStartRect, captureEndRect, onComplete }
}
