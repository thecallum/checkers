import React from 'react';

import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Home from '../components/Home';
import Login from '../components/Login';
import Register from '../components/Register';

import PlayMultiPlayer from '../components/PlayMultiPlayer';
import PlaySinglePlayer from '../components/PlaySinglePlayer';
import PlayOnline from '../components/PlayOnline';

import Leaderboard from '../components/Leaderboard';

import PageNotFound from '../components/PageNotFound';

const Router = () => (
    <BrowserRouter>
      <Switch>
        <Route path='/' component={Home} exact={true} />
        <Route path='/login' component={Login} exact={true} />
        <Route path='/register' component={Register} exact={true} />
  
        <Route path='/play/singleplayer' component={PlaySinglePlayer} exact={true} />
        <Route path='/play/multiplayer' component={PlayMultiPlayer} exact={true} />
        <Route path='/play/online' component={PlayOnline} exact={true} />

        <Route path='/leaderboard' component={Leaderboard} exact={true} />

        <Route path='*' component={PageNotFound} />
      </Switch>
    </BrowserRouter>
)

export default Router;