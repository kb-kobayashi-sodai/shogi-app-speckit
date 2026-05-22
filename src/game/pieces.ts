import type { PieceType, CapturablePieceType, Player } from './types'

const LABELS: Record<PieceType, string> = {
  fu: '歩兵', kyo: '香車', kei: '桂馬', gin: '銀将', kin: '金将',
  kaku: '角行', hi: '飛車', ou: '王将',
  tofu: 'と', narikyo: '成香', narikei: '成桂', narigin: '成銀',
  uma: '竜馬', ryu: '竜王',
}

const PROMOTABLE: Set<PieceType> = new Set(['fu','kyo','kei','gin','kaku','hi'])

const PROMOTE_MAP: Partial<Record<PieceType, PieceType>> = {
  fu: 'tofu', kyo: 'narikyo', kei: 'narikei',
  gin: 'narigin', kaku: 'uma', hi: 'ryu',
}

const UNPROMOTE_MAP: Partial<Record<PieceType, CapturablePieceType>> = {
  tofu: 'fu', narikyo: 'kyo', narikei: 'kei',
  narigin: 'gin', uma: 'kaku', ryu: 'hi',
}

export function getPieceLabel(type: PieceType): string {
  return LABELS[type]
}

export function canPromote(type: PieceType): boolean {
  return PROMOTABLE.has(type)
}

export function mustPromote(type: PieceType, toRow: number, player: Player): boolean {
  if (player === 'sente') {
    if (type === 'fu' || type === 'kyo') return toRow === 0
    if (type === 'kei') return toRow <= 1
  } else {
    if (type === 'fu' || type === 'kyo') return toRow === 8
    if (type === 'kei') return toRow >= 7
  }
  return false
}

export function promote(type: PieceType): PieceType {
  return PROMOTE_MAP[type] ?? type
}

export function unpromote(type: PieceType): CapturablePieceType {
  const base = UNPROMOTE_MAP[type]
  if (base) return base
  return type as CapturablePieceType
}

export function isPromoted(type: PieceType): boolean {
  return type in UNPROMOTE_MAP
}
