import type { Piece as PieceType_i, Position } from '../../game/types'
import { Piece } from './Piece'

interface CellProps {
  position: Position
  piece: PieceType_i | null
  isSelected: boolean
  isLegalMove: boolean
  isInCheck: boolean
  isAnimating: boolean
  isFlipping: boolean
  onClick: (position: Position) => void
}

export function Cell({ position, piece, isSelected, isLegalMove, isInCheck, isAnimating, isFlipping, onClick }: CellProps) {
  let className = 'cell'
  if (isSelected) className += ' cell--selected'
  else if (isInCheck) className += ' cell--check'
  else if (isLegalMove) className += ' cell--legal'

  return (
    <div
      className={className}
      onClick={() => onClick(position)}
      role="gridcell"
      aria-label={`${9 - position.col}${position.row + 1}`}
      data-row={position.row}
      data-col={position.col}
    >
      {isLegalMove && !piece && <div className="legal-dot" />}
      {piece && <Piece piece={piece} isAnimating={isAnimating} isFlipping={isFlipping} />}
    </div>
  )
}
