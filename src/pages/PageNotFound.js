import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const PageNotFound = () => (
    <Layout>
      <h1>404 Page not found!</h1>
      <Link to='/'>to Home</Link>
    </Layout>
);

export default PageNotFound;