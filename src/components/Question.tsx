import React from 'react';

interface QuestionProps {
  question: string;
  options: string[];
  onAnswerClick: (answer: string) => void;
  showResult: boolean;
  scriptContext: string;
}

const Question: React.FC<QuestionProps> = ({
  question,
  options,
  onAnswerClick,
  showResult,
  scriptContext,
}) => {
  return (
    <div className="question-container">
      <h2>{question}</h2>
      <p className="scriptContext" dangerouslySetInnerHTML={{ __html: scriptContext }} />
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
