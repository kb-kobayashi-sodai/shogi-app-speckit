import { useState } from 'react'
import type { GameStatus, Player } from '../../game/types'

interface GameControlsProps {
  status: GameStatus
  currentPlayer: Player
  onResign: () => void
  onReset: () => void
}

export function GameControls({ status, currentPlayer, onResign, onReset }: GameControlsProps) {
  const [confirmResign, setConfirmResign] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const isGameOver = status === 'checkmate' || status === 'resigned' || status === 'draw'
  const playerName = currentPlayer === 'sente' ? '▲先手' : '△後手'

  function handleResignClick() {
    setConfirmResign(true)
  }

  function handleResignConfirm() {
    setConfirmResign(false)
    onResign()
  }

  function handleResetClick() {
    setConfirmReset(true)
  }

  function handleResetConfirm() {
    setConfirmReset(false)
    onReset()
  }

  return (
    <div className="game-controls">
      {!isGameOver && (
        <>
          {confirmResign ? (
            <div className="confirm-dialog">
              <span>{playerName}が投了しますか？</span>
              <button className="btn btn--danger" onClick={handleResignConfirm}>投了する</button>
              <button className="btn btn--secondary" onClick={() => setConfirmResign(false)}>キャンセル</button>
            </div>
          ) : (
            <button className="btn btn--danger" onClick={handleResignClick}>投了</button>
          )}
        </>
      )}

      {confirmReset ? (
        <div className="confirm-dialog">
          <span>最初からやり直しますか？</span>
          <button className="btn btn--warning" onClick={handleResetConfirm}>最初から</button>
          <button className="btn btn--secondary" onClick={() => setConfirmReset(false)}>キャンセル</button>
        </div>
      ) : (
        <button className="btn btn--secondary" onClick={handleResetClick}>最初から</button>
      )}
    </div>
  )
}
