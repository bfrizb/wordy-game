import React, { useEffect } from 'react';
import { DIFFICULTY_LEVELS, SECONDS_TO_WAIT, getUsedWords } from './utils';
import { wordListsType } from './app';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

type CountdownProps = {
  numSeconds: number;
  currentWord: string | null;
};

const Countdown = (props: CountdownProps) => {
  const [secondsLeft, setSecondsLeft] = React.useState(props.numSeconds); // https://dev.to/zhiyueyi/how-to-create-a-simple-react-countdown-timer-4mc3

  useEffect(() => {
    secondsLeft > 0 && setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
  }, [secondsLeft]);

  if (secondsLeft === 0) return <h1 style={{ fontSize: 40, textTransform: 'capitalize' }}>{props.currentWord}</h1>;
  else return <h1>Word displayed in: {secondsLeft} seconds</h1>;
};

type DisplayWordProps = {
  currentWord: string | null;
  diffLevel: string;
  setDifficulty: (input: null) => void;
  wordLists: wordListsType;
  setNewWord: (difficulty: string | null) => void;
};

export const DisplayWord = (props: DisplayWordProps) => {
  // Check if all words have been used
  console.log('hiii');
  console.log(props.wordLists);
  console.log(props.wordLists[props.diffLevel]);
  const possibleWords = props.wordLists[props.diffLevel];
  const alreadyUsedWords = getUsedWords(props.diffLevel);
  if (possibleWords.length === alreadyUsedWords.length) {
    return (
      <>
        <h1 style={{ fontSize: 40, textTransform: 'capitalize' }}>All words used. You must REALLY like this game!</h1>
        <Button variant="contained" onClick={() => props.setDifficulty(null)}>
          Home
        </Button>
      </>
    );
  }

  // Displays word of the previously selected difficulty
  const nextTitle = `Next ${props.diffLevel} Word`;

  const buttons: React.ReactFragment[] = [];
  DIFFICULTY_LEVELS.forEach((diffLevel) => {
    if (diffLevel !== props.diffLevel) {
      const buttonTitle = `${diffLevel} Word`;
      buttons.push(
        <Button variant="contained" onClick={() => props.setNewWord(diffLevel)}>
          {buttonTitle}
        </Button>,
      );
    }
  });
  return (
    <>
      <div>
        <h2>The {props.diffLevel} word is ...</h2>
        <Countdown
          numSeconds={parseInt(localStorage.getItem(SECONDS_TO_WAIT) || '3')}
          currentWord={props.currentWord}
        />
      </div>
      <Button variant="contained" color="primary" onClick={() => props.setNewWord(props.diffLevel)}>
        {nextTitle}
      </Button>
      <br /> {/* TODO - Replace */}
      <br /> {/* TODO - Replace */}
      <ButtonGroup orientation="vertical" variant="contained">
        {buttons}
        <Button variant="contained" onClick={() => props.setDifficulty(null)}>
          Home
        </Button>
      </ButtonGroup>
    </>
  );
};
