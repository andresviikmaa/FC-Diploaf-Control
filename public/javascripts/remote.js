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
    var speeds = [0, 0, 0, 0, 0];
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
    }
    $('.logo').click(function (e) {
        var el = $(this);
        if (el.hasClass('disabled')) {
            el.removeClass('disabled');
            enabled = true;
        } else {
            el.addClass('disabled');
            enabled = false;
        }
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
        var rot_x = acceleration.x * 18;
        var rot_y = acceleration.y * 18;
        animate(rot_x, rot_y, 0);

    }
    setInterval(function () {
        if (enabled) {
            $.get('/mainboard?cmd=speeds:' + speeds);
            last_acc = acceleration;
        }
    }, 300);

    // Some other fun rotations to try...
    //var rotation = "rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    //var rotation = "rotate("+ tiltLR +"deg) rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    init();
})(jQuery);