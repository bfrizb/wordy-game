import { IconButton, InputBase, Paper } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import cogoToast from 'cogo-toast';
import React, { Dispatch, SetStateAction } from 'react';
import {
  addUsedWords,
  clearUsedWords,
  DIFFICULTY_LEVELS,
  getAllUsedWords,
  getItem,
  saveUsedWords,
  SECONDS_TO_WAIT,
  setItem,
  SHARING_CODE_NAME,
} from '../utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
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

const useStickyState = (defaultValue: any, key: any) => {
  const [value, setValue] = React.useState(() => {
    const stickyValue = getItem(key);
    return stickyValue !== undefined ? JSON.parse(stickyValue) : defaultValue;
  });
  React.useEffect(() => {
    setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

const revokeSharingCode = async (setSharingCode: Dispatch<SetStateAction<string | null>>) => {
  await fetch('http://localhost:9000/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([getItem(SHARING_CODE_NAME)]),
  });
  setSharingCode(null);
};

const ShareWithOthers = ({ usedListIsEmpty }: { usedListIsEmpty: boolean }) => {
  const [sharingCode, setSharingCode] = useStickyState(null, SHARING_CODE_NAME);

  let sharingCodeElements;
  if (sharingCode && sharingCode.length > 0) {
    sharingCodeElements = (
      <>
        <p>
          Current Sharing Code: <b>{sharingCode}</b>
        </p>
        <Button variant="contained" color="primary" onClick={() => revokeSharingCode(setSharingCode)}>
          Revoke Sharing Code
        </Button>
      </>
    );
  } else {
    sharingCodeElements = (
      <Button variant="contained" color="primary" onClick={async () => setSharingCode(await saveUsedWords())}>
        Create Sharing Code
      </Button>
    );
  }

  let body;
  if (usedListIsEmpty) {
    body = <i>Cannot share because the Used Word List is Empty.</i>;
  } else {
    body = (
      <>
        <ButtonGroup
          orientation="vertical"
          color="primary"
          aria-label="vertical contained primary button group"
          variant="contained"
        >
          {sharingCodeElements}
          <Button variant="contained" color="primary" onClick={() => exportUsedWords()}>
            Save as File
          </Button>
        </ButtonGroup>
      </>
    );
  }

  return (
    <>
      <h3>Share with Others</h3>
      {body}
    </>
  );
};

const LoadUsedWords = ({
  usedListIsEmpty,
  setEmptyUsedList,
}: {
  usedListIsEmpty: boolean;
  setEmptyUsedList: Dispatch<SetStateAction<boolean>>;
}) => {
  let body;
  if (usedListIsEmpty) {
    body = (
      <>
        {/*Invisible file input button*/}
        <input
          type="file"
          onChange={(event) => importUsedWordsFromFile(event, setEmptyUsedList)}
          id="upload-input"
          style={{
            display: 'none',
          }}
        />
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
        </ButtonGroup>
      </>
    );
  } else {
    body = (
      <>
        You must{' '}
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            clearUsedWords();
            setEmptyUsedList(true);
            cogoToast.success('Used word list cleared');
          }}
        >
          Clear Used Word List
        </Link>{' '}
        before loading another list of used words.
      </>
    );
  }

  return (
    <>
      <h3>Load Used Words</h3>
      {body}
    </>
  );
};

const ManageUsedWords = () => {
  const [emptyUsedList, setEmptyUsedList] = React.useState(
    Object.values(getAllUsedWords()).every((v) => v === undefined),
  );
  return (
    <>
      <h2>Manage Used Word List</h2>
      <ButtonGroup orientation="vertical" aria-label="vertical contained primary button group" variant="contained">
        <Button variant="contained" href="/used_words">
          View Used Words
        </Button>
        {!emptyUsedList && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              clearUsedWords();
              setEmptyUsedList(true);
              cogoToast.success('Used word list cleared');
            }}
          >
            Clear Used Word List
          </Button>
        )}
      </ButtonGroup>
      <ShareWithOthers usedListIsEmpty={emptyUsedList} />
      <LoadUsedWords usedListIsEmpty={emptyUsedList} setEmptyUsedList={setEmptyUsedList} />
    </>
  );
};

const parseUsedWordsFromJSON = (unparsedJson: string) => {
  const allUsedWords = JSON.parse(unparsedJson);
  DIFFICULTY_LEVELS.forEach((diffLevel) => {
    if (allUsedWords[diffLevel] !== undefined) addUsedWords(allUsedWords[diffLevel], diffLevel);
  });
};

const SearchListInput = () => {
  const classes = useStyles();
  const [sharingCode, setSharingCode] = React.useState<string>();

  const importUsedWordsFromServer = async (_event: any) => {
    console.log(getItem(SHARING_CODE_NAME));
    if (sharingCode === undefined) {
      cogoToast.error('Please enter a sharing code');
      return;
    }
    const resp = await fetch('http://localhost:9000/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([sharingCode]),
    });
    const result = await resp.text();
    if (result === undefined || result.length === 0) cogoToast.error('Used word list Not found');
    else {
      parseUsedWordsFromJSON(result);
      cogoToast.success('Used word successfully imported');
    }
  };

  return (
    <Paper className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="Enter Sharing Code"
        onKeyUp={(event) => {
          if (event.key === 'Enter') importUsedWordsFromServer(event);
        }}
        onChange={(event) => setSharingCode(event.target.value)}
      />
      <IconButton className={classes.iconButton} aria-label="search" onClick={importUsedWordsFromServer}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

const importUsedWordsFromFile = (
  event: React.ChangeEvent<HTMLInputElement>,
  setEmptyUsedList: Dispatch<SetStateAction<boolean>>,
) => {
  if (event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') parseUsedWordsFromJSON(reader.result);
    };
    reader.readAsText(event.target.files[0]);
    setEmptyUsedList(false);
    cogoToast.success('Used word successfully imported from file');
  }
};

const exportUsedWords = (): void => {
  const allUsedWords = getAllUsedWords();
  if (Object.values(getAllUsedWords()).every((v) => v === undefined)) {
    cogoToast.error('Word list is empty');
    return;
  }
  const ephemeralElement = document.createElement('a');
  ephemeralElement.href = URL.createObjectURL(new Blob([JSON.stringify(allUsedWords)], { type: 'application/json' }));
  ephemeralElement.download = 'usedWords.json';
  document.body.appendChild(ephemeralElement); // Required for FireFox
  ephemeralElement.click();
};

export const OptionsView = () => {
  const [secondsToWait, setSecondsToWait] = useStickyState(3, SECONDS_TO_WAIT);

  return (
    <>
      <h1>Game Options</h1>

      <>
        Wait&nbsp;
        <select
          value={secondsToWait}
          onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
            const newSecondsToWait = event.target.value as string;
            setSecondsToWait(parseInt(newSecondsToWait));
            setItem(SECONDS_TO_WAIT, newSecondsToWait);
          }}
        >
          {[0, 1, 2, 3, 5, 9].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        &nbsp;Seconds before revealing word
        <br />
        {/* Intentional Spacing */}
        <ManageUsedWords />
      </>
      <br />
    </>
  );
};
