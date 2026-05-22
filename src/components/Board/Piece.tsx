import type { Piece as PieceType_i } from '../../game/types'
import { getPieceLabel } from '../../game/pieces'

interface PieceProps {
  piece: PieceType_i
  isAnimating?: boolean
  isFlipping?: boolean
}

export function Piece({ piece, isAnimating = false, isFlipping = false }: PieceProps) {
  const label = getPieceLabel(piece.type)
  const isGote = piece.owner === 'gote'

  let className = `piece piece--${piece.owner}`
  if (isGote) className += ' piece--rotated'
  if (isAnimating) className += ' piece--invisible'
  if (isFlipping) className += ' piece--flipping'

  return (
    <span
      className={className}
      aria-label={`${piece.owner === 'sente' ? '先手' : '後手'}${label}`}
    >
      {label}
    </span>
  )
}
