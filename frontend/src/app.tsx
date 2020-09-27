import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import yaml from 'yaml';
import { Options } from './options';
import { UsedWords } from './used-words';
import { localStorageName } from './utils';
import { DisplayWord } from './display-word';
import { Home } from './home';

// TODO: Sharing used word list (saved on server)
// Feature: Options to select URL to use for word-list (thus custom word-lists)

const Game = () => {
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [wordList, setWordList] = useState<string[]>([]);

  useEffect(() => {
    const readWordList = async () => {
      let resp = await fetch('http://localhost:9000/wordList');
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

  const MainPage = () => {
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
      return <Home setNewWord={setNewWord} />;
    }
  };

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <MainPage />
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
