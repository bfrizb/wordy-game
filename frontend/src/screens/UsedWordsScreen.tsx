import React from 'react';
import { DIFFICULTY_LEVELS, getItem } from '../utils';

export const UsedWordsScreen = () => {
  const wordsByDifficulty: React.ReactFragment[] = [];
  DIFFICULTY_LEVELS.forEach((diffLevel) => {
    const usedWords = (getItem(diffLevel) || []).join(', ') || '<Empty>';
    wordsByDifficulty.push(
      <p>
        <b>{diffLevel}: </b> {usedWords}
      </p>,
    );
  });
  return (
    <>
      <h1>Used Words</h1>
      {wordsByDifficulty}
    </>
  );
};
