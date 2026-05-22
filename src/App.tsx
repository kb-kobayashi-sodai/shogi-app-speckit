import { useGame } from './hooks/useGame'
import { Board } from './components/Board/Board'
import { GameStatus } from './components/GameStatus/GameStatus'
import { PromotionDialog } from './components/PromotionDialog/PromotionDialog'
import { CapturedPieces } from './components/CapturedPieces/CapturedPieces'
import { GameControls } from './components/GameControls/GameControls'

export default function App() {
  const {
    state,
    handleCellClick,
    handleCapturedPieceClick,
    handlePromotionChoice,
    handleResign,
    handleReset,
  } = useGame()

  return (
    <div className="app">
      <h1 className="app-title">将棋</h1>

      <GameStatus
        currentPlayer={state.currentPlayer}
        status={state.status}
        winner={state.winner}
      />

      <div className="game-area">
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
