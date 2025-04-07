import React from 'react';
import './ResultModal.css'; // We'll create this CSS file next

interface ResultModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  explanation: string;
  onClose: () => void; // Function to close the modal and proceed
  isLastQuestion: boolean;
}

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  isCorrect,
  explanation,
  onClose,
  isLastQuestion,
}) => {
  if (!isOpen) {
    return null; // Don't render anything if the modal is not open
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {isCorrect ? (
          <>
            <h3 className="correct-answer">正解！</h3>
            <p className="explanation">{explanation}</p>
          </>
        ) : (
          <>
            <h3 className="incorrect-answer">不正解！</h3>
            <p className="explanation">{explanation}</p>
          </>
        )}
        <button onClick={onClose} className="modal-button">
          {isLastQuestion ? '結果を保存してHomeへ' : '次の問題へ'}
        </button>
      </div>
    </div>
  );
};

export default ResultModal;
