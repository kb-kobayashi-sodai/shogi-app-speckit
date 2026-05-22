import { useReducer } from 'react'
import type { GameState, Position, CapturablePieceType, Move } from '../game/types'
import { createInitialGameState, processMove, processPromotionChoice, processResign, processReset } from '../game/gameEngine'
import { getLegalMovesForPiece, getLegalDropPositions } from '../game/legalMoves'

type GameAction =
  | { type: 'CELL_CLICK'; payload: Position }
  | { type: 'CAPTURED_PIECE_CLICK'; payload: CapturablePieceType }
  | { type: 'PROMOTION_CHOICE'; payload: boolean }
  | { type: 'RESIGN' }
  | { type: 'RESET' }

function reducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'RESET') return processReset()
  if (action.type === 'RESIGN') return processResign(state)
  if (action.type === 'PROMOTION_CHOICE') return processPromotionChoice(state, action.payload)

  // 対局終了・成り選択中は操作不可
  if (state.status === 'checkmate' || state.status === 'resigned' || state.status === 'draw') return state
  if (state.pendingPromotion !== null) return state

  if (action.type === 'CAPTURED_PIECE_CLICK') {
    const pieceType = action.payload
    const captured = state.capturedPieces[state.currentPlayer]

    // 持ち駒がない
    if (captured[pieceType] <= 0) return state

    // 同じ持ち駒を再度クリックで選択解除
    if (state.selectedCapturedPiece === pieceType) {
      return { ...state, selectedCapturedPiece: null, selectedPosition: null, legalMoves: [] }
    }

    const drops = getLegalDropPositions(state.board, pieceType, state.currentPlayer)
    return {
      ...state,
      selectedCapturedPiece: pieceType,
      selectedPosition: null,
      legalMoves: drops,
    }
  }

  if (action.type === 'CELL_CLICK') {
    const clickedPos = action.payload

    // 持ち駒選択中 → 打つ先を選択
    if (state.selectedCapturedPiece !== null) {
      const isLegal = state.legalMoves.some(m => m.row === clickedPos.row && m.col === clickedPos.col)
      if (isLegal) {
        const move: Move = {
          type: 'drop',
          to: clickedPos,
          pieceType: state.selectedCapturedPiece,
          player: state.currentPlayer,
        }
        return processMove({ ...state, selectedCapturedPiece: null, selectedPosition: null, legalMoves: [] }, move)
      }
      // 非合法マスをクリック → 選択解除
      return { ...state, selectedCapturedPiece: null, selectedPosition: null, legalMoves: [] }
    }

    const clickedPiece = state.board[clickedPos.row][clickedPos.col]

    // 1回目のクリック: 自分の駒を選択
    if (state.selectedPosition === null) {
      if (!clickedPiece || clickedPiece.owner !== state.currentPlayer) return state
      const moves = getLegalMovesForPiece(state.board, clickedPos, state.capturedPieces)
      return { ...state, selectedPosition: clickedPos, legalMoves: moves, selectedCapturedPiece: null }
    }

    // 2回目のクリック
    const selectedPiece = state.board[state.selectedPosition.row][state.selectedPosition.col]

    // 同じマスを再度クリックで選択解除
    if (clickedPos.row === state.selectedPosition.row && clickedPos.col === state.selectedPosition.col) {
      return { ...state, selectedPosition: null, legalMoves: [] }
    }

    // 自分の別の駒をクリック → 再選択
    if (clickedPiece && clickedPiece.owner === state.currentPlayer) {
      const moves = getLegalMovesForPiece(state.board, clickedPos, state.capturedPieces)
      return { ...state, selectedPosition: clickedPos, legalMoves: moves }
    }

    // 合法手マスをクリック → 移動
    const isLegal = state.legalMoves.some(m => m.row === clickedPos.row && m.col === clickedPos.col)
    if (!isLegal || !selectedPiece) {
      return { ...state, selectedPosition: null, legalMoves: [] }
    }

    const move: Move = {
      type: 'move',
      from: state.selectedPosition,
      to: clickedPos,
      piece: selectedPiece,
      promoted: false,
    }
    return processMove({ ...state, selectedPosition: null, legalMoves: [] }, move)
  }

  return state
}

export interface UseGameReturn {
  state: GameState
  handleCellClick: (position: Position) => void
  handleCapturedPieceClick: (pieceType: CapturablePieceType) => void
  handlePromotionChoice: (promote: boolean) => void
  handleResign: () => void
  handleReset: () => void
}

export function useGame(): UseGameReturn {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialGameState)

  return {
    state,
    handleCellClick: (pos) => dispatch({ type: 'CELL_CLICK', payload: pos }),
    handleCapturedPieceClick: (pt) => dispatch({ type: 'CAPTURED_PIECE_CLICK', payload: pt }),
    handlePromotionChoice: (p) => dispatch({ type: 'PROMOTION_CHOICE', payload: p }),
    handleResign: () => dispatch({ type: 'RESIGN' }),
    handleReset: () => dispatch({ type: 'RESET' }),
  }
}
