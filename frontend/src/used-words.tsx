import React from 'react';
import { DIFFICULTY_LEVELS, getUsedWords } from './utils';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

export const UsedWords = () => {
  const wordsByDifficulty: React.ReactFragment[] = [];
  for (const diffLevel in DIFFICULTY_LEVELS) {
    wordsByDifficulty.push(
      <p>
        {diffLevel}: {getUsedWords(diffLevel) || '[]'}
      </p>,
    );
  }
  return (
    <>
      <h1>Used Words</h1>
      {wordsByDifficulty}

      <ButtonGroup orientation="vertical" variant="contained">
        <Button variant="contained" href="/options">
          Options
        </Button>
        <Button variant="contained" href="/">
          Home
        </Button>
      </ButtonGroup>
    </>
  );
};
