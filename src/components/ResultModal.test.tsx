import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultModal from './ResultModal';

describe('ResultModal', () => {
  it('should render correctly when the answer is correct', () => {
    render(
      <ResultModal
        isOpen={true}
        isCorrect={true}
        explanation="This is a correct explanation."
        onClose={() => {}}
        isLastQuestion={false}
      />
    );

    expect(screen.getByText('正解！')).toBeInTheDocument();
    expect(screen.getByText('This is a correct explanation.')).toBeInTheDocument();
    expect(screen.getByText('次の問題へ')).toBeInTheDocument();
  });

  it('should render correctly when the answer is incorrect', () => {
    render(
      <ResultModal
        isOpen={true}
        isCorrect={false}
        explanation="This is an incorrect explanation."
        onClose={() => {}}
        isLastQuestion={false}
      />
    );

    expect(screen.getByText('不正解！')).toBeInTheDocument();
    expect(screen.getByText('This is an incorrect explanation.')).toBeInTheDocument();
    expect(screen.getByText('次の問題へ')).toBeInTheDocument();
  });

  it('should render the correct button text when it is the last question', () => {
    render(
      <ResultModal
        isOpen={true}
        isCorrect={true}
        explanation="This is a correct explanation."
        onClose={() => {}}
        isLastQuestion={true}
      />
    );

    expect(screen.getByText('結果を保存してHomeへ')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ResultModal
        isOpen={false}
        isCorrect={true}
        explanation="This is a correct explanation."
        onClose={() => {}}
        isLastQuestion={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
