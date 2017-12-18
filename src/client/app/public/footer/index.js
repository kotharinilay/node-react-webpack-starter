'use strict';

import React, { Component } from 'react';
import { getAppVersion } from '../../../../shared';

class Footer extends Component {
    render() {
        return (
            <div className="login-bottom">
                <section className="copyright">
                    <div className="privacy-po">
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">End User License Agreement</a></li>
                        </ul>
                    </div>
                    <div className="copy-text">
                        <span>Copyright&copy; 2017 Aglive Pty Ltd   <b> version {getAppVersion()}</b></span>
                    </div>

                </section>
                <section className="footer-bottom">
                    <div className="bottom-img">
                    </div>
                </section>
            </div>
        );
    }
}

export default Footer;