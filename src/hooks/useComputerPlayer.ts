import { useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import type { GameState } from '../game/types'
import type { GameAction } from './useGame'
import { selectComputerMove } from '../game/computerPlayer'

export function useComputerPlayer(
  state: GameState,
  dispatch: Dispatch<GameAction>,
): void {
  const processingRef = useRef(false)

  useEffect(() => {
    if (
      state.gameMode !== 'computer' ||
      state.currentPlayer !== 'gote' ||
      (state.status !== 'playing' && state.status !== 'check') ||
      processingRef.current
    ) return

    processingRef.current = true
    dispatch({ type: 'SET_COMPUTER_THINKING', payload: true })

    let cancelled = false
    const timer = setTimeout(() => {
      if (cancelled) return

      const move = selectComputerMove(state)
      if (cancelled) return

      if (move) {
        dispatch({ type: 'COMPUTER_MOVE', payload: move })
      } else {
        dispatch({ type: 'RESIGN' })
      }
      processingRef.current = false
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
      processingRef.current = false
    }
  }, [state.currentPlayer, state.status, state.gameMode, dispatch])
}
