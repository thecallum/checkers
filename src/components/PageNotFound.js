import React from 'react';
import { Link } from 'react-router-dom';

import Header from './Header';

const PageNotFound = () => (
    <div>
      <Header/>
      <h1>404 Page not found!</h1>
      <Link to='/'>to Home</Link>
    </div>
  )

export default PageNotFound;