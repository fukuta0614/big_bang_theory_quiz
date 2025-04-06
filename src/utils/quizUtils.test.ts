import {
  getIncorrectQuestionsFromStorage,
  saveIncorrectQuestionsToStorage,
  updateIncorrectQuestionsInStorage,
  fetchQuizDataForEpisode,
  fetchScriptContextForQuestion,
} from './quizUtils';
import { QuestionData } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('quizUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getIncorrectQuestionsFromStorage', () => {
    it('should return an empty array if no questions are stored', () => {
      const result = getIncorrectQuestionsFromStorage();
      expect(result).toEqual([]);
    });

    it('should return the stored questions if they exist', () => {
      const mockQuestions: QuestionData[] = [
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' },
        { value: 'Question 2', options: ['C', 'D'], correctAnswer: 'C', explanation: 'Exp 2', season: '01', episode: '02' },
      ];
      localStorage.setItem('incorrectQuestions', JSON.stringify(mockQuestions));

      const result = getIncorrectQuestionsFromStorage();
      expect(result).toEqual(mockQuestions);
    });
  });

  describe('saveIncorrectQuestionsToStorage', () => {
    it('should save incorrect questions to local storage', () => {
      const mockQuestions: QuestionData[] = [
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'B', explanation: 'Exp 1', season: '01', episode: '01' },
        { value: 'Question 2', options: ['C', 'D'], correctAnswer: 'D', explanation: 'Exp 2', season: '01', episode: '02' },
      ];
      const userAnswers = ['A', 'C'];
      saveIncorrectQuestionsToStorage(mockQuestions, userAnswers, '01', '01');

      const storedQuestions = JSON.parse(localStorage.getItem('incorrectQuestions') || '[]');
      expect(storedQuestions).toEqual([
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'B', explanation: 'Exp 1', season: '01', episode: '01' },
        { value: 'Question 2', options: ['C', 'D'], correctAnswer: 'D', explanation: 'Exp 2', season: '01', episode: '01' },
      ]);
    });

    it('should not save correct questions to local storage', () => {
      const mockQuestions: QuestionData[] = [
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' },
        { value: 'Question 2', options: ['C', 'D'], correctAnswer: 'C', explanation: 'Exp 2', season: '01', episode: '02' },
      ];
      const userAnswers = ['A', 'C'];
      saveIncorrectQuestionsToStorage(mockQuestions, userAnswers, '01', '01');

      const storedQuestions = JSON.parse(localStorage.getItem('incorrectQuestions') || '[]');
      expect(storedQuestions).toEqual([]);
    });

    it('should avoid duplicate questions in local storage', () => {
      const mockQuestions: QuestionData[] = [
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'B', explanation: 'Exp 1', season: '01', episode: '01' },
      ];
      const userAnswers = ['A'];
      localStorage.setItem('incorrectQuestions', JSON.stringify(mockQuestions));
      saveIncorrectQuestionsToStorage(mockQuestions, userAnswers, '01', '01');

      const storedQuestions = JSON.parse(localStorage.getItem('incorrectQuestions') || '[]');
      expect(storedQuestions).toEqual([
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'B', explanation: 'Exp 1', season: '01', episode: '01' },
      ]);
    });
  });

  describe('updateIncorrectQuestionsInStorage', () => {
    it('should remove correctly answered questions from local storage', () => {
      const mockQuestions: QuestionData[] = [
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'B', explanation: 'Exp 1', season: '01', episode: '01' },
        { value: 'Question 2', options: ['C', 'D'], correctAnswer: 'D', explanation: 'Exp 2', season: '01', episode: '02' },
      ];
      localStorage.setItem('incorrectQuestions', JSON.stringify(mockQuestions));
      const userAnswers = ['B', 'C'];
      updateIncorrectQuestionsInStorage(mockQuestions, userAnswers);

      const storedQuestions = JSON.parse(localStorage.getItem('incorrectQuestions') || '[]');
      expect(storedQuestions).toEqual([
        { value: 'Question 2', options: ['C', 'D'], correctAnswer: 'D', explanation: 'Exp 2', season: '01', episode: '02' },
      ]);
    });
  });

  describe('fetchQuizDataForEpisode', () => {
    it('should fetch quiz data from local storage when review is true', async () => {
      const mockQuestions: QuestionData[] = [
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' },
      ];
      localStorage.setItem('incorrectQuestions', JSON.stringify(mockQuestions));

      const result = await fetchQuizDataForEpisode('01', '01', true);
      expect(result).toEqual({ questions: mockQuestions });
    });

    it('should fetch quiz data from JSON file when review is false', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ questions: [{ value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' }] }),
      }) as jest.Mock;

      const result = await fetchQuizDataForEpisode('01', '01', false);
      expect(result).toEqual({ questions: [{ value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' }] });
    });

    it('should handle errors when fetching quiz data from JSON file', async () => {
       global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }) as jest.Mock;

      const result = await fetchQuizDataForEpisode('01', '01', false);
      expect(result).toBeNull();
    });
  });

  describe('fetchScriptContextForQuestion', () => {
    it('should fetch script context from script file', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('Sheldon: This is a question about Question 1.'),
      }) as jest.Mock;

      const mockQuestion: QuestionData = { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' };
      const result = await fetchScriptContextForQuestion(mockQuestion);
      expect(result).toEqual('<strong>Sheldon</strong>:<br />This is a question about <strong class="highlight">Question 1</strong>.<br />');
    });

    it('should return "ヒントが見つかりませんでした" when the question is not found in the script', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('Sheldon: This is a script.'),
      }) as jest.Mock;
      (globalThis as any).fetch = mockFetch;

      const mockQuestion: QuestionData = { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' };
      const result = await fetchScriptContextForQuestion(mockQuestion);
      expect(result).toEqual('ヒントが見つかりませんでした。<br />');
    });

    it('should handle errors when fetching script context from script file', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }) as jest.Mock;
      (globalThis as any).fetch = mockFetch;

      const mockQuestion: QuestionData = { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' };
      const result = await fetchScriptContextForQuestion(mockQuestion);
      expect(result).toEqual('ヒントの取得に失敗しました。<br />');
    });
  });

  describe('fetchQuizDataForEpisode', () => {
    it('should fetch quiz data from local storage when review is true', async () => {
      const mockQuestions: QuestionData[] = [
        { value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' },
      ];
      localStorage.setItem('incorrectQuestions', JSON.stringify(mockQuestions));

      const result = await fetchQuizDataForEpisode('01', '01', true);
      expect(result).toEqual({ questions: mockQuestions });
    });

    it('should fetch quiz data from JSON file when review is false', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ questions: [{ value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' }] }),
      }) as jest.Mock;
      (globalThis as any).fetch = mockFetch;

      const result = await fetchQuizDataForEpisode('01', '01', false);
      expect(result).toEqual({ questions: [{ value: 'Question 1', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Exp 1', season: '01', episode: '01' }] });
    });

    it('should handle errors when fetching quiz data from JSON file', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }) as jest.Mock;
      (globalThis as any).fetch = mockFetch;

      const result = await fetchQuizDataForEpisode('01', '01', false);
      expect(result).toBeNull();
    });
  });
});
