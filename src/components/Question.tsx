import React from 'react';

interface QuestionProps {
  question: string;
  scriptContext: string;
  options: string[];
  onAnswerClick: (answer: string) => void;
  showResult: boolean;
}

const Question: React.FC<QuestionProps> = ({
  question,
  scriptContext,
  options,
  onAnswerClick,
  showResult,
}) => {
  return (
    <div className="question-container">
      <h2>{question}</h2>
      <p className="script-context">
        ヒント: {scriptContext}
      </p>
      <ul className="options-list">
        {options.map((option) => (
          <li key={option} className="option-item">
            <button
              className="option-button"
              onClick={() => onAnswerClick(option)}
              disabled={showResult}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Question;
