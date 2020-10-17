import React from 'react';
import { DIFFICULTY_LEVELS } from './utils';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';

type HomeProps = {
  setNewWord: (difficulty: string | null) => void;
};

const useStyles = makeStyles({
  button: {
    margin: '10px 0px',
  },
});

export const Home = (props: HomeProps) => {
  const classes = useStyles();
  // Allows user to select word difficulty
  const buttons: React.ReactFragment[] = [];

  DIFFICULTY_LEVELS.forEach((diffLevel) => {
    const buttonTitle = `${diffLevel} Word`;
    buttons.push(
      <Button variant="contained" color="primary" onClick={() => props.setNewWord(diffLevel)}>
        {buttonTitle}
      </Button>,
    );
  });
  return (
    <>
      <h1>Home Menu</h1>
      <h2>Select Difficulty</h2>
      <ButtonGroup
        className={classes.button}
        orientation="vertical"
        color="primary"
        aria-label="vertical contained primary button group"
        variant="contained"
      >
        {buttons}
      </ButtonGroup>
      <br /> {/* TODO - Replace */}
      <ButtonGroup orientation="vertical" variant="contained">
        <Button variant="contained" href="/used_words">
          Used Words
        </Button>
        <Button variant="contained" href="/options">
          Options
        </Button>
      </ButtonGroup>
    </>
  );
};
