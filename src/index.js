import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Link, hashHistory } from "react-router-dom";


// D2 UI
import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';

import './styles.scss';

class Dashboard extends React.Component {
  render() {
    return <h1>Dashboard!</h1>
  }
}

class App extends AppWithD2 {
  render() {
    return (
      <div className="react-div">
        <HeaderBar d2={this.state.d2} />
        <nav>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
        <div>
          <Route path="/dashboard" component={Dashboard}/>
        </div>
      </div>
    )
  }
};

ReactDOM.render((
  <HashRouter history={hashHistory}>
    <App />
  </HashRouter>
), document.getElementById("app"));