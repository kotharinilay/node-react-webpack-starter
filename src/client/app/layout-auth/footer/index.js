'use strict';

/**************************
 * expose app footer
 * Show copyright information and corporate website URL
 * **************************** */

import React, { Component } from 'react';

class Footer extends Component {
    render() {
        return (
            <section className="copyright">
                <div className="privacy-po">
                    <div className="noti-cover">
                        <div className="notify">
                            <span><em className="notify-count">13</em><b></b></span>
                        </div>
                    </div>
                    <ul>

                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">End User License Agreement</a></li>
                        <li><a href="#">Help</a></li>
                        <li><a href="#">Contact us</a></li>
                        <li><a href="#">Feedback</a></li>
                    </ul>
                </div>
                <div className="copy-text">
                    <span>Copyright&copy; 2017 Aglive Pty Ltd   <b>version 3.0</b></span>
                </div>
            </section>
        )
    }
}

export default Footer