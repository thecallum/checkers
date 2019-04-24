import React, { Component } from 'react';
import Layout from '../components/Layout';

class Home extends Component {
    constructor() {
        super();

        this.tempLink = this.tempLink.bind(this);
    }

    tempLink(url) {
        console.log('templink:', url)
        this.props.history.push(url);
    }

    render() {
       return (
           <Layout>
                <div className="container">

                    <div className="mainView">
                        <div className="mainView__top">
                            <h1 className='home__title'>CHECKERS</h1>
                        </div>

                        <div className="mainView__bottom">
                            <h3 className='home__subtitle'>Select Game Mode</h3>

                            <ul className='home__optionContainer'>
                                <li className='home__option'>
                                    <button className='button home__button' onClick={() => this.tempLink('/play/singleplayer')}>
                                        <div className="home__buttonLabel">
                                            <img src="/assets/avatar.svg" alt="" className='home__buttonIcon'/>
                                            <div className="home__buttonText">Player</div>
                                        </div>

                                        <div className="home__buttonVs">VS</div>

                                        <div className="home__buttonLabel">
                                            <img src="/assets/robotic.svg" alt="" className='home__buttonIcon'/>
                                            <div className="home__buttonText">AI</div>
                                        </div>
                                    </button>
                                </li>
                                <li className='home__option'>
                                    <button className='button home__button'  onClick={() => this.tempLink('/play/multiplayer')}>
                                        <div className="home__buttonLabel">
                                            <img src="/assets/avatar.svg" alt="" className='home__buttonIcon'/>
                                            <div className="home__buttonText">Player</div>
                                        </div>

                                        <div className="home__buttonVs">VS</div>

                                        <div className="home__buttonLabel">
                                            <img src="/assets/avatar.svg" alt="" className='home__buttonIcon'/>
                                            <div className="home__buttonText">Player</div>
                                        </div>
                                    </button>
                                </li>
                                <li className='home__option'>
                                    <button className='button home__button'  onClick={() => this.tempLink('/play/online')}>
                                        <div className="home__buttonLabel">
                                            <img src="/assets/globe.svg" alt="" className='home__buttonIcon--globe'/>
                                        </div>
                                        <div className="home__buttonOnline">Online</div>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

           </Layout>
       )
    }
}

export default Home;