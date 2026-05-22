import type { Board, AllCapturedPieces, Player, CapturablePieceType } from './types'

export function hashBoardState(
  board: Board,
  capturedPieces: AllCapturedPieces,
  currentPlayer: Player,
): string {
  const boardStr = board
    .map(row =>
      row.map(p => (p ? `${p.owner[0]}:${p.type}` : '.')).join(','),
    )
    .join('|')

  const capturedKeys: CapturablePieceType[] = ['fu','kyo','kei','gin','kin','kaku','hi']
  const senteStr = capturedKeys.map(k => `${k}:${capturedPieces.sente[k]}`).join(',')
  const goteStr = capturedKeys.map(k => `${k}:${capturedPieces.gote[k]}`).join(',')

  return `${currentPlayer}|${boardStr}|${senteStr}|${goteStr}`
}

export function isSennichite(boardHistory: string[]): boolean {
  if (boardHistory.length === 0) return false
  const last = boardHistory[boardHistory.length - 1]
  const count = boardHistory.filter(h => h === last).length
  return count >= 4
}

export function addBoardHistory(boardHistory: string[], hash: string): string[] {
  return [...boardHistory, hash]
}
