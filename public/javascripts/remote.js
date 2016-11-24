// JavaScript source code
(function ($) {
    var count = 0;
    var enabled = false;

	var acceleration = {x:0,y:0,z:0};
    var last_acc = { x: 0, y: 0, z: 0 };
    var tilt = { alpha: 0, beta: 0, gamma: 0 };
    var last_tilt = { alpha: 0, beta: 0, gamma: 0 };

    /* initial */
    var doTiltLR = 0;
    var doTiltFB = 0;
    var doDirection = 0;
    /* last sent */
    var lastTiltLR = 0;
    var lastTiltFB = 0;
    var lastDirection = 0;
    /* new */
    var tiltLR = 0;
    var tiltFB = 0;
    var dir = 0;
    var speed = { x: 0, y: 0 };
    var wheelAngles = [
        { x: -Math.sin(45.0 / 180 * Math.PI), y: Math.cos(45.0 / 180 * Math.PI) },
        { x: -Math.sin(135.0 / 180 * Math.PI), y: Math.cos(135.0 / 180 * Math.PI) },
        { x: -Math.sin(225.0 / 180 * Math.PI), y: Math.cos(225.0 / 180 * Math.PI) },
        { x: -Math.sin(315.0 / 180 * Math.PI), y: Math.cos(315.0 / 180 * Math.PI) }
    ];

    function init() {
        if (window.DeviceOrientationEvent) {
           // document.getElementById("doEvent").innerHTML = "DeviceOrientation";
            // Listen for the deviceorientation event and handle the raw data
            window.addEventListener('deviceorientation', deviceOrientationHandler, false);
        } else {
            //document.getElementById("doEvent").innerHTML = "Not supported on your device or browser.  Sorry."
        }
        if (window.DeviceMotionEvent) {
           // document.getElementById("dmEvent").innerHTML = "DeviceMotion";

            window.addEventListener('devicemotion', deviceMotionHandler, false);
        } else {
           // document.getElementById("dmEvent").innerHTML = "Not supported."
        }
		$("#charge").click(function(){
			if (enabled)
			socket.emit("mainboard", "charge");
		});
        $("#tribl").click(function () {
            if (enabled)
                $("#tribbler").slider("setValue", -3000);
        });
        $("#kick").click(function () {
            if (enabled)
                socket.emit("mainboard", "kick:1600");
        });
        $("#kick2").click(function () {
            if (enabled)
                socket.emit("mainboard", "kick:1000");
        });
    }
    $('.enable').click(function (e) {
        var el = $(this);
        if (!enabled) {
            el.removeClass('btn-primary').addClass('btn-secondary');
            enabled = true;
			socket.emit("mainboard", "fs0");
			socket.emit("mainboard", "speeds:0:0:0:0:0");
        } else {
            el.addClass('btn-primary').removeClass('btn-secondary');
            //el.addClass('disabled');
            enabled = false;
			socket.emit("mainboard", "fs1");
			socket.emit("mainboard", "speeds:0:0:0:0:0");
        }
		speed = { x: 0, y: 0 };
    });
    function animate(tiltLR, tiltFB, dir) {
        if (enabled) {
            //document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR - doTiltLR);
            //document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB - doTiltFB);
            //document.getElementById("doDirection").innerHTML = Math.round(dir - doDirection);

            // Apply the transform to the image
            var logo = document.getElementById("imgLogo");
            logo.style.webkitTransform = "rotate(" + (tiltLR - doTiltLR) + "deg) rotate3d(1,0,0, " + ((tiltFB - doTiltFB) ) + "deg)";
            logo.style.MozTransform = "rotate(" + (tiltLR - doTiltLR) + "deg)";
            logo.style.transform = "rotate(" + (tiltLR - doTiltLR) + "deg) rotate3d(1,0,0, " + ((tiltFB - doTiltFB) ) + "deg)";
        } else {
            doTiltLR = tiltLR;
            doTiltFB = tiltFB;
            doDirection = dir;

        }
    }

    function deviceOrientationHandler(eventData) {
        // Grab the acceleration including gravity from the results
        tilt = eventData;
        animate(eventData.alpha, eventData.beta, eventData.gamma);
    }
    function deviceMotionHandler(eventData) {
        var info, xyz = "[X, Y, Z]";

        // Grab the acceleration including gravity from the results
        acceleration = eventData.accelerationIncludingGravity;
        var rot_y = acceleration.x * -18;
        var rot_x = acceleration.y * 18;
        animate(rot_x, rot_y, 0);
        speed.x += (acceleration.x - last_acc.x) * eventData.interval * 10;
        speed.y += (acceleration.y - last_acc.y) * eventData.interval * 10;
        last_acc = acceleration;
    }
    setInterval(function () {
        if (enabled) {
            var w1 = -parseInt(wheelAngles[0].x * speed.x + wheelAngles[0].y * speed.y);
            var w2 = -parseInt(wheelAngles[1].x * speed.x + wheelAngles[1].y * speed.y);
            var w3 = parseInt(wheelAngles[3].x * speed.x + wheelAngles[3].y * speed.y);
            var w4 = parseInt(wheelAngles[2].x * speed.x + wheelAngles[2].y * speed.y);
			var w5 = $("#tribbler").val();
            var speeds = "speeds:" + w1 + ":" + w2 + ":" + w3 + ":" + w4 + ":" +w5;
           // $.get('/mainboard?cmd=speeds:' + speeds);
            socket.emit("mainboard", speeds);
            last_acc = acceleration;
            $("#w1").slider('setValue', w1);
            $("#w2").slider('setValue', w2);
            $("#w3").slider('setValue', w3);
            $("#w4").slider('setValue', w4);
            //$("#w5").slider('setValue', w5);
        }
    }, 300);

    // Some other fun rotations to try...
    //var rotation = "rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    //var rotation = "rotate("+ tiltLR +"deg) rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    init();
})(jQuery);