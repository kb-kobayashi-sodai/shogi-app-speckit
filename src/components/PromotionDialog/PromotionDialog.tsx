import type { PendingPromotion } from '../../game/types'
import { getPieceLabel, promote } from '../../game/pieces'

interface PromotionDialogProps {
  pendingPromotion: PendingPromotion
  onChoice: (promote: boolean) => void
}

export function PromotionDialog({ pendingPromotion, onChoice }: PromotionDialogProps) {
  const { piece } = pendingPromotion
  const promotedLabel = getPieceLabel(promote(piece.type))
  const originalLabel = getPieceLabel(piece.type)

  return (
    <div className="promotion-overlay">
      <div className="promotion-dialog" role="dialog" aria-modal="true" aria-label="成り選択">
        <p className="promotion-title">成りますか？</p>
        <div className="promotion-options">
          <button
            className="promotion-btn promotion-btn--promote"
            onClick={() => onChoice(true)}
            autoFocus
          >
            <span className="promotion-piece">{promotedLabel}</span>
            <span className="promotion-label">成る</span>
          </button>
          <button
            className="promotion-btn promotion-btn--keep"
            onClick={() => onChoice(false)}
          >
            <span className="promotion-piece">{originalLabel}</span>
            <span className="promotion-label">成らない</span>
          </button>
        </div>
      </div>
    </div>
  )
}
