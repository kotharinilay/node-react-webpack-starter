'use strict';

/**************************
 * expose app notfound page
 * it will be load when page not found
 * **************************** */

import React, {Component} from 'react';

class NotFound extends Component {
    render() {
        return (
            <div>
              <h2>Sorry.. Page you are looking for is not available!!</h2>  
            </div>
        );
    }
}

export default NotFound;