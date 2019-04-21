import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
    <header className='header'>
        <h1 className="header__logo">CHECKERS</h1>

        <ul className="header__links">
            <li>
                <Link className="header__link" to="/">Home</Link>
            </li>   
            <li>
                <Link className="header__link" to="/leaderboard">Leaderboard</Link>
            </li>
            <li>
                <Link className="header__link" to="/login">Login</Link>
            </li>
            <li>
                <Link className="header__link header__link--register" to="/register">Register</Link>
            </li>
        </ul>
    </header>
);

export default Header;