const USED_WORDS = 'usedWords';
const APP_VERSION = 1;

/* Local Storage Structure
  Key = "usedWords"
  Value = <Stringified JSON>
    {
      "version": "1",  // REQUIRED
      secondsToWait: 3,
      "sharingCode": "abcd",
      "Easy": ["hello", "world"],
      "Medium": ["nuclear"],
      "Hard": ["subcutaneous"]
    }
*/

export const SECONDS_TO_WAIT = 'secondsToWait';
export const SHARING_CODE_NAME = 'sharingCode';
export const DIFFICULTY_LEVELS: string[] = ['Easy', 'Medium', 'Hard'];

// ==================

const getItem = (key: string) => {
  return JSON.parse(localStorage.getItem(USED_WORDS) || '{}')[key];
};

const setItem = (key: string, value: any) => {
  let usedWords = JSON.parse(localStorage.getItem(USED_WORDS) || '{}');
  if (usedWords === {}) {
    usedWords = { version: APP_VERSION };
  }
  usedWords[key] = value;
  localStorage.setItem(USED_WORDS, JSON.stringify(usedWords));
};

const clearUsedWords = (): void => {
  const waitSecs = getItem(SECONDS_TO_WAIT);
  localStorage.removeItem(USED_WORDS);
  if (waitSecs !== undefined) setItem(SECONDS_TO_WAIT, waitSecs);
};

// ===================

const saveUsedWords = async () => {
  const resp = await fetch('http://localhost:9000/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(getAllUsedWords()),
  });
  const sharingCode = await resp.text();
  return sharingCode;
};

// ===================

const getAllUsedWords = () => {
  let allUsedWords: { [key: string]: string[] } = {};
  DIFFICULTY_LEVELS.forEach((diffLevel) => {
    allUsedWords[diffLevel] = getItem(diffLevel);
  });
  return allUsedWords;
};

const addUsedWords = (words: string[], diffLevel: string): void => {
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
  // Only save used word list is a sharing code already exists
  if (getItem(SHARING_CODE_NAME)) saveUsedWords();
};

export { clearUsedWords, getItem, setItem, getAllUsedWords, addUsedWords, saveUsedWords };
