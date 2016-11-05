import React, {Component} from 'react';
import {Link} from 'react-router';
import Render from 'react-dom';

class Header extends Component {
    render() {
        return (
            <div>
                <h3>
                    <Link to="/">Home
                    </Link>|</h3>
                <h3>
                    <Link to="/todo">Todo
                    </Link>|</h3>
                <h3>
                    <Link to="/griddle">Griddle
                    </Link>|</h3>
                <h3>
                    <Link to="/bgrid">BGrid</Link>
                </h3>
            </div>
        )
    }
}

export default Header