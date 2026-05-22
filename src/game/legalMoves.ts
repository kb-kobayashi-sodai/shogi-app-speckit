import type { Board, Position, Piece, Player, PieceType, CapturablePieceType, AllCapturedPieces } from './types'
import { BOARD_SIZE, ENEMY_ZONE_ROWS } from './constants'
import { mustPromote } from './pieces'

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

function opponent(player: Player): Player {
  return player === 'sente' ? 'gote' : 'sente'
}

// 駒の基本移動デルタ（先手視点、後手は上下反転して適用）
function getMoveDeltasForType(type: PieceType, player: Player): { dr: number; dc: number }[] {
  const fwd = player === 'sente' ? -1 : 1  // 前方方向

  const goldMoves = [
    { dr: fwd, dc: 0 }, { dr: -fwd, dc: 0 },
    { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    { dr: fwd, dc: -1 }, { dr: fwd, dc: 1 },
  ]

  switch (type) {
    case 'fu':
      return [{ dr: fwd, dc: 0 }]
    case 'kei':
      return [{ dr: fwd * 2, dc: -1 }, { dr: fwd * 2, dc: 1 }]
    case 'gin':
      return [
        { dr: fwd, dc: -1 }, { dr: fwd, dc: 0 }, { dr: fwd, dc: 1 },
        { dr: -fwd, dc: -1 }, { dr: -fwd, dc: 1 },
      ]
    case 'kin':
    case 'tofu':
    case 'narikyo':
    case 'narikei':
    case 'narigin':
      return goldMoves
    case 'ou':
      return [
        { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
        { dr:  0, dc: -1 },                     { dr:  0, dc: 1 },
        { dr:  1, dc: -1 }, { dr:  1, dc: 0 }, { dr:  1, dc: 1 },
      ]
    default:
      return []
  }
}

// スライド駒の方向リスト
function getSlideDirections(type: PieceType, player: Player): { dr: number; dc: number }[][] {
  const fwd = player === 'sente' ? -1 : 1

  switch (type) {
    case 'kyo':
      return [[{ dr: fwd, dc: 0 }]] // 方向を繰り返すため配列の配列
    case 'kaku':
      return [
        [{ dr: -1, dc: -1 }], [{ dr: -1, dc: 1 }],
        [{ dr:  1, dc: -1 }], [{ dr:  1, dc: 1 }],
      ]
    case 'hi':
      return [
        [{ dr: -1, dc: 0 }], [{ dr: 1, dc: 0 }],
        [{ dr: 0, dc: -1 }], [{ dr: 0, dc: 1 }],
      ]
    case 'uma':  // 角の動き + 隣接1マス
      return [
        [{ dr: -1, dc: -1 }], [{ dr: -1, dc: 1 }],
        [{ dr:  1, dc: -1 }], [{ dr:  1, dc: 1 }],
      ]
    case 'ryu':  // 飛の動き + 斜め1マス
      return [
        [{ dr: -1, dc: 0 }], [{ dr: 1, dc: 0 }],
        [{ dr: 0, dc: -1 }], [{ dr: 0, dc: 1 }],
      ]
    default:
      return []
  }
}

function isSliding(type: PieceType): boolean {
  return ['kyo','kaku','hi','uma','ryu'].includes(type)
}

// 1マス追加移動（uma/ryu の王将的動き）
function getExtraDeltas(type: PieceType): { dr: number; dc: number }[] {
  if (type === 'uma') {
    return [{ dr:-1,dc:0 },{ dr:1,dc:0 },{ dr:0,dc:-1 },{ dr:0,dc:1 }]
  }
  if (type === 'ryu') {
    return [{ dr:-1,dc:-1 },{ dr:-1,dc:1 },{ dr:1,dc:-1 },{ dr:1,dc:1 }]
  }
  return []
}

function getRawMoves(board: Board, pos: Position, piece: Piece): Position[] {
  const { row, col } = pos
  const { type, owner } = piece
  const result: Position[] = []

  if (isSliding(type)) {
    for (const dir of getSlideDirections(type, owner)) {
      let r = row + dir[0].dr
      let c = col + dir[0].dc
      while (inBounds(r, c)) {
        const target = board[r][c]
        if (target === null) {
          result.push({ row: r, col: c })
        } else {
          if (target.owner !== owner) result.push({ row: r, col: c })
          break
        }
        r += dir[0].dr
        c += dir[0].dc
      }
    }
    for (const delta of getExtraDeltas(type)) {
      const r = row + delta.dr
      const c = col + delta.dc
      if (inBounds(r, c) && board[r][c]?.owner !== owner) {
        result.push({ row: r, col: c })
      }
    }
  } else {
    for (const delta of getMoveDeltasForType(type, owner)) {
      const r = row + delta.dr
      const c = col + delta.dc
      if (inBounds(r, c) && board[r][c]?.owner !== owner) {
        result.push({ row: r, col: c })
      }
    }
  }

  return result
}

export function isUnderAttack(board: Board, pos: Position, attackingPlayer: Player): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c]
      if (piece && piece.owner === attackingPlayer) {
        const moves = getRawMoves(board, { row: r, col: c }, piece)
        if (moves.some(m => m.row === pos.row && m.col === pos.col)) return true
      }
    }
  }
  return false
}

function findKing(board: Board, player: Player): Position | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (p && p.owner === player && p.type === 'ou') return { row: r, col: c }
    }
  }
  return null
}

function applyTempMove(board: Board, from: Position, to: Position): Board {
  const newBoard = board.map(row => [...row])
  newBoard[to.row][to.col] = newBoard[from.row][from.col]
  newBoard[from.row][from.col] = null
  return newBoard
}

export function getLegalMovesForPiece(
  board: Board,
  position: Position,
  _capturedPieces: AllCapturedPieces,
): Position[] {
  const piece = board[position.row][position.col]
  if (!piece) return []

  const rawMoves = getRawMoves(board, position, piece)
  const legal: Position[] = []

  for (const to of rawMoves) {
    const tempBoard = applyTempMove(board, position, to)
    const kingPos = findKing(tempBoard, piece.owner)
    if (kingPos && !isUnderAttack(tempBoard, kingPos, opponent(piece.owner))) {
      legal.push(to)
    }
  }

  return legal
}

export function getLegalDropPositions(
  board: Board,
  pieceType: CapturablePieceType,
  player: Player,
): Position[] {
  const result: Position[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) continue

      // 行き所のない駒
      if (mustPromote(pieceType as PieceType, r, player)) continue

      // 二歩チェック
      if (pieceType === 'fu') {
        const hasFuInCol = board.some(row => {
          const p = row[c]
          return p && p.owner === player && p.type === 'fu'
        })
        if (hasFuInCol) continue
      }

      // 打って詰みになるかチェック（打ち歩詰め）
      if (pieceType === 'fu') {
        const tempBoard = board.map(row => [...row])
        tempBoard[r][c] = { type: 'fu', owner: player }
        const opponentKingPos = findKing(tempBoard, opponent(player))
        if (opponentKingPos && isUnderAttack(tempBoard, opponentKingPos, player)) {
          // 打ち歩詰めかチェック：相手に合法手があるか
          const oppHasMove = hasAnyLegalMove(tempBoard, opponent(player), {
            sente: { fu: 0, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 },
            gote: { fu: 0, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 },
          })
          if (!oppHasMove) continue
        }
      }

      // 打った後に自玉が王手にならないか確認
      const tempBoard = board.map(row => [...row])
      tempBoard[r][c] = { type: pieceType, owner: player }
      const kingPos = findKing(tempBoard, player)
      if (kingPos && isUnderAttack(tempBoard, kingPos, opponent(player))) continue

      result.push({ row: r, col: c })
    }
  }

  return result
}

export function hasAnyLegalMove(
  board: Board,
  player: Player,
  capturedPieces: AllCapturedPieces,
): boolean {
  // 盤上の駒の合法手
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (p && p.owner === player) {
        if (getLegalMovesForPiece(board, { row: r, col: c }, capturedPieces).length > 0) {
          return true
        }
      }
    }
  }

  // 持ち駒の打ち
  const captured = capturedPieces[player]
  for (const [key, count] of Object.entries(captured)) {
    if (count > 0) {
      if (getLegalDropPositions(board, key as CapturablePieceType, player).length > 0) {
        return true
      }
    }
  }

  return false
}

export function isInEnemyZone(row: number, player: Player): boolean {
  return ENEMY_ZONE_ROWS[player].includes(row)
}
