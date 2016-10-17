var React = require('react');

var Header = require('./Components/Header');
var Content = require('./Components/Content');
var Favicon = require('react-favicon');

var faviconUrl = require('./Assets/favicon.ico');

export default class App extends React.Component {
  render() {
    return (<div>
      <Header />
      <Content />
      <Favicon url={faviconUrl} />
    </div>);
  }
}