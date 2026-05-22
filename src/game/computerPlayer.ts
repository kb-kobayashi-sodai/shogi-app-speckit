import type { GameState, Move, CapturablePieceType } from './types'
import { getLegalMovesForPiece, getLegalDropPositions, isInEnemyZone } from './legalMoves'
import { canPromote } from './pieces'
import { BOARD_SIZE } from './constants'

export function selectComputerMove(state: GameState): Move | null {
  const player = state.currentPlayer
  const { board, capturedPieces } = state
  const allMoves: Move[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c]
      if (!piece || piece.owner !== player) continue

      const from = { row: r, col: c }
      const legalPositions = getLegalMovesForPiece(board, from, capturedPieces)

      for (const to of legalPositions) {
        const inZone = isInEnemyZone(from.row, player) || isInEnemyZone(to.row, player)
        const promoted = canPromote(piece.type) && inZone

        allMoves.push({ type: 'move', from, to, piece, promoted })
      }
    }
  }

  const captured = capturedPieces[player]
  for (const [key, count] of Object.entries(captured)) {
    if (count <= 0) continue
    const pieceType = key as CapturablePieceType
    const dropPositions = getLegalDropPositions(board, pieceType, player)
    for (const to of dropPositions) {
      allMoves.push({ type: 'drop', to, pieceType, player })
    }
  }

  if (allMoves.length === 0) return null
  return allMoves[Math.floor(Math.random() * allMoves.length)]
}
