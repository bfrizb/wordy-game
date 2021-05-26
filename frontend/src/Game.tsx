import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Home';
import InfoIcon from '@material-ui/icons/Info';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import yaml from 'yaml';
import { AboutScreen } from './screens/AboutScreen';
import { HomeScreen } from './screens/HomeScreen';
import { OptionsView } from './screens/OptionsScreen';
import { UsedWordsScreen } from './screens/UsedWordsScreen';
// TODO (P7): Option to select URL to use for word-list (thus custom word-lists)

export type wordListsType = { [key: string]: string[] };

// TODO (P4): props type
const GameWithoutRouter = (props: any) => {
  const history = useHistory();
  const [drawerIsOpen, setDrawerIsOpen] = React.useState(false);

  const AppBarCustom = () => (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon onClick={() => setDrawerIsOpen(true)} />
        </IconButton>
        <Typography variant="h6">Wordy Game</Typography>
      </Toolbar>
    </AppBar>
  );

  const DrawerCustom = () => {
    const navChoices = [
      {
        key: 'Home',
        path: '/',
        icon: <HomeIcon />,
      },
      {
        key: 'About',
        path: '/about',
        icon: <InfoIcon />,
      },
      {
        key: 'Options',
        path: '/options',
        icon: <SettingsIcon />,
      },
    ];

    return (
      <Drawer anchor="left" open={drawerIsOpen} onClose={() => setDrawerIsOpen(false)}>
        <Divider />
        <List>
          {navChoices.map((opt) => (
            <ListItem
              button
              key={opt.key}
              onClick={() => {
                history.push(opt.path);
                props.setDifficulty(null);
                setDrawerIsOpen(false);
              }}
            >
              <ListItemIcon>{opt.icon}</ListItemIcon>
              <ListItemText primary={opt.key} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
  };

  return (
    <>
      <AppBarCustom />
      <DrawerCustom />
    </>
  );
};

function Game() {
  const [wordLists, setwordLists] = useState<wordListsType>({});
  const [difficulty, setDifficulty] = useState<string | null>(null);
  useEffect(() => {
    const readwordLists = async () => {
      let resp = await fetch('http://localhost:9000/wordLists');
      setwordLists(yaml.parse(await resp.text()));
    };
    readwordLists();
  }, []);

  return (
    <Router>
      <GameWithoutRouter setDifficulty={setDifficulty} />
      <Switch>
        <div style={{ margin: '5%' }}>
          <Route exact path="/">
            <HomeScreen wordLists={wordLists} difficulty={difficulty} setDifficulty={setDifficulty} />
          </Route>
          <Route path="/options">
            <OptionsView />
          </Route>
          <Route path="/used_words">
            <UsedWordsScreen />
          </Route>
          <Route path="/about">
            <AboutScreen />
          </Route>
        </div>
      </Switch>
    </Router>
  );
}

export default Game;
