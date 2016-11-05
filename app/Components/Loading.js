import React, {Component} from 'react';
import Render from 'react-dom';

class Loading extends Component {

    render() {
        return (
            <div className="loading">{this.props.loadingText}</div>
        )
    }
}

Loading.getDefaultProps = {
    loadingText: "Loading"
};

export default Loading