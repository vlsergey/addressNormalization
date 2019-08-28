import 'core-js/stable';
import 'regenerator-runtime/runtime';

import NormalizationForm from './NormalizationForm';
import React from 'react';
import ReactDOM from 'react-dom';

require( 'bootstrap/dist/css/bootstrap.min.css' );

ReactDOM.render( <NormalizationForm />, document.getElementById( 'app' ) );
