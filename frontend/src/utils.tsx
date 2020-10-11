const USED_WORDS = 'usedWords';
const APP_VERSION = 1;

/* Local Storage Structure
  Key = "usedWords"
  Value = <Stringified JSON>
    {
      "version": "1",  // REQUIRED
      "shortLink": "abcd",
      "Easy": ["hello", "world"],
      "Medium": ["nuclear"],
      "Hard": ["subcutaneous"]
    }
*/

export const SECONDS_TO_WAIT = 'secondsToWait';

export const DIFFICULTY_MAP: { [key: string]: string } = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

export const clearUsedWords = (): void => {
  localStorage.removeItem(USED_WORDS);
};

export const getUsedWords = (difficultyNumberString: string): string[] => {
  return JSON.parse(localStorage.getItem(USED_WORDS) || '{}')[DIFFICULTY_MAP[difficultyNumberString]];
};

export const addUsedWord = (word: string, difficulty: string): void => {
  let usedWords = JSON.parse(localStorage.getItem(USED_WORDS) || '{}');
  if (usedWords == {}) {
    usedWords = { version: APP_VERSION };
  }
  if (usedWords.hasOwnProperty(DIFFICULTY_MAP[difficulty])) {
    usedWords[DIFFICULTY_MAP[difficulty]].push(word);
  } else {
    usedWords[DIFFICULTY_MAP[difficulty]] = [word];
  }

  localStorage.setItem(USED_WORDS, JSON.stringify(usedWords));
};

// =============

export const SHORT_SHARING_CODE_NAME = 'shortSharingCode';
