import React, { Component } from 'react';
import { Link } from 'react-router';
import Render from 'react-dom';

class Header extends Component {
    render() {
        return (
            <div>
                <h3 style={{ display: 'inline-block' }}>
                    <Link to="/">Home
                    </Link>|</h3>
                <h3 style={{ display: 'inline-block' }}>
                    <Link to="/todo">Todo
                    </Link>|</h3>
                <h3 style={{ display: 'inline-block' }}>
                    <Link to="/griddle">Griddle
                    </Link>|</h3>
                <h3 style={{ display: 'inline-block' }}>
                    <Link to="/bgrid">BGrid</Link>
                </h3>
            </div>
        )
    }
}

export default Header