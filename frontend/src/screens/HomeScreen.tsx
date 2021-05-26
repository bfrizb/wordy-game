import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import React, { useState } from 'react';
import { addUsedWords, DIFFICULTY_LEVELS, getItem } from '../utils';
import { DisplayWordView } from './DisplayWordView';

type DifficultySelectorProps = {
  setNewWord: (difficulty: string | null) => void;
};

export const DifficultySelector = (props: DifficultySelectorProps) => {
  // Allows user to select word difficulty
  const buttons: React.ReactFragment[] = [];

  DIFFICULTY_LEVELS.forEach((diffLevel) => {
    const buttonTitle = `${diffLevel} Word`;
    buttons.push(
      <Button key={diffLevel} variant="contained" color="primary" onClick={() => props.setNewWord(diffLevel)}>
        {buttonTitle}
      </Button>,
    );
  });
  return (
    <>
      <h1>Home</h1>
      <h2>Select Difficulty</h2>
      <ButtonGroup
        style={{ marginBottom: '10px' }}
        orientation="vertical"
        color="primary"
        aria-label="vertical contained primary button group"
        variant="contained"
      >
        {buttons}
      </ButtonGroup>
    </>
  );
};

// TODO(P4): props type
export const HomeScreen = (props: any) => {
  const [currentWord, setCurrentWord] = useState<string | null>(null);

  const setNewWord = (diffLevel: string | null): void => {
    if (diffLevel === null) throw new Error('difficulty level is "null" in "setNewWord"');
    props.setDifficulty(diffLevel);
    var possibleWords = props.wordLists[diffLevel];

    let chosenWordIndex = Math.floor(possibleWords.length * Math.random());
    const usedWords = getItem(diffLevel) || [];

    // There's a better way to do this, but the probability of encountering a used word
    // is so low, that the inefficiencies here are negligible
    let newWord = possibleWords[chosenWordIndex];

    const originalIndex = chosenWordIndex;
    while (usedWords.includes(newWord)) {
      chosenWordIndex++;
      if (chosenWordIndex >= possibleWords.length) chosenWordIndex = 0;
      newWord = possibleWords[chosenWordIndex];

      if (chosenWordIndex === originalIndex) {
        console.log('Aborting as all possible words were used');
        return;
      }
    }
    setCurrentWord(newWord);
    addUsedWords([newWord], diffLevel);
  };

  if (props.difficulty) {
    return (
      <DisplayWordView
        currentWord={currentWord}
        diffLevel={props.difficulty}
        setDifficulty={props.setDifficulty}
        wordLists={props.wordLists}
        setNewWord={setNewWord}
      />
    );
  } else {
    return <DifficultySelector setNewWord={setNewWord} />;
  }
};
