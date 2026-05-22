import type { GameMode } from '../../game/types'

interface SideMenuProps {
  isOpen: boolean
  currentMode: GameMode
  onModeSelect: (mode: GameMode) => void
  onClose: () => void
}

export function SideMenu({ isOpen, currentMode, onModeSelect, onClose }: SideMenuProps) {
  return (
    <>
      <button
        className="hamburger-btn"
        onClick={onClose}
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <div className="side-menu-overlay" onClick={onClose}>
          <div className="side-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="side-menu-header">設定</div>
            <div className="side-menu-section-label">対戦モード</div>
            <button
              className={`side-menu-mode-btn${currentMode === 'human' ? ' side-menu-mode-btn--active' : ''}`}
              onClick={() => onModeSelect('human')}
            >
              {currentMode === 'human' && <span className="side-menu-check">✓</span>}
              人間同士
            </button>
            <button
              className={`side-menu-mode-btn${currentMode === 'computer' ? ' side-menu-mode-btn--active' : ''}`}
              onClick={() => onModeSelect('computer')}
            >
              {currentMode === 'computer' && <span className="side-menu-check">✓</span>}
              コンピュータ対戦
            </button>
          </div>
        </div>
      )}
    </>
  )
}
