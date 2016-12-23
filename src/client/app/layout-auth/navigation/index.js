'use strict';

/**************************
 * Navigation actions will be listed at here
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Navigation from './components/sidebar';
import { withTranslate } from 'react-redux-multilingual'

export default connect()(withTranslate(Navigation))