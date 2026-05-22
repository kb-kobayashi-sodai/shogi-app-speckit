export type Player = 'sente' | 'gote'

export type PieceType =
  | 'fu' | 'kyo' | 'kei' | 'gin' | 'kin' | 'kaku' | 'hi' | 'ou'
  | 'tofu' | 'narikyo' | 'narikei' | 'narigin' | 'uma' | 'ryu'

export type CapturablePieceType = 'fu' | 'kyo' | 'kei' | 'gin' | 'kin' | 'kaku' | 'hi'

export interface Piece {
  type: PieceType
  owner: Player
}

export interface Position {
  row: number
  col: number
}

export type Board = (Piece | null)[][]

export type CapturedPieces = Record<CapturablePieceType, number>

export interface AllCapturedPieces {
  sente: CapturedPieces
  gote: CapturedPieces
}

export type Move =
  | {
      type: 'move'
      from: Position
      to: Position
      piece: Piece
      captured?: Piece
      promoted: boolean
    }
  | {
      type: 'drop'
      to: Position
      pieceType: CapturablePieceType
      player: Player
    }

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'draw' | 'resigned'

export interface PendingPromotion {
  from: Position
  to: Position
  piece: Piece
}

export interface GameState {
  board: Board
  capturedPieces: AllCapturedPieces
  currentPlayer: Player
  status: GameStatus
  winner: Player | null
  pendingPromotion: PendingPromotion | null
  boardHistory: string[]
  selectedPosition: Position | null
  legalMoves: Position[]
  selectedCapturedPiece: CapturablePieceType | null
}
