var React = require('react');

export default class Content extends React.Component {
  constructor(props) {
    super(props)
    this.refreshData = this.refreshData.bind(this);
    this.state = { serverData: null }
  }

  refreshData() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', '/api/currentTime', true);
    xhr.onload = () => {
      var data = JSON.parse(xhr.responseText);
      this.setState({ serverData: data.time });
    };
    xhr.send();
  }

  render() {
    return (<div>
      <p>Here are some test Content <b ref='serverResponse'>{this.state.serverData || 'Click the button to hit the API'}</b></p>
      <input ref='refreshButton' type='button' onClick={this.refreshData} value='Hit the server'></input>
    </div>
    );
  }
}