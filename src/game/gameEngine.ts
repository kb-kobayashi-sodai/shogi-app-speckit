import type { GameState, Board, Move, Player, AllCapturedPieces, PendingPromotion, GameMode } from './types'
import { INITIAL_BOARD, INITIAL_CAPTURED } from './constants'
import { canPromote, mustPromote, promote, unpromote } from './pieces'
import { isUnderAttack, hasAnyLegalMove, isInEnemyZone } from './legalMoves'
import { hashBoardState, isSennichite, addBoardHistory } from './sennichite'

function opponent(player: Player): Player {
  return player === 'sente' ? 'gote' : 'sente'
}

function findKing(board: Board, player: Player): { row: number; col: number } | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c]
      if (p && p.owner === player && p.type === 'ou') return { row: r, col: c }
    }
  }
  return null
}

export function isInCheck(board: Board, player: Player): boolean {
  const kingPos = findKing(board, player)
  if (!kingPos) return false
  return isUnderAttack(board, kingPos, opponent(player))
}

export function isCheckmate(
  board: Board,
  player: Player,
  capturedPieces: AllCapturedPieces,
): boolean {
  if (!isInCheck(board, player)) return false
  return !hasAnyLegalMove(board, player, capturedPieces)
}

export function applyMove(
  board: Board,
  move: Move,
  capturedPieces: AllCapturedPieces,
): { board: Board; capturedPieces: AllCapturedPieces } {
  const newBoard = board.map(row => [...row])
  const newCaptured: AllCapturedPieces = {
    sente: { ...capturedPieces.sente },
    gote: { ...capturedPieces.gote },
  }

  if (move.type === 'move') {
    const captured = newBoard[move.to.row][move.to.col]
    if (captured) {
      const baseType = unpromote(captured.type)
      newCaptured[move.piece.owner][baseType]++
    }
    const finalType = move.promoted ? promote(move.piece.type) : move.piece.type
    newBoard[move.to.row][move.to.col] = { type: finalType, owner: move.piece.owner }
    newBoard[move.from.row][move.from.col] = null
  } else {
    newBoard[move.to.row][move.to.col] = { type: move.pieceType, owner: move.player }
    newCaptured[move.player][move.pieceType]--
  }

  return { board: newBoard, capturedPieces: newCaptured }
}

export function createInitialGameState(gameMode: GameMode = 'human'): GameState {
  const board = INITIAL_BOARD.map(row => row.map(p => p ? { ...p } : null))
  return {
    board,
    capturedPieces: {
      sente: { ...INITIAL_CAPTURED.sente },
      gote: { ...INITIAL_CAPTURED.gote },
    },
    currentPlayer: 'sente',
    status: 'playing',
    winner: null,
    pendingPromotion: null,
    boardHistory: [],
    selectedPosition: null,
    legalMoves: [],
    selectedCapturedPiece: null,
    gameMode,
    isComputerThinking: false,
  }
}

export function processMove(state: GameState, move: Move): GameState {
  // 成り選択が必要か判定
  if (move.type === 'move') {
    const piece = move.piece
    const toRow = move.to.row
    const forced = mustPromote(piece.type, toRow, piece.owner)
    const canProm = canPromote(piece.type)
    const inZone = isInEnemyZone(toRow, piece.owner) ||
                   isInEnemyZone(move.from.row, piece.owner)

    if (forced) {
      // 強制成り：選択なしで自動的に成る
      const finalMove = { ...move, promoted: true }
      return applyMoveToState(state, finalMove)
    }

    if (canProm && inZone && !move.promoted) {
      // 成り選択待ちに遷移
      const pending: PendingPromotion = { from: move.from, to: move.to, piece: piece }
      return {
        ...state,
        pendingPromotion: pending,
        selectedPosition: null,
        legalMoves: [],
        selectedCapturedPiece: null,
      }
    }
  }

  return applyMoveToState(state, move)
}

function applyMoveToState(state: GameState, move: Move): GameState {
  const { board: newBoard, capturedPieces: newCaptured } = applyMove(
    state.board,
    move,
    state.capturedPieces,
  )
  const nextPlayer = opponent(state.currentPlayer)

  const newHash = hashBoardState(newBoard, newCaptured, nextPlayer)
  const newHistory = addBoardHistory(state.boardHistory, newHash)

  if (isSennichite(newHistory)) {
    return {
      ...state,
      board: newBoard,
      capturedPieces: newCaptured,
      currentPlayer: nextPlayer,
      status: 'draw',
      winner: null,
      pendingPromotion: null,
      boardHistory: newHistory,
      selectedPosition: null,
      legalMoves: [],
      selectedCapturedPiece: null,
    }
  }

  if (isCheckmate(newBoard, nextPlayer, newCaptured)) {
    return {
      ...state,
      board: newBoard,
      capturedPieces: newCaptured,
      currentPlayer: nextPlayer,
      status: 'checkmate',
      winner: state.currentPlayer,
      pendingPromotion: null,
      boardHistory: newHistory,
      selectedPosition: null,
      legalMoves: [],
      selectedCapturedPiece: null,
    }
  }

  const inCheck = isInCheck(newBoard, nextPlayer)

  return {
    ...state,
    board: newBoard,
    capturedPieces: newCaptured,
    currentPlayer: nextPlayer,
    status: inCheck ? 'check' : 'playing',
    winner: null,
    pendingPromotion: null,
    boardHistory: newHistory,
    selectedPosition: null,
    legalMoves: [],
    selectedCapturedPiece: null,
  }
}

export function processPromotionChoice(state: GameState, promote_: boolean): GameState {
  if (!state.pendingPromotion) return state
  const { from, to, piece } = state.pendingPromotion
  const move: Move = { type: 'move', from, to, piece, promoted: promote_ }
  return applyMoveToState({ ...state, pendingPromotion: null }, move)
}

export function processResign(state: GameState): GameState {
  return {
    ...state,
    status: 'resigned',
    winner: opponent(state.currentPlayer),
    selectedPosition: null,
    legalMoves: [],
    selectedCapturedPiece: null,
    pendingPromotion: null,
    isComputerThinking: false,
  }
}

export function processReset(gameMode: GameMode): GameState {
  return createInitialGameState(gameMode)
}
