import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import React, { useEffect } from 'react';
import { wordListsType } from '../Game';
import { DIFFICULTY_LEVELS, getItem, SECONDS_TO_WAIT } from '../utils';

type CountdownProps = {
  secondsLeft: number;
  setSecondsLeft: (input: number) => void;
  currentWord: string | null;
};

const Countdown = (props: CountdownProps) => {
  const { secondsLeft, setSecondsLeft, currentWord } = props;
  useEffect(() => {
    // https://dev.to/zhiyueyi/how-to-create-a-simple-react-countdown-timer-4mc3
    secondsLeft > 0 && setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
  }, [secondsLeft, setSecondsLeft]);

  if (secondsLeft > 0) return <h1>Word displayed in: {secondsLeft} seconds</h1>;
  else return <h1 style={{ fontSize: 40, textTransform: 'capitalize' }}>{currentWord}</h1>;
};

type DisplayWordProps = {
  currentWord: string | null;
  diffLevel: string;
  setDifficulty: (input: null) => void;
  wordLists: wordListsType;
  setNewWord: (difficulty: string | null) => void;
};

export const DisplayWordView = (props: DisplayWordProps) => {
  // Check if all words have been used
  const possibleWords = props.wordLists[props.diffLevel];
  const alreadyUsedWords = getItem(props.diffLevel);
  const [secondsLeft, setSecondsLeft] = React.useState(getItem(SECONDS_TO_WAIT) || 3);

  if (possibleWords.length === alreadyUsedWords.length) {
    return (
      <>
        <h1 style={{ fontSize: 40, textTransform: 'capitalize' }}>All words used. You must REALLY like this game!</h1>
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
        <Button
          key={diffLevel}
          variant="contained"
          disabled={secondsLeft !== 0}
          onClick={() => {
            props.setNewWord(diffLevel);
            setSecondsLeft(getItem(SECONDS_TO_WAIT) || 3);
          }}
        >
          {buttonTitle}
        </Button>,
      );
    }
  });
  return (
    <>
      <div>
        <h2>The {props.diffLevel} word is ...</h2>
        <Countdown secondsLeft={secondsLeft} setSecondsLeft={setSecondsLeft} currentWord={props.currentWord} />
      </div>
      <Button
        color="primary"
        variant="contained"
        disabled={secondsLeft !== 0}
        onClick={() => {
          props.setNewWord(props.diffLevel);
          setSecondsLeft(getItem(SECONDS_TO_WAIT) || 3);
        }}
      >
        {nextTitle}
      </Button>
      <br />
      <br />
      <ButtonGroup orientation="vertical" variant="contained">
        {buttons}
      </ButtonGroup>
    </>
  );
};
