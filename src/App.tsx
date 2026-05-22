import { useState } from 'react'
import { useGame } from './hooks/useGame'
import { useComputerPlayer } from './hooks/useComputerPlayer'
import { Board } from './components/Board/Board'
import { GameStatus } from './components/GameStatus/GameStatus'
import { PromotionDialog } from './components/PromotionDialog/PromotionDialog'
import { CapturedPieces } from './components/CapturedPieces/CapturedPieces'
import { GameControls } from './components/GameControls/GameControls'
import { SideMenu } from './components/SideMenu/SideMenu'
import { ThinkingOverlay } from './components/ThinkingOverlay/ThinkingOverlay'
import type { GameMode } from './game/types'

export default function App() {
  const {
    state,
    dispatch,
    handleCellClick,
    handleCapturedPieceClick,
    handlePromotionChoice,
    handleResign,
    handleReset,
    handleChangeMode,
  } = useGame()

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

  useComputerPlayer(state, dispatch)

  const isGameActive = state.status === 'playing' || state.status === 'check'

  function handleModeSelect(mode: GameMode) {
    if (mode === state.gameMode) {
      setIsSideMenuOpen(false)
      return
    }
    if (isGameActive) {
      const confirmed = window.confirm(
        '対局中です。現在の対局を破棄して対戦モードを変更しますか？'
      )
      if (!confirmed) return
    }
    handleChangeMode(mode)
    setIsSideMenuOpen(false)
  }

  return (
    <div className="app">
      <SideMenu
        isOpen={isSideMenuOpen}
        currentMode={state.gameMode}
        onModeSelect={handleModeSelect}
        onClose={() => setIsSideMenuOpen((v) => !v)}
      />

      <h1 className="app-title">将棋</h1>

      <GameStatus
        currentPlayer={state.currentPlayer}
        status={state.status}
        winner={state.winner}
      />

      <div className="game-area" style={{ position: 'relative' }}>
        <CapturedPieces
          captured={state.capturedPieces.gote}
          owner="gote"
          isCurrentPlayer={state.currentPlayer === 'gote'}
          selectedPieceType={state.selectedCapturedPiece}
          onPieceClick={handleCapturedPieceClick}
          isGameOver={state.status === 'checkmate' || state.status === 'resigned' || state.status === 'draw'}
        />

        <Board
          board={state.board}
          selectedPosition={state.selectedPosition}
          legalMoves={state.legalMoves}
          currentPlayer={state.currentPlayer}
          status={state.status}
          onCellClick={handleCellClick}
        />

        <CapturedPieces
          captured={state.capturedPieces.sente}
          owner="sente"
          isCurrentPlayer={state.currentPlayer === 'sente'}
          selectedPieceType={state.selectedCapturedPiece}
          onPieceClick={handleCapturedPieceClick}
          isGameOver={state.status === 'checkmate' || state.status === 'resigned' || state.status === 'draw'}
        />

        <ThinkingOverlay isVisible={state.isComputerThinking} />
      </div>

      <GameControls
        status={state.status}
        currentPlayer={state.currentPlayer}
        onResign={handleResign}
        onReset={handleReset}
      />

      {state.pendingPromotion && (
        <PromotionDialog
          pendingPromotion={state.pendingPromotion}
          onChoice={handlePromotionChoice}
        />
      )}
    </div>
  )
}
