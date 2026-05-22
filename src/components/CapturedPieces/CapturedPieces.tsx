import type { RefObject } from 'react'

import type { CapturedPieces as CapturedPiecesType, CapturablePieceType, Player } from '../../game/types'
import { getPieceLabel } from '../../game/pieces'

const PIECE_ORDER: CapturablePieceType[] = ['hi', 'kaku', 'kin', 'gin', 'kei', 'kyo', 'fu']

interface CapturedPiecesProps {
  captured: CapturedPiecesType
  owner: Player
  isCurrentPlayer: boolean
  selectedPieceType: CapturablePieceType | null
  onPieceClick: (pieceType: CapturablePieceType) => void
  isGameOver: boolean
  capturedRef?: RefObject<HTMLDivElement>
}

export function CapturedPieces({
  captured,
  owner,
  isCurrentPlayer,
  selectedPieceType,
  onPieceClick,
  isGameOver,
  capturedRef,
}: CapturedPiecesProps) {
  const ownerLabel = owner === 'sente' ? '▲先手' : '△後手'
  const isRotated = owner === 'gote'

  return (
    <div
      ref={capturedRef}
      className={`captured-pieces captured-pieces--${owner}${isCurrentPlayer ? ' captured-pieces--active' : ''}`}
    >
      <div className="captured-label">{ownerLabel}の持ち駒</div>
      <div className="captured-list">
        {PIECE_ORDER.map(type => {
          const count = captured[type]
          if (count === 0) return null
          const isSelected = isCurrentPlayer && selectedPieceType === type
          return (
            <button
              key={type}
              className={`captured-piece${isSelected ? ' captured-piece--selected' : ''}${isRotated ? ' captured-piece--rotated' : ''}`}
              onClick={() => !isGameOver && isCurrentPlayer && onPieceClick(type)}
              disabled={isGameOver || !isCurrentPlayer}
              aria-label={`${getPieceLabel(type)} ${count}枚`}
            >
              <span className="captured-piece-label">{getPieceLabel(type)}</span>
              {count > 1 && <span className="captured-piece-count">{count}</span>}
            </button>
          )
        })}
        {PIECE_ORDER.every(t => captured[t] === 0) && (
          <span className="captured-empty">なし</span>
        )}
      </div>
    </div>
  )
}
