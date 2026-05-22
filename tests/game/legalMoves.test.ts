import { describe, it, expect } from 'vitest'
import { getLegalMovesForPiece, getLegalDropPositions } from '../../src/game/legalMoves'
import type { Board, AllCapturedPieces } from '../../src/game/types'
import { INITIAL_BOARD, INITIAL_CAPTURED } from '../../src/game/constants'

const emptyCaptured: AllCapturedPieces = {
  sente: { fu: 0, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 },
  gote:  { fu: 0, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 },
}

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null))
}

describe('getLegalMovesForPiece', () => {
  it('歩は前に1マス進める', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'fu', owner: 'sente' }
    board[8][4] = { type: 'ou', owner: 'sente' }
    board[0][4] = { type: 'ou', owner: 'gote' }
    const moves = getLegalMovesForPiece(board, { row: 4, col: 4 }, emptyCaptured)
    expect(moves).toEqual([{ row: 3, col: 4 }])
  })

  it('後手の歩は下に1マス進める', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'fu', owner: 'gote' }
    board[8][4] = { type: 'ou', owner: 'sente' }
    board[0][4] = { type: 'ou', owner: 'gote' }
    const moves = getLegalMovesForPiece(board, { row: 4, col: 4 }, emptyCaptured)
    expect(moves).toEqual([{ row: 5, col: 4 }])
  })

  it('飛車は縦横にスライド移動できる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'hi', owner: 'sente' }
    board[8][0] = { type: 'ou', owner: 'sente' }
    board[0][8] = { type: 'ou', owner: 'gote' }
    const moves = getLegalMovesForPiece(board, { row: 4, col: 4 }, emptyCaptured)
    // 縦横の全マス（盤上の空きマスのみ）
    expect(moves.length).toBe(16)  // 上4 + 下4 + 左4 + 右4
  })

  it('王手放置は非合法', () => {
    const board = emptyBoard()
    board[8][4] = { type: 'ou', owner: 'sente' }
    board[0][4] = { type: 'hi', owner: 'gote' }  // 縦に利いている
    board[8][3] = { type: 'fu', owner: 'sente' }  // この歩を動かすと王手
    board[0][8] = { type: 'ou', owner: 'gote' }
    const moves = getLegalMovesForPiece(board, { row: 8, col: 3 }, emptyCaptured)
    // 縦の飛車の利きをふさぐ駒を動かすと王が危険になる
    expect(moves.length).toBe(0)
  })

  it('初期配置から先手の歩の合法手は1つ', () => {
    const moves = getLegalMovesForPiece(INITIAL_BOARD, { row: 6, col: 4 }, INITIAL_CAPTURED)
    expect(moves.length).toBe(1)
    expect(moves[0]).toEqual({ row: 5, col: 4 })
  })
})

describe('getLegalDropPositions', () => {
  it('二歩は打てない', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'fu', owner: 'sente' }
    board[8][4] = { type: 'ou', owner: 'sente' }
    board[0][4] = { type: 'ou', owner: 'gote' }
    const captured: AllCapturedPieces = { sente: { fu: 1, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 }, gote: emptyCaptured.gote }
    const drops = getLegalDropPositions(board, 'fu', 'sente')
    // 5筋（col=4）には歩があるので打てない
    expect(drops.every(p => p.col !== 4)).toBe(true)
  })

  it('歩は1段目に打てない', () => {
    const board = emptyBoard()
    board[8][4] = { type: 'ou', owner: 'sente' }
    board[0][4] = { type: 'ou', owner: 'gote' }
    const drops = getLegalDropPositions(board, 'fu', 'sente')
    expect(drops.every(p => p.row !== 0)).toBe(true)
  })

  it('桂馬は1・2段目に打てない', () => {
    const board = emptyBoard()
    board[8][4] = { type: 'ou', owner: 'sente' }
    board[0][4] = { type: 'ou', owner: 'gote' }
    const drops = getLegalDropPositions(board, 'kei', 'sente')
    expect(drops.every(p => p.row >= 2)).toBe(true)
  })
})
