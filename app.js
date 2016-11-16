
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var ws = require("ws");
var cp = require('child_process');
var requestify = require('requestify');
var os = require("os");

console.log(os.hostname());

console.log("Wifi part");
data = [];
data['hostname'] = os.hostname();
data['network'] = os.networkInterfaces();

requestify.post('http://robotiina.zed.ee/ip.php',  data)
    .then(function (response) {
        // Get the response body (JSON parsed or jQuery object for XMLs)
        response.getBody();
});

var platform = os.platform()

console.log("UDP part");
var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var client = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port + ' - ' + message);

});

server.bind(PORT, HOST);
console.log("Websoket part");


var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});
console.log("UI part");

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function (req, res) {
    res.render('index', { title: 'FC Diploaf', url: os.hostname()});
});
app.get('/about', routes.about);
app.get('/remote', routes.remote);
app.get('/mainboard', function (req, res) {

    console.log(req.query.cmd);
    var buf1 = Buffer.from(req.query.cmd);
    client.send(buf1, 8042, 'localhost', (err) => {
       // client.close();
    });
    res.send("ok");
});
var server = http.createServer(app)
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    socket.on('setPseudo', function (data) {
        socket.set('pseudo', data);
    });
    socket.on('message', function (message) {
        socket.get('pseudo', function (error, name) {
            var data = { 'message': message, pseudo: name };
            socket.broadcast.emit('message', data);
            console.log("user " + name + " send this : " + message);
        })
    });
});
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


