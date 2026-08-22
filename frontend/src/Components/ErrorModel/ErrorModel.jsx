import './ErrorModel.css';

const ErrorModal = ({ isOpen, errorMessage, onClose }) => {
  if (!isOpen) return null; 

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">⚠️ Attention</h3>
        <p className="modal-message">{errorMessage}</p>
        <button className="modal-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;