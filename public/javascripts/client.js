// JavaScript source code
var socket = io.connect();
var pingPong = false;
var was_online = false;
setInterval(function () {
    
    if (was_online != pingPong) {
        if (pingPong == false) {
            $(".status").removeClass("online");
            $(".disable_offline").removeClass("disabled");
        } else {
            $(".status").addClass("online");
            $(".disable_offline").addClass("disabled");
        }
    }
    was_online = pingPong;
    pingPong = false;
}, 1000);

function parseStateData() {
    return {

    }
}

socket.on('state', function (data) {
   // console.log(data);
    pingPong = true;
});

