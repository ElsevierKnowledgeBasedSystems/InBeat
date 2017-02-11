/**
 * InBeat - Interest Beat
 * @author Jaroslav Kuchař (https://github.com/jaroslav-kuchar)
 * 
 * Use of this source code is governed by a license that
 * can be found in the LICENSE file. 
 * 
 */

// http server
var http = require('http');
// db
var db = require('./db/mongo');
// interceptor
var restInterceptor = require('./interceptor/rest');

var config = require("../config");
var logger = config.Logger;

var port = config["inbeat-gain"]["listener-port"];

// start simple server
http.createServer(function(req, res) {
    if (req.method == 'POST') {
        // if request -> process data
        restInterceptor.processRequest(req, function(error, data) {
            if (error) {
                // throw error;
                logger.warn('rest interceptor: ' + error);
                res.writeHead(400, {
                    'Content-Type': 'text/plain'
                });
                res.write(error);
                res.end();
            }
            // if data ok
            if (data) {
                // save
                db.add(data, function(error) {
                    // throw error
                    if (error) {
                        // throw error;
                        logger.warn('rest db: ' + error);
                        res.writeHead(400, {
                            'Content-Type': 'text/plain'
                        });
                        res.write(error);
                        res.end();
                    } else {
                        res.writeHead(201, {
                            'Content-Type': 'text/plain'
                        });
                        res.write('');
                        res.end();
                    }
                });
            }
        });
    } else {
        var error = 'Wrong HTTP method, only HTTP POST is supported.';
        logger.warn(error);
        res.writeHead(405, {
            'Content-Type': 'text/plain',
            'Allow': 'POST'
        });
        res.write(error);
        res.end();
    }
}).listen(port, function() {
    // for unit tests - child process...
    if (process.send) {
        process.send('listening');
    }
});

process.on('SIGINT', function() {
    console.log('\nshutting down from  SIGINT (Crtl-C)');
    process.exit();
});

// log start of server
console.log('InBeat: GAIN listener listening on: ' + port + '');
