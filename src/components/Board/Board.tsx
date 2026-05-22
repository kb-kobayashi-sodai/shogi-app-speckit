import type { Board as BoardType, Position, Player, GameStatus } from '../../game/types'
import { Cell } from './Cell'
import { isInCheck } from '../../game/gameEngine'

interface BoardProps {
  board: BoardType
  selectedPosition: Position | null
  legalMoves: Position[]
  currentPlayer: Player
  status: GameStatus
  onCellClick: (position: Position) => void
}

export function Board({ board, selectedPosition, legalMoves, currentPlayer, status, onCellClick }: BoardProps) {
  const inCheck = status === 'check' || status === 'checkmate'
  const checkBoard = inCheck ? board : null

  function isKingInCheck(row: number, col: number): boolean {
    if (!checkBoard) return false
    const piece = checkBoard[row][col]
    if (!piece || piece.type !== 'ou') return false
    if (piece.owner !== currentPlayer && status !== 'checkmate') return false
    // 詰みの場合は敗者側の王を赤くする
    if (status === 'checkmate' && piece.owner === currentPlayer) return false
    return isInCheck(checkBoard, piece.owner)
  }

  const colLabels = ['９','８','７','６','５','４','３','２','１']
  const rowLabels = ['一','二','三','四','五','六','七','八','九']

  return (
    <div className="board-wrapper">
      <div className="board-col-labels">
        {colLabels.map(l => <span key={l}>{l}</span>)}
      </div>
      <div className="board-container">
        <div className="board" role="grid">
          {board.map((row, rowIdx) =>
            row.map((piece, colIdx) => {
              const pos: Position = { row: rowIdx, col: colIdx }
              const isSelected = selectedPosition?.row === rowIdx && selectedPosition?.col === colIdx
              const isLegal = legalMoves.some(m => m.row === rowIdx && m.col === colIdx)
              const check = isKingInCheck(rowIdx, colIdx)
              return (
                <Cell
                  key={`${rowIdx}-${colIdx}`}
                  position={pos}
                  piece={piece}
                  isSelected={isSelected}
                  isLegalMove={isLegal}
                  isInCheck={check}
                  onClick={onCellClick}
                />
              )
            })
          )}
        </div>
        <div className="board-row-labels">
          {rowLabels.map(l => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  )
}
