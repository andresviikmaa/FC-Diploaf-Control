
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var cp = require('child_process');
var requestify = require('requestify');
var os = require("os");
var cpaker = require("jspack").jspack;

console.log(os.hostname());

console.log("Wifi part");
data = [];
data['hostname'] = os.hostname();
data['network'] = os.networkInterfaces();

var hostname = data['hostname'];
requestify.post('http://robotiina.zed.ee/ip.php',  data)
    .then(function (response) {
        // Get the response body (JSON parsed or jQuery object for XMLs)
        response.getBody();
});

var platform = os.platform()
var fieldState = {
    balls: Array(15)
}
var robotState = {
    
}
console.log("UDP part");
var SERVER_PORT = hostname == "Loafdoodle" ? 30001 : 30000;
var CLIENT_PORT = hostname == "Loafdoodle" ? 30000 : 30001;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var client = dgram.createSocket('udp4');
var io = null;

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    if (message[0] == 0) {
        fieldState.data = cpaker.Unpack("<II BBBB BBBx dd", message, 0);
        fieldState.partner = cpaker.Unpack("<Bxxx ddd dd dd dd", message, 36);
        fieldState.gates = [cpaker.Unpack("<Bxxx ddd dd dd dd dd", message, 36 + 80), cpaker.Unpack("<Bxxx ddd dd dd dd dd", message, 36 + 80 + 96)];
        fieldState.oponents = [cpaker.Unpack("<Bxxx ddd dd dd dd", message, 36 + 80 + 96 + 96), cpaker.Unpack("<Bxxx ddd dd dd dd", message, 36 + 80 + 96 + 96 + 80)];
        fieldState.self = cpaker.Unpack("<Bxxx ddd dd dd dd", message, 36 + 80 + 96 + 96 + 80 + 80)
        var s = 36 + 80 + 96 + 96 + 80 + 80 + 80; // 548
        for (var i = 0; i < 15; i++) { // 1440
            fieldState.balls[i] = cpaker.Unpack("<Bxxx ddd dd dd IBxxxd", message, s + i * 96);
        }
        //console.log(data);
        if (io != null) {
            io.sockets.emit('fieldstate', fieldState);
        }
    } else if (message[0] == 1) {
        if (io != null) {
            io.sockets.emit('robotstate', cpaker.Unpack("<II BBBB BBB BB", message, 0));
        }
    }

});

server.bind(SERVER_PORT, HOST);
//server.close();

var command = {
    FIELD_STATE: 0,
    ROBOT_STATE: 1,
    PLAY_MODE: 10,
    MANUAL_CONTROL: 20
}
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
    res.render('index', { title: 'FC Diploaf Control Center', hostname: os.hostname()});
});
app.get('/remote', routes.remote);
app.get('/config', function (req, res) {
    res.render('config', { title: os.hostname() });
});
app.get('/live', routes.live);
app.get('/referee', routes.referee);
app.get('/referee2', routes.referee2);
app.get('/mainboard', function (req, res) {

    console.log(req.query.cmd);
    var buf1 = Buffer.from(req.query.cmd);
    client.send(buf1, 8042, 'localhost', (err) => {
       // client.close();
    });
    res.send("ok");
});
var web = http.createServer(app)

io = require('socket.io').listen(web);

io.sockets.on('connection', function (socket) {
    socket.on('run_mode', function (message) {
        //console.log(message);
        
        var data = new Buffer("--");
        data[0] = command.PLAY_MODE;
        data[1] = parseInt(message);
        client.send(data, 0, data.length, CLIENT_PORT, "localhost", function (err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to:' + CLIENT_PORT);
        });
    });
    socket.on('mainboard', function (message) {
		console.log(message);
        var buf1 = Buffer.from(message);
        client.send(buf1, 8042, '192.168.4.1', (err) => {
        });
        // simulator
        client.send(buf1, 50022, 'localhost', (err) => {
        });
    });
    socket.on('referee', function (message) {
        var buf1 = Buffer.from(message);
        client.send(buf1, 8042, 'localhost', (err) => {
        });
        // simulator
        client.send(buf1, 50022, 'localhost', (err) => {
        });
    });
    socket.on('referee2', function (message) {
        
        var buf1 = Buffer.from(message);
        client.send(buf1, 8042, 'localhost', (err) => {
        });
        // simulator
        client.send(buf1, 50022, 'localhost', (err) => {
        });
    });

});
web.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


