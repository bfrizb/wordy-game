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
export const SHORT_SHARING_CODE_NAME = 'shortSharingCode';

// TODO - change to simple array (PARTIALLY DONE)
export const DIFFICULTY_LEVELS: string[] = ['Easy', 'Medium', 'Hard'];

export const clearUsedWords = (): void => {
  localStorage.removeItem(USED_WORDS);
};

export const getUsedWords = (diffLevel: string): string[] => {
  return JSON.parse(localStorage.getItem(USED_WORDS) || '{}')[diffLevel];
};

export const getAllUsedWords = () => {
  let allUsedWords: { [key: string]: string[] } = {};
  DIFFICULTY_LEVELS.forEach((diffLevel) => {
    allUsedWords[diffLevel] = getUsedWords(diffLevel);
  });
  return allUsedWords;
};

export const addUsedWords = (words: string[], diffLevel: string): void => {
  let usedWords = JSON.parse(localStorage.getItem(USED_WORDS) || '{}');
  if (usedWords === {}) {
    usedWords = { version: APP_VERSION };
  }
  words.forEach((w) => {
    if (usedWords.hasOwnProperty(diffLevel)) {
      usedWords[diffLevel].push(w);
    } else {
      usedWords[diffLevel] = [w];
    }
  });
  localStorage.setItem(USED_WORDS, JSON.stringify(usedWords));
};
