import { QuestionData, QuizData } from '../types';

const INCORRECT_QUESTIONS_KEY = 'incorrectQuestions';
const MAX_QUESTIONS_PER_QUIZ = 5;

/**
 * Retrieves the list of incorrect questions from local storage.
 * @returns An array of QuestionData objects or an empty array if none are found.
 */
export const getIncorrectQuestionsFromStorage = (): QuestionData[] => {
  const storedQuestions = localStorage.getItem(INCORRECT_QUESTIONS_KEY);
  return storedQuestions ? JSON.parse(storedQuestions) : [];
};

/**
 * Saves newly identified incorrect questions to local storage, avoiding duplicates.
 * @param quizQuestions - All questions from the current quiz.
 * @param userAnswers - The answers provided by the user for the current quiz.
 * @param currentSeason - The season number of the current quiz.
 * @param currentEpisode - The episode number of the current quiz.
 */
export const saveIncorrectQuestionsToStorage = (
  quizQuestions: QuestionData[],
  userAnswers: (string | null)[],
  currentSeason: string,
  currentEpisode: string
): void => {
  const incorrectQuestions = quizQuestions
    // Filter for questions that were answered and answered incorrectly
    .filter((question, index) => userAnswers[index] !== null && userAnswers[index] !== question.correctAnswer)
    // Add season and episode context to each incorrect question
    .map(q => ({ ...q, season: currentSeason, episode: currentEpisode }));

  const existingQuestions = getIncorrectQuestionsFromStorage();

  // Add new incorrect questions, ensuring no duplicates based on season, episode, and question value
  incorrectQuestions.forEach(newQuestion => {
    if (!existingQuestions.find(q =>
        q.season === newQuestion.season &&
        q.episode === newQuestion.episode &&
        q.value === newQuestion.value
      )) {
      existingQuestions.push(newQuestion);
    }
  });

  localStorage.setItem(INCORRECT_QUESTIONS_KEY, JSON.stringify(existingQuestions));
};


/**
 * Fetches quiz data for a specific episode or retrieves incorrect questions for review.
 * Randomly selects up to MAX_QUESTIONS_PER_QUIZ questions if not in review mode.
 * @param season - The season number.
 * @param episode - The episode number.
 * @param review - Flag indicating if it's a review session.
 * @returns A Promise resolving to QuizData or null if an error occurs.
 */
export const fetchQuizDataForEpisode = async (
  season: string,
  episode: string,
  review: boolean | undefined
): Promise<QuizData | null> => {
  try {
    if (review) {
      const questions = getIncorrectQuestionsFromStorage();
      return { questions };
    } else {
      const response = await fetch(`../../data/season${season}/episode${episode}/quiz.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const originalData: QuizData = await response.json();

      // Randomly select questions if there are more than the max limit
      let finalQuestions = originalData.questions;
      if (originalData.questions.length > MAX_QUESTIONS_PER_QUIZ) {
        const allIndices = originalData.questions.map((_, index) => index);

        // Fisher-Yates (Knuth) Shuffle
        for (let i = allIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
        }

        const selectedIndices = allIndices.slice(0, MAX_QUESTIONS_PER_QUIZ);
        selectedIndices.sort((a, b) => a - b); // Preserve relative order

        finalQuestions = selectedIndices.map(index => originalData.questions[index]);
      }
      return { questions: finalQuestions };
    }
  } catch (error) {
    console.error('Error fetching quiz data:', error);
    return null; // Return null or an empty QuizData object on error
  }
};

/**
 * Fetches the script context (relevant line) for a given question.
 * @param question - The QuestionData object.
 * @returns A Promise resolving to the HTML string of the script context or an error message.
 */
export const fetchScriptContextForQuestion = async (question: QuestionData): Promise<string> => {
  const scriptPath = `../../data/season${question.season}/episode${question.episode}/script.txt`;
  try {
    const response = await fetch(scriptPath);
     if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    const scriptText = await response.text();
    const questionValue = question.value;
    const scriptLines = scriptText.split('\n');

    let context = 'ヒントが見つかりませんでした。<br />'; // Default message
    for (let i = 0; i < scriptLines.length; i++) {
      if (scriptLines[i].includes(questionValue)) {
        let line = scriptLines[i];
        const parts = line.split(': ');
        if (parts.length > 1) {
          const speaker = parts[0];
          const body = parts.slice(1).join(': ');
          // Highlight speaker and format line break
          line = `<strong>${speaker}</strong>:<br />${body}`;
        }
        // Highlight the specific question phrase within the line
        line = line.replace(questionValue, `<strong class="highlight">${questionValue}</strong>`);
        context = line + '<br />'; // Add line break for display
        break; // Found the line, exit loop
      }
    }
    return context;
  } catch (error) {
    console.error('Error fetching script context:', error);
    return 'ヒントの取得に失敗しました。<br />';
  }
};

/**
 * Updates the list of incorrect questions in local storage after a review session,
 * removing questions that were answered correctly.
 * @param reviewedQuestions - The questions that were part of the review session.
 * @param userAnswers - The answers provided by the user during the review session.
 */
export const updateIncorrectQuestionsInStorage = (
  reviewedQuestions: QuestionData[],
  userAnswers: (string | null)[]
): void => {
  let existingQuestions = getIncorrectQuestionsFromStorage();

  // Create a set of identifiers for correctly answered questions during the review
  const correctlyAnsweredIds = new Set<string>();
  reviewedQuestions.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      // Use a unique identifier (season-episode-value)
      correctlyAnsweredIds.add(`${question.season}-${question.episode}-${question.value}`);
    }
  });

  // Filter the existing stored questions, keeping only those not correctly answered in this review
  existingQuestions = existingQuestions.filter(question =>
    !correctlyAnsweredIds.has(`${question.season}-${question.episode}-${question.value}`)
  );

  localStorage.setItem(INCORRECT_QUESTIONS_KEY, JSON.stringify(existingQuestions));
};
