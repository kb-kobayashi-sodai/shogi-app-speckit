import { useReducer } from 'react'
import type { Dispatch } from 'react'

import type { GameState, Position, CapturablePieceType, Move, GameMode, PendingAnimation, Piece } from '../game/types'
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
  | { type: 'QUEUE_ANIMATION'; payload: PendingAnimation }
  | { type: 'ANIMATION_START'; payload: string }
  | { type: 'ANIMATION_COMPLETE'; payload: string }

function makeAnimId(): string {
  return `anim-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function reducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'RESET') return processReset(state.gameMode)

  if (action.type === 'RESIGN') {
    return { ...processResign(state), animationQueue: [], isAnimating: false }
  }

  if (action.type === 'PROMOTION_CHOICE') return processPromotionChoice(state, action.payload)
  if (action.type === 'CHANGE_MODE') return createInitialGameState(action.payload)
  if (action.type === 'SET_COMPUTER_THINKING') return { ...state, isComputerThinking: action.payload }

  if (action.type === 'QUEUE_ANIMATION') {
    return { ...state, animationQueue: [...state.animationQueue, action.payload] }
  }

  if (action.type === 'ANIMATION_START') {
    return { ...state, isAnimating: true }
  }

  if (action.type === 'ANIMATION_COMPLETE') {
    const pending = state.animationQueue[0]
    if (!pending || pending.id !== action.payload) return state
    const baseState: GameState = {
      ...state,
      animationQueue: state.animationQueue.slice(1),
      isAnimating: false,
    }
    return processMove(baseState, pending.move)
  }

  if (action.type === 'COMPUTER_MOVE') {
    const move = action.payload
    const movingPiece: Piece =
      move.type === 'move'
        ? move.piece
        : { type: move.pieceType, owner: move.player }
    const capturedPiece = move.type === 'move' ? state.board[move.to.row][move.to.col] : null
    const anim: PendingAnimation = {
      id: makeAnimId(),
      kind: move.type === 'move' ? 'move' : 'drop',
      piece: movingPiece,
      from:
        move.type === 'move'
          ? { type: 'cell', position: move.from }
          : { type: 'captured', owner: move.player },
      to: { type: 'cell', position: move.to },
      move,
      captureAnimation: capturedPiece
        ? {
            piece: capturedPiece,
            from: { type: 'cell', position: move.to },
            to: { type: 'captured', owner: state.currentPlayer },
          }
        : undefined,
    }
    return { ...state, isComputerThinking: false, animationQueue: [...state.animationQueue, anim] }
  }

  if (state.status === 'checkmate' || state.status === 'resigned' || state.status === 'draw') return state
  if (state.pendingPromotion !== null) return state
  if (state.isComputerThinking) return state
  if (state.isAnimating) return state

  if (action.type === 'CAPTURED_PIECE_CLICK') {
    const pieceType = action.payload
    const captured = state.capturedPieces[state.currentPlayer]

    if (captured[pieceType] <= 0) return state

    if (state.selectedCapturedPiece === pieceType) {
      return { ...state, selectedCapturedPiece: null, selectedPosition: null, legalMoves: [] }
    }

    const drops = getLegalDropPositions(state.board, pieceType, state.currentPlayer)
    return { ...state, selectedCapturedPiece: pieceType, selectedPosition: null, legalMoves: drops }
  }

  if (action.type === 'CELL_CLICK') {
    const clickedPos = action.payload

    if (state.selectedCapturedPiece !== null) {
      const isLegal = state.legalMoves.some(m => m.row === clickedPos.row && m.col === clickedPos.col)
      if (isLegal) {
        const pieceType = state.selectedCapturedPiece
        const move: Move = {
          type: 'drop',
          to: clickedPos,
          pieceType,
          player: state.currentPlayer,
        }
        const anim: PendingAnimation = {
          id: makeAnimId(),
          kind: 'drop',
          piece: { type: pieceType, owner: state.currentPlayer },
          from: { type: 'captured', owner: state.currentPlayer },
          to: { type: 'cell', position: clickedPos },
          move,
        }
        return {
          ...state,
          selectedCapturedPiece: null,
          selectedPosition: null,
          legalMoves: [],
          animationQueue: [...state.animationQueue, anim],
        }
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

    const capturedPiece = state.board[clickedPos.row][clickedPos.col]
    const move: Move = {
      type: 'move',
      from: state.selectedPosition,
      to: clickedPos,
      piece: selectedPiece,
      promoted: false,
    }
    const anim: PendingAnimation = {
      id: makeAnimId(),
      kind: 'move',
      piece: selectedPiece,
      from: { type: 'cell', position: state.selectedPosition },
      to: { type: 'cell', position: clickedPos },
      move,
      captureAnimation: capturedPiece
        ? {
            piece: capturedPiece,
            from: { type: 'cell', position: clickedPos },
            to: { type: 'captured', owner: state.currentPlayer },
          }
        : undefined,
    }
    return {
      ...state,
      selectedPosition: null,
      legalMoves: [],
      selectedCapturedPiece: null,
      animationQueue: [...state.animationQueue, anim],
    }
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
