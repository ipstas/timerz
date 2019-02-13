// Client entry point, imports all client code
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle';

import '/imports/startup/client';
import '/imports/startup/both';

//import '/imports/ui/stylesheets/grayscale.css';
import '/imports/ui/stylesheets/index.js';

import 'bootstrap';
import popper from 'popper.js';
global.Popper = popper;
AutoForm.setDefaultTemplate('bootstrap4');

