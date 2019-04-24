import React from 'react';

import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

import PlayMultiPlayer from '../pages/PlayMultiPlayer';
import PlaySinglePlayer from '../pages/PlaySinglePlayer';
import PlayOnline from '../pages/PlayOnline';

import Leaderboard from '../pages/Leaderboard';

import PageNotFound from '../pages/PageNotFound';

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