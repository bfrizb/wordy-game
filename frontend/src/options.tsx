import cogoToast from 'cogo-toast';
import _ from 'lodash';
import React from 'react';
import { SECONDS_TO_WAIT, allLocalStorageNames } from './utils';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  button: {
    margin: '10px 0px',
  },
});

const clearUsedWords = (): void => {
  allLocalStorageNames().forEach((lsKey) => {
    localStorage.removeItem(lsKey);
  });
  cogoToast.success('Used word list cleared');
};

const importUsedWords = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const allUsedWords = JSON.parse(reader.result);
        allLocalStorageNames().forEach((lsKey) => {
          localStorage.setItem(lsKey, allUsedWords[lsKey] || []);
        });
      }
    };
    reader.readAsText(event.target.files[0]);
  }
};

const exportUsedWords = (): void => {
  let allUsedWords: { [key: string]: string } = {};
  allLocalStorageNames().forEach((lsKey) => {
    const someUsedWords = localStorage.getItem(lsKey);
    if (someUsedWords) {
      allUsedWords[lsKey] = someUsedWords;
    }
  });
  if (_.isEmpty(allUsedWords)) {
    cogoToast.error('Word list is empty');
    return;
  }
  const ephemeralElement = document.createElement('a');
  ephemeralElement.href = URL.createObjectURL(new Blob([JSON.stringify(allUsedWords)], { type: 'application/json' }));
  ephemeralElement.download = 'usedWords.json';
  document.body.appendChild(ephemeralElement); // Required for FireFox
  ephemeralElement.click();
};

export const Options = () => {
  const classes = useStyles();
  const [secondsToWait, setSecondsToWait] = React.useState(parseInt(localStorage.getItem(SECONDS_TO_WAIT) || '3'));
  return (
    <>
      <h1>Game Options</h1>

      {/*Invisible file input button*/}
      <input
        type="file"
        onChange={importUsedWords}
        id="upload-input"
        style={{
          display: 'none',
        }}
      />
      <>
        Wait&nbsp;
        <select
          value={secondsToWait}
          onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
            const newSecondsToWait = event.target.value as string;
            setSecondsToWait(parseInt(newSecondsToWait));
            localStorage.setItem(SECONDS_TO_WAIT, newSecondsToWait);
          }}
        >
          {[0, 1, 2, 3, 5, 9].map((value) => (
            <option>{value}</option>
          ))}
        </select>
        &nbsp;Seconds before revealing word
        <br />
        <ButtonGroup
          className={classes.button}
          orientation="vertical"
          color="primary"
          aria-label="vertical contained primary button group"
          variant="contained"
        >
          <Button variant="contained" color="primary" onClick={() => clearUsedWords()}>
            Clear Used Word List
          </Button>
          <Button variant="contained" color="primary" onClick={() => document.getElementById('upload-input')?.click()}>
            Import Used Word List
          </Button>
          <Button variant="contained" color="primary" onClick={() => exportUsedWords()}>
            Export Used Word List
          </Button>
        </ButtonGroup>
      </>
      <br />

      <ButtonGroup orientation="vertical" variant="contained">
        <Button variant="contained" href="/used_words">
          Used Words
        </Button>
        <Button variant="contained" href="/">
          Home
        </Button>
      </ButtonGroup>
    </>
  );
};
