import type { Board, AllCapturedPieces, Player, PieceType, Piece } from './types'

const S = (type: PieceType): Piece => ({ type, owner: 'sente' as Player })
const G = (type: PieceType): Piece => ({ type, owner: 'gote' as Player })

export const BOARD_SIZE = 9

export const ENEMY_ZONE_ROWS: Record<Player, number[]> = {
  sente: [0, 1, 2],
  gote: [6, 7, 8],
}

export const INITIAL_BOARD: Board = [
  [G('kyo'), G('kei'), G('gin'), G('kin'), G('ou'),  G('kin'), G('gin'), G('kei'), G('kyo')],
  [null,     G('hi'),  null,     null,     null,     null,     null,     G('kaku'),null    ],
  [G('fu'),  G('fu'),  G('fu'),  G('fu'),  G('fu'),  G('fu'),  G('fu'),  G('fu'),  G('fu') ],
  [null,     null,     null,     null,     null,     null,     null,     null,     null    ],
  [null,     null,     null,     null,     null,     null,     null,     null,     null    ],
  [null,     null,     null,     null,     null,     null,     null,     null,     null    ],
  [S('fu'),  S('fu'),  S('fu'),  S('fu'),  S('fu'),  S('fu'),  S('fu'),  S('fu'),  S('fu') ],
  [null,     S('kaku'),null,     null,     null,     null,     null,     S('hi'),  null    ],
  [S('kyo'), S('kei'), S('gin'), S('kin'), S('ou'),  S('kin'), S('gin'), S('kei'), S('kyo')],
]

export const INITIAL_CAPTURED: AllCapturedPieces = {
  sente: { fu: 0, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 },
  gote:  { fu: 0, kyo: 0, kei: 0, gin: 0, kin: 0, kaku: 0, hi: 0 },
}
