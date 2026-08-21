import './ConfirmModal.css'

const ConfirmModal = ({
    title = 'Are you sure?',
    message = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    isBusy = false,
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="cfm-overlay" onClick={onCancel}>
            <div className="cfm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="cfm-title">{title}</h3>
                {message && <p className="cfm-message">{message}</p>}
                <div className="cfm-actions">
                    <button className="cfm-btn-cancel" onClick={onCancel} disabled={isBusy}>
                        {cancelLabel}
                    </button>
                    <button
                        className={`cfm-btn-confirm ${danger ? 'cfm-btn-danger' : ''}`}
                        onClick={onConfirm}
                        disabled={isBusy}
                    >
                        {isBusy ? 'Please wait…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
