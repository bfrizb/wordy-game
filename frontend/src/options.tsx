import cogoToast from 'cogo-toast';
import _ from 'lodash';
import React from 'react';
import { clearUsedWords, SECONDS_TO_WAIT, getAllUsedWords, addUsedWords, DIFFICULTY_LEVELS } from './utils';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: 200,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  }),
);

export default function SearchListInput() {
  const classes = useStyles();

  return (
    <Paper component="form" className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="Find Shared List"
        inputProps={{ 'aria-label': 'search google maps' }}
      />
      <Divider className={classes.divider} orientation="vertical" />
      <IconButton
        color="primary"
        className={classes.iconButton}
        aria-label="directions"
        onClick={() => exportUsedWords()}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}

const createShortCode = async () => {
  const resp = await fetch('http://localhost:9000/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(getAllUsedWords()),
  });
  console.log(await resp.text());
};

const importUsedWords = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const allUsedWords = JSON.parse(reader.result);
        DIFFICULTY_LEVELS.forEach((diffLevel) => {
          addUsedWords(allUsedWords[diffLevel], diffLevel);
        });
      }
    };
    reader.readAsText(event.target.files[0]);
  }
};

const exportUsedWords = (): void => {
  const allUsedWords = getAllUsedWords();
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
        <br />
        <ButtonGroup orientation="vertical" variant="contained">
          <Button variant="contained" href="/used_words">
            View Used Words
          </Button>
          <Button variant="contained" href="/">
            Home Menu
          </Button>
        </ButtonGroup>
        <br />
        {/* Intentional Spacing */}
        <h2>Share Used Word List</h2>
        <ButtonGroup
          orientation="vertical"
          color="primary"
          aria-label="vertical contained primary button group"
          variant="contained"
        >
          <Button variant="contained" color="primary" onClick={() => createShortCode()}>
            Create Short Code
          </Button>
          <Button variant="contained" color="primary" onClick={() => exportUsedWords()}>
            Save as File
          </Button>
        </ButtonGroup>
        {/* Intentional Spacing */}
        <h2>Modify Used Word List</h2>
        <SearchListInput />
        <ButtonGroup
          orientation="vertical"
          color="primary"
          aria-label="vertical contained primary button group"
          variant="contained"
        >
          <Button variant="contained" color="primary" onClick={() => document.getElementById('upload-input')?.click()}>
            Import from File
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              clearUsedWords();
              cogoToast.success('Used word list cleared');
            }}
          >
            Clear Used Word List
          </Button>
        </ButtonGroup>
      </>
      <br />
    </>
  );
};
