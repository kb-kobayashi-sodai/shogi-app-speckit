interface ThinkingOverlayProps {
  isVisible: boolean
}

export function ThinkingOverlay({ isVisible }: ThinkingOverlayProps) {
  if (!isVisible) return null
  return (
    <div className="thinking-overlay">
      <span className="thinking-text">思考中...</span>
    </div>
  )
}
