import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import yaml from 'yaml';
import { Options } from './options';
import { UsedWords } from './used-words';
import { DIFFICULTY_MAP, localStorageName } from './utils';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';
import { DisplayWord } from './display-word';

// TODO: const Home = () => { is GIANT! reduce its size
// TODO: Sharing used word list (saved on server)
// TODO: Options to select URL to use for word-list (thus custom word-lists)

const useStyles = makeStyles({
  button: {
    margin: '10px 0px',
  },
});

const Game = () => {
  const classes = useStyles();
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [wordList, setWordList] = useState<string[]>([]);

  useEffect(() => {
    const readWordList = async () => {
      let resp = await fetch('http://localhost:9000/');
      setWordList(yaml.parse(await resp.text()));
    };
    readWordList();
  }, []);

  const setNewWord = (difficulty: number | null): void => {
    if (difficulty === null) throw new Error('difficulty level is "null" in "setNewWord"');
    setDifficulty(difficulty);
    console.log(wordList);
    var possibleWords = wordList[difficulty];
    let chosenWordIndex = Math.floor(possibleWords.length * Math.random());
    const usedWords = JSON.parse(localStorage.getItem(localStorageName(difficulty)) || '[]');

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
    usedWords.push(newWord);
    localStorage.setItem(localStorageName(difficulty), JSON.stringify(usedWords));
  };

  const Home = () => {
    if (difficulty) {
      return (
        <DisplayWord
          currentWord={currentWord}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          wordList={wordList}
          setNewWord={setNewWord}
        />
      );
    } else {
      // Allows user to select word difficulty
      const buttons: React.ReactFragment[] = [];

      for (const diffIndex in DIFFICULTY_MAP) {
        const buttonTitle = `${DIFFICULTY_MAP[diffIndex]} Word`;
        buttons.push(
          <Button variant="contained" color="primary" onClick={() => setNewWord(parseInt(diffIndex))}>
            {buttonTitle}
          </Button>,
        );
      }
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
    }
  };

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/used_words">
          <UsedWords />
        </Route>
        <Route path="/options">
          <Options />
        </Route>
      </Switch>
    </Router>
  );
};

export default Game;
