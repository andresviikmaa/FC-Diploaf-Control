// JavaScript source code
(function ($) {
    var count = 0;
    var enabled = false;
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

    function init() {
        if (window.DeviceOrientationEvent) {
            document.getElementById("doEvent").innerHTML = "DeviceOrientation";
            // Listen for the deviceorientation event and handle the raw data
            window.addEventListener('deviceorientation', function (eventData) {
                // gamma is the left-to-right tilt in degrees, where right is positive
                tiltLR = eventData.gamma;

                // beta is the front-to-back tilt in degrees, where front is positive
                tiltFB = eventData.beta;

                // alpha is the compass direction the device is facing in degrees
                dir = eventData.alpha

                // call our orientation event handler
                deviceOrientationHandler(tiltLR, tiltFB, dir);
            }, false);
        } else {
            document.getElementById("doEvent").innerHTML = "Not supported on your device or browser.  Sorry."
        }
        if (window.DeviceMotionEvent) {
            document.getElementById("dmEvent").innerHTML = "DeviceMotion";

            window.addEventListener('devicemotion', deviceMotionHandler, false);

            function deviceMotionHandler(eventData) {
                var info, xyz = "[X, Y, Z]";

                // Grab the acceleration from the results
                var acceleration = eventData.acceleration;
                info = xyz.replace("X", acceleration.x);
                info = info.replace("Y", acceleration.y);
                info = info.replace("Z", acceleration.z);
                document.getElementById("moAccel").innerHTML = info;

                // Grab the acceleration including gravity from the results
                acceleration = eventData.accelerationIncludingGravity;
                info = xyz.replace("X", acceleration.x);
                info = info.replace("Y", acceleration.y);
                info = info.replace("Z", acceleration.z);
                document.getElementById("moAccelGrav").innerHTML = info;

                // Grab the rotation rate from the results
                var rotation = eventData.rotationRate;
                info = xyz.replace("X", rotation.alpha);
                info = info.replace("Y", rotation.beta);
                info = info.replace("Z", rotation.gamma);
                document.getElementById("moRotation").innerHTML = info;

                // // Grab the refresh interval from the results
                info = eventData.interval;
                document.getElementById("moInterval").innerHTML = info;
            }
        } else {
            document.getElementById("dmEvent").innerHTML = "Not supported."
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
    function deviceOrientationHandler(tiltLR, tiltFB, dir) {
        if (enabled) {
            document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR - doTiltLR);
            document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB - doTiltFB);
            document.getElementById("doDirection").innerHTML = Math.round(dir - doDirection);

            // Apply the transform to the image
            var logo = document.getElementById("imgLogo");
            logo.style.webkitTransform = "rotate(" + (tiltLR - doTiltLR) + "deg) rotate3d(1,0,0, " + ((tiltFB - doTiltFB) * -1) + "deg)";
            logo.style.MozTransform = "rotate(" + (tiltLR - doTiltLR) + "deg)";
            logo.style.transform = "rotate(" + (tiltLR - doTiltLR) + "deg) rotate3d(1,0,0, " + ((tiltFB - doTiltFB) * -1) + "deg)";
        } else {
            doTiltLR = tiltLR;
            doTiltFB = tiltFB;
            doDirection = dir;

        }
    }

    setInterval(function () {
        if (enabled) {
            $.get('/remote?q=drive;' + (tiltFB * 3) + ';' + (dir));
            lastTiltLR = tiltLR;
            lastTiltFB = tiltFB;
            lastDirection = dir;
        }
    }, 300);

    // Some other fun rotations to try...
    //var rotation = "rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    //var rotation = "rotate("+ tiltLR +"deg) rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    init();
})(jQuery);