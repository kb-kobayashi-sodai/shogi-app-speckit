import { useReducer } from 'react'
import type { Dispatch } from 'react'
import type { GameState, Position, CapturablePieceType, Move, GameMode } from '../game/types'
import { createInitialGameState, processMove, processPromotionChoice, processResign, processReset } from '../game/gameEngine'
import { getLegalMovesForPiece, getLegalDropPositions } from '../game/legalMoves'

export type GameAction =
  | { type: 'CELL_CLICK'; payload: Position }
  | { type: 'CAPTURED_PIECE_CLICK'; payload: CapturablePieceType }
  | { type: 'PROMOTION_CHOICE'; payload: boolean }
  | { type: 'RESIGN' }
  | { type: 'RESET' }
  | { type: 'CHANGE_MODE'; payload: GameMode }
  | { type: 'COMPUTER_MOVE'; payload: Move }
  | { type: 'SET_COMPUTER_THINKING'; payload: boolean }

function reducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'RESET') return processReset(state.gameMode)
  if (action.type === 'RESIGN') return processResign(state)
  if (action.type === 'PROMOTION_CHOICE') return processPromotionChoice(state, action.payload)
  if (action.type === 'CHANGE_MODE') return createInitialGameState(action.payload)
  if (action.type === 'SET_COMPUTER_THINKING') return { ...state, isComputerThinking: action.payload }
  if (action.type === 'COMPUTER_MOVE') {
    const newState = processMove(state, action.payload)
    return { ...newState, isComputerThinking: false }
  }

  // 対局終了・成り選択中・コンピュータ思考中は操作不可
  if (state.status === 'checkmate' || state.status === 'resigned' || state.status === 'draw') return state
  if (state.pendingPromotion !== null) return state
  if (state.isComputerThinking) return state

  if (action.type === 'CAPTURED_PIECE_CLICK') {
    const pieceType = action.payload
    const captured = state.capturedPieces[state.currentPlayer]

    if (captured[pieceType] <= 0) return state

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
      return { ...state, selectedCapturedPiece: null, selectedPosition: null, legalMoves: [] }
    }

    const clickedPiece = state.board[clickedPos.row][clickedPos.col]

    if (state.selectedPosition === null) {
      if (!clickedPiece || clickedPiece.owner !== state.currentPlayer) return state
      const moves = getLegalMovesForPiece(state.board, clickedPos, state.capturedPieces)
      return { ...state, selectedPosition: clickedPos, legalMoves: moves, selectedCapturedPiece: null }
    }

    const selectedPiece = state.board[state.selectedPosition.row][state.selectedPosition.col]

    if (clickedPos.row === state.selectedPosition.row && clickedPos.col === state.selectedPosition.col) {
      return { ...state, selectedPosition: null, legalMoves: [] }
    }

    if (clickedPiece && clickedPiece.owner === state.currentPlayer) {
      const moves = getLegalMovesForPiece(state.board, clickedPos, state.capturedPieces)
      return { ...state, selectedPosition: clickedPos, legalMoves: moves }
    }

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
  dispatch: Dispatch<GameAction>
  handleCellClick: (position: Position) => void
  handleCapturedPieceClick: (pieceType: CapturablePieceType) => void
  handlePromotionChoice: (promote: boolean) => void
  handleResign: () => void
  handleReset: () => void
  handleChangeMode: (mode: GameMode) => void
}

export function useGame(): UseGameReturn {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialGameState)

  return {
    state,
    dispatch,
    handleCellClick: (pos) => dispatch({ type: 'CELL_CLICK', payload: pos }),
    handleCapturedPieceClick: (pt) => dispatch({ type: 'CAPTURED_PIECE_CLICK', payload: pt }),
    handlePromotionChoice: (p) => dispatch({ type: 'PROMOTION_CHOICE', payload: p }),
    handleResign: () => dispatch({ type: 'RESIGN' }),
    handleReset: () => dispatch({ type: 'RESET' }),
    handleChangeMode: (mode) => dispatch({ type: 'CHANGE_MODE', payload: mode }),
  }
}
