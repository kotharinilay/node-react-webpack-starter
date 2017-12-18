'use strict';

/*************************************
 * check and display entered password strength
 * *************************************/

import React, { Component } from 'react';
import { checkPasswordStrength } from '../../../shared';

class PasswordStrength extends Component {
    constructor(props) {
        super(props);

        this.state = {
            score: -1,
        }

        this.config = {
            WeakColor: '#d9534f',
            GoodColor: '#f0ad4e',
            StrongColor: '#93C9F4',
            GreatColor: '#5cb85c',
            strengthLang: ['Weak', 'Good', 'Strong', 'Great']
        }

        /*==========  STYLES  ==========*/
        this.infoStyle = {
            position: 'relative',
            top: -30,
            width: '100%',
            overflow: 'hidden',
            height: 30
        };

        this.strengthLangStyle = {
            fontSize: 13,
            position: 'relative',
            top: 2,
        };
    }

    getMeterStyle(score) {
        let width = score >= 0 ? 32 * score + 4 : 0;
        return {
            width: width + '%',
            maxWidth: '85%',
            opacity: width * .01 + .5,
            background: this.config[this.config.strengthLang[this.state.score] + 'Color'],
            height: 8,
            transition: 'all 400ms linear',
            display: 'inline-block',
            marginRight: '1%'
        }
    }

    checkPasswordStrength(p) {
        let score = checkPasswordStrength(p);
        this.setState({
            score: score
        })
    }

    render() {
        return (
            this.state.score != -1 ?
                <div className={this.props.className} style={this.infoStyle}>
                    <span style={this.getMeterStyle(this.state.score)} />
                    <span style={this.strengthLangStyle}>
                        {this.config.strengthLang.length > 0 ?
                            this.config.strengthLang[this.state.score] : null}
                    </span>
                </div>
                : null
        );
    }
}

export default PasswordStrength;