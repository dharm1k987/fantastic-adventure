import React from 'react';
import './App.css';
import { Navbar } from '../components'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from '../components/home/Home';
import CountryInfo from '../components/countryInfo/CountryInfo';
import NoRouteMatch from '../components/NoRouteMatch/NoRouteMatch';

class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="apply-font mid-gray">
      <Navbar />
      <Router>
        <Route exact path="/" component={Home}></Route>
        <Route exact path="/:country" component={CountryInfo}></Route>
        <Route path="/404" component={NoRouteMatch}></Route>
      </Router>
    </div>
    )
    }

}

export default App;
