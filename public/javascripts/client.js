// JavaScript source code
var socket = io.connect();
var pingPong = false;
var was_online = false;
setInterval(function () {
    
    if (was_online != pingPong) {
        if (pingPong == false) {
            $(".status").removeClass("online");
        } else {
            $(".status").addClass("online");
        }
    }
    was_online = pingPong;
    pingPong = false;
}, 1000);


socket.on('state', function (data) {
   // console.log(data);
    pingPong = true;
});

