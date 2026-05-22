import { describe, it, expect } from 'vitest'
import { createInitialGameState, isInCheck, isCheckmate, processMove, processResign, processReset } from '../../src/game/gameEngine'
import type { Board, AllCapturedPieces } from '../../src/game/types'
import { isSennichite, addBoardHistory } from '../../src/game/sennichite'

const emptyCaptured: AllCapturedPieces = {
  sente: { fu: 0, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 },
  gote:  { fu: 0, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 },
}

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null))
}

describe('createInitialGameState', () => {
  it('先手番から開始する', () => {
    const state = createInitialGameState()
    expect(state.currentPlayer).toBe('sente')
    expect(state.status).toBe('playing')
    expect(state.winner).toBeNull()
  })

  it('初期配置に全40駒が存在する', () => {
    const state = createInitialGameState()
    let count = 0
    for (const row of state.board) for (const cell of row) if (cell) count++
    expect(count).toBe(40)
  })
})

describe('isInCheck', () => {
  it('王手状態を正しく検出する', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'ou', owner: 'sente' }
    board[4][0] = { type: 'hi', owner: 'gote' }  // 横に利いている
    board[0][0] = { type: 'ou', owner: 'gote' }
    expect(isInCheck(board, 'sente')).toBe(true)
  })

  it('王手でない場合はfalse', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'ou', owner: 'sente' }
    board[4][0] = { type: 'fu', owner: 'gote' }
    board[0][0] = { type: 'ou', owner: 'gote' }
    expect(isInCheck(board, 'sente')).toBe(false)
  })
})

describe('isCheckmate', () => {
  it('詰み状態を検出する（簡易詰め）', () => {
    const board = emptyBoard()
    // 先手の王が[0,0]にいて、後手の金2枚に囲まれ逃げ場なし
    // [0,1]の後手金: [0,0]に王手、[1,1]と[1,0]を利いている
    // [1,1]の後手金: [0,1],[1,0],[1,1]を利いている
    // 王の全移動先([0,1],[1,0],[1,1])が後手の利きで埋まっている
    board[0][0] = { type: 'ou', owner: 'sente' }
    board[0][1] = { type: 'kin', owner: 'gote' }
    board[1][1] = { type: 'kin', owner: 'gote' }
    board[8][8] = { type: 'ou', owner: 'gote' }
    expect(isCheckmate(board, 'sente', emptyCaptured)).toBe(true)
  })

  it('王手でも合法手があれば詰みでない', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'ou', owner: 'sente' }
    board[4][0] = { type: 'hi', owner: 'gote' }
    board[0][0] = { type: 'ou', owner: 'gote' }
    // 王は逃げられる
    expect(isCheckmate(board, 'sente', emptyCaptured)).toBe(false)
  })
})

describe('processMove', () => {
  it('移動後に手番が交代する', () => {
    const state = createInitialGameState()
    const newState = processMove(state, {
      type: 'move',
      from: { row: 6, col: 4 },
      to: { row: 5, col: 4 },
      piece: { type: 'fu', owner: 'sente' },
      promoted: false,
    })
    expect(newState.currentPlayer).toBe('gote')
  })

  it('投了後は相手の勝利', () => {
    const state = createInitialGameState()
    const resigned = processResign(state)
    expect(resigned.status).toBe('resigned')
    expect(resigned.winner).toBe('gote')
  })
})

describe('processReset', () => {
  it('リセットで初期状態に戻る', () => {
    const initial = createInitialGameState()
    const reset = processReset()
    expect(reset.currentPlayer).toBe(initial.currentPlayer)
    expect(reset.status).toBe(initial.status)
    expect(reset.winner).toBe(initial.winner)
  })
})

describe('isSennichite', () => {
  it('同一局面が4回で千日手', () => {
    let history: string[] = []
    for (let i = 0; i < 4; i++) {
      history = addBoardHistory(history, 'same-hash')
    }
    expect(isSennichite(history)).toBe(true)
  })

  it('3回繰り返しでは千日手でない', () => {
    let history: string[] = []
    for (let i = 0; i < 3; i++) {
      history = addBoardHistory(history, 'same-hash')
    }
    expect(isSennichite(history)).toBe(false)
  })
})
