import type { Piece as PieceType_i } from '../../game/types'
import { getPieceLabel } from '../../game/pieces'

interface PieceProps {
  piece: PieceType_i
}

export function Piece({ piece }: PieceProps) {
  const label = getPieceLabel(piece.type)
  const isGote = piece.owner === 'gote'

  return (
    <span
      className={`piece piece--${piece.owner}${isGote ? ' piece--rotated' : ''}`}
      aria-label={`${piece.owner === 'sente' ? '先手' : '後手'}${label}`}
    >
      {label}
    </span>
  )
}
