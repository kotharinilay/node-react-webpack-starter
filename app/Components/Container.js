import React, {Component} from 'react';
import {Link} from 'react-router';
import {render} from 'react-dom';
import Header from './Header';

class Container extends Component {
    render() {
        return (
            <div>
                <Header/>
                <br/>
                <div>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default Container