import type { Player, GameStatus as GameStatusType } from '../../game/types'

interface GameStatusProps {
  currentPlayer: Player
  status: GameStatusType
  winner: Player | null
}

function playerName(p: Player): string {
  return p === 'sente' ? '▲先手' : '△後手'
}

export function GameStatus({ currentPlayer, status, winner }: GameStatusProps) {
  if (status === 'checkmate') {
    return (
      <div className="game-status game-status--end">
        <span className="status-result">{playerName(winner!)}の勝ち！</span>
        <span className="status-sub">（詰み）</span>
      </div>
    )
  }

  if (status === 'resigned') {
    return (
      <div className="game-status game-status--end">
        <span className="status-result">{playerName(winner!)}の勝ち！</span>
        <span className="status-sub">（投了）</span>
      </div>
    )
  }

  if (status === 'draw') {
    return (
      <div className="game-status game-status--end">
        <span className="status-result">引き分け</span>
        <span className="status-sub">（千日手）</span>
      </div>
    )
  }

  return (
    <div className={`game-status${status === 'check' ? ' game-status--check' : ''}`}>
      <span className="status-turn">{playerName(currentPlayer)}の番</span>
      {status === 'check' && <span className="status-check">【王手！】</span>}
    </div>
  )
}
