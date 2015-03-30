var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');

var routes = require('./routes');
var auth = require('inbeat-bl').getLogic('auth').auth;

var config = require("./config");
var port = config["inbeat-rs"]["port"];

var app = express();

app.use(bodyParser.json());
app.use(compression());


// Routes
// index
app.get('/rs/api', function(req, res) {
	res.status(200).end();
});

// insert rules
app.put('/rs/api/:accountId/rules', auth, routes.putRules);

// classification
app.put('/rs/api/:accountId/classification', auth, routes.classify);

app.listen(port, function() {
	console.log("InBeat: RS api listening on: "+port);
});

process.on('SIGINT', function() {
	console.log('\nshutting down from  SIGINT (Crtl-C)');
	process.exit();
});