import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { newsXML } from './newsXML'
import { NewsBlock } from './newsBlock/NewsBlock'
import { v4 as uuidv4 } from 'uuid';
import { Overall, Table1 } from '..'
import axios from 'axios';
import moment from "moment";
import { CircularProgress } from '@material-ui/core';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import "./CountryInfo.css"
import { useHistory, Redirect } from 'react-router-dom';
import HomeIcon from '@material-ui/icons/Home';
const Parser = require('rss-parser');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.REACT_APP_NEWS_API_KEY);

class CountryInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      country: props.match.params.country,
      countryStats: null,
      news: [],
      graph: null,
      notFound: false
    }
  }

  toTitleCase(str) {
    const lowerStr = str.toLowerCase();
    if (str === "usa" || str == "uae" || str == "uk") return str.toUpperCase();
    return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  getLiveStats(country) {
    return axios.get(`/live-stats/${country.toLowerCase()}`);
  }

  getParsedNews(url) {
    return axios.get(`cors/${url}`)
      .then(res => new Parser().parseString(res.data))
      .catch(err => console.log(err))
  }

  getTimeMeasure(diffInMilli) {
    const diff = moment.duration(diffInMilli, 'milliseconds');
    if (diff >= 1000 * 60 * 60 * 24) return Math.floor(diff.asDays()) + " day(s) ago";
    if (diff >= 1000 * 60 * 60) return Math.floor(diff.asHours()) + " hr(s) ago";
    return Math.floor(diff.asMinutes()) + " min(s) ago";
  }

  timeSincePosted(postTime) {
    return moment().diff(moment(postTime));
  }

  componentDidMount() {

    let query = this.state.country + " coronavirus";
    let url = `news.google.com/rss/search?q=${encodeURIComponent(query)}&maxitems=4`
    this.getLiveStats(this.state.country).then(res => {
      this.setState({ countryStats: res.data.countryStats });
    }).catch(e => {
      console.log(e);
      this.setState({
        notFound: true
      })
    })

    this.getParsedNews(url)
      .then(res => {
        const news = res.items
          .filter(i => !i.title.toLowerCase().includes("live update"))
          .sort((i, j) => this.timeSincePosted(i.pubDate) < this.timeSincePosted(j.pubDate) ? -1 : 1)
          .map(i => {
            let splitTitle = i.title.split('-');
            let publisher = splitTitle[splitTitle.length - 1];
            splitTitle.splice(splitTitle.length - 1, 1);
            return {
              ...i,
              pubDate: this.getTimeMeasure(this.timeSincePosted(i.pubDate)),
              title: splitTitle.join('-'),
              publisher
            };
          });
        this.setState({ news });
      });


  }

  render() {
    if (this.state.notFound) {
      return (<Redirect to={{
        pathname: '/404',
        state: { path: this.state.country }
      }} />);
    }
    const newsAggregation = this.state.news.splice(0, 20).map((item) => {
      return <NewsBlock key={uuidv4()} item={item}/>
    })

    return (
      <div>
    <div className="w-70-ns w-90 mt-0 mb-0 mr-auto ml-auto">
      
        <Link to="/" className="ba bg-white  b f3 blue mt3 custom">
            <HomeIcon/>
            <div>Home</div>
          </Link>   
        
        </div>

      <div className="flex mt2"> 
      {
        this.state.countryStats && this.state.country ? <Overall placeName={this.state.country} place={this.state.countryStats} /> : null
      }
      </div>

        <div className="tc pt4 mb2 mh2 br2">
          <p className="f3 gray b mt2 mb0 pa0" >
              Top Stories in {this.toTitleCase(this.state.country)}
          </p>
          <div className="flex">
          <div className="center flex">
            <p className="ma0"> Live </p>
            <div><RadioButtonCheckedIcon className="liveBtn"/> </div>
          </div>
          </div>
        </div>

          <div className="tc ">

              <div className="f3">
                {newsAggregation.length == 0 ? <CircularProgress /> : newsAggregation}
              </div>
          </div>

      </div>
    );
  }
}

export default CountryInfo;
