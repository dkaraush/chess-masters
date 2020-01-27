import React from 'react';

import { BrowserRouter as Router, Route, Switch }  from 'react-router-dom';

import Header from './Header/Header';
import IndexPage from './Pages/Index/Index';

function App() {
    return (
        <div id="App">
            <Router>
                <Header />
                <div id="content">
                    <div className="inner">
                        <div>
                            <Switch>
                                    <Route path="/" exact component={IndexPage} />
                            </Switch>
                        </div>
                    </div>
                </div>
            </Router>
        </div>
    );
}

export default App;