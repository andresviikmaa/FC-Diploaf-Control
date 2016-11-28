
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
    balls: Array(15),
    frontBalls: Array(15)
}
var robotState = {
    
}
console.log("UDP part");
var SERVER_PORT = hostname == "Loafdoodle" ? 30001 : 30000;
var CLIENT_PORT = hostname == "Loafdoodle" ? 30000 : 30001;
var HOST = '0.0.0.0';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var client = dgram.createSocket('udp4');
var endpoint = null;

var io = null;

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    endpoint = remote;
    var size = message[1];
    if (message[0] == 0) { //3440
        
        var s = 0;
        fieldState.data = cpaker.Unpack("<II BBBB BBBB dd", message, s);                                s += 32;
        fieldState.partner = cpaker.Unpack("<Bxxx xxxx ddd dd dd dd", message, s);                           s += 80;    
        fieldState.gates = [cpaker.Unpack("<Bxxx xxxx ddd dd dd dd ", message, s),
                            cpaker.Unpack("<Bxxx xxxx ddd dd dd dd ", message, s + 96)];                   s += 2 * 96; 
        fieldState.oponents = [cpaker.Unpack("<Bxxx xxxx ddd dd dd dd", message, s),
                               cpaker.Unpack("<Bxxx xxxx ddd dd dd dd", message, s )];                   s += 2 * 80; 
        fieldState.self = cpaker.Unpack("<Bxxx xxxx ddd dd dd dd hhhh Bxxx ", message, s);                   s += 92;
        
        
        s = 556;
        for (var i = 0; i < 15; i++) { // 1440
           // console.log(message[s + i * 96]);
            fieldState.balls[i] = cpaker.Unpack("<Bxxx ddd dd dd dd BBxx d", message, s + i * 96);
        }
        s += 1440;
        for (var i = 0; i < 15; i++) { // 1440
            fieldState.frontBalls[i] = cpaker.Unpack("<Bxxx ddd dd dd dd BBxx d", message, s + i * 96);
        }
        //console.log(data);
        if (io != null) {
            io.sockets.emit('fieldstate', fieldState);
        }
    } else if (message[0] == 1) {
        if (io != null) {
            io.sockets.emit('robotstate', cpaker.Unpack("<II BBBB BBB BB", message, 0));
        }
    } else if (message[0] == 30) {
        if (io != null) {
            io.sockets.emit('statemachine', message.toString('ascii', 1));
        }
    }


});

server.bind(SERVER_PORT, HOST);
//server.close();

var command = {
    FIELD_STATE: 0,
    ROBOT_STATE: 1,
    PLAY_MODE: 10,
    COMMAND_SET_CONF: 11,
    COMMAND_MANUAL_CONTROL: 20,
    COMMAND_STATEMACHINE_STATE: 30,
    COMMAND_DEBUG: 100,
    COMMAND_DEBUG_STEP: 101,
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
        if (endpoint == null) return;
        //console.log(message);
        
        var data = new Buffer("--");
        data[0] = command.PLAY_MODE;
        data[1] = parseInt(message);
        client.send(data, 0, data.length, CLIENT_PORT, endpoint.address, function (err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to:' + CLIENT_PORT);
        });
    });
    socket.on('debug', function (message) {
        //console.log(message);
        if (endpoint == null) return;

        var data = new Buffer("--");
        data[0] = command.COMMAND_DEBUG;
        data[1] = parseInt(message);
        client.send(data, 0, data.length, CLIENT_PORT, endpoint.address, function (err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to:' + CLIENT_PORT);
        });
    });
    socket.on('debug_step', function (message) {
        //console.log(message);
        if (endpoint == null) return;

        var data = new Buffer("--");
        data[0] = command.COMMAND_DEBUG_STEP;
        data[1] = parseInt(message);
        client.send(data, 0, data.length, CLIENT_PORT, endpoint.address, function (err, bytes) {
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
        client.send(buf1, 8042, '192.168.42.11', (err) => {
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

    socket.on('conf_change', function (message) {
        //console.log(message);
        if (endpoint == null) return;

        var data = new Buffer("---"+message[0]);
        data[0] = command.COMMAND_SET_CONF;
        data[1] = parseInt(message[1]);
        data[2] = message[1].charCodeAt(0);
        client.send(data, 0, data.length, CLIENT_PORT, endpoint.address, function (err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to:' + CLIENT_PORT);
        });
    });

});
web.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


