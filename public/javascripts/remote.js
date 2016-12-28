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
	var kick = 0;
    var speed = { x: 0, y: 0, r: 0 };
	var speedLimit = 500;
    var wheelAngles = [
        { x: -Math.sin(45.0 / 180 * Math.PI), y: Math.cos(45.0 / 180 * Math.PI) },
        { x: -Math.sin(135.0 / 180 * Math.PI), y: Math.cos(135.0 / 180 * Math.PI) },
        { x: -Math.sin(225.0 / 180 * Math.PI), y: Math.cos(225.0 / 180 * Math.PI) },
        { x: -Math.sin(315.0 / 180 * Math.PI), y: Math.cos(315.0 / 180 * Math.PI) }
    ];

    function init() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', deviceOrientationHandler, false);
        }
        if (window.DeviceMotionEvent) {

            window.addEventListener('devicemotion', deviceMotionHandler, false);
        }
        window.addEventListener('keydown', keyDownHandler, false);
		window.addEventListener('keyup', keyUpHandler, false);
       
		$("#charge").click(function(){
			if (enabled)
			socket.emit("mainboard", "charge");
		});
        $("#tribl").click(function () {
            if (enabled)
                $("#tribbler").slider("setValue", -6000);
        });
        $("#kick").click(function () {
            if (enabled)
                socket.emit("mainboard", "kick:2500");
        });
        $("#kick2").click(function () {
            if (enabled) {
                kick =1;
			}
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
		speed = { x: 0, y: 0, r:0 };
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
	
	function keyUpHandler(eventData) {
		var key = eventData.keyCode;
		var keyReleaseToStopDriving = [37, 39, 38, 40];
		if (keyReleaseToStopDriving.indexOf(key) > -1) {
			speed = { x: 0, y: 0, r:0 };
			console.log("Stopping");
		}
	}
	
    function keyDownHandler(eventData) {
        var key = eventData.keyCode;
        console.log(eventData.keyCode);
		var acceleration = 30;
        switch (key) {
            case 'a':
            case 37:
                if (eventData.ctrlKey)
                    increaseSpeed(acceleration,0,0);
                else
                    increaseSpeed(0,0,-acceleration);
                break;
            case 'd':
            case 39:
                if (eventData.ctrlKey)
                    increaseSpeed(-acceleration,0,0);
                else
                    increaseSpeed(0,0,acceleration);
                break;
            case 'w':
            case 38:
                increaseSpeed(0,acceleration,0);
                break;
            case 's':
            case 40:
                increaseSpeed(0,-acceleration,0);
                break;
            case 'q':
                speed = { x: 0, y: 0, r:0 };
                break;
            case 'k':
            case 75:
				console.log("kicking");
                socket.emit("mainboard", "kick:2500");
                break;
            case 'Z':
                $("#tribbler").slider("setValue", -3000);
                break;
            case 'X':
                $("#tribbler").slider("setValue", 0);
                break;
            default:
                break;
        }

    }
	
	function increaseSpeed(x, y ,r) {
		if (Math.abs(speed.y) >= speedLimit || Math.abs(speed.x) >= speedLimit || Math.abs(speed.r >= speedLimit)) {
			console.log("speed limit hit");
			return;
		}
		console.log("increasing speeds");
		speed.x += x;
		speed.y += y;
		speed.r += r;
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
			
            var w2 = parseInt(wheelAngles[0].x * speed.y + wheelAngles[0].y * speed.x) + speed.r;
            var w4 = parseInt(wheelAngles[1].x * speed.y + wheelAngles[1].y * speed.x) + speed.r;
            var w3 = -parseInt(wheelAngles[2].x * speed.y + wheelAngles[2].y * speed.x) + speed.r;
            var w1 = parseInt(wheelAngles[3].x * speed.y + wheelAngles[3].y * speed.x) + speed.r;
			var w5 = $("#tribbler").val();
			if(kick){
				w5=0;
			}
            var speeds = "speeds:" + w1 + ":" + w2 + ":" + w3 + ":" + w4 + ":" +w5;
           // $.get('/mainboard?cmd=speeds:' + speeds);
            socket.emit("mainboard", speeds);
			if(kick){
				socket.emit("mainboard", "kick:5000");
				kick = false;
				$("#tribbler").slider("setValue", 0);

			}
            last_acc = acceleration;
            $("#w1").slider('setValue', w1);
            $("#w2").slider('setValue', w2);
            $("#w3").slider('setValue', w3);
            $("#w4").slider('setValue', w4);
            //$("#w5").slider('setValue', w5);
        }
    }, 100);

    // Some other fun rotations to try...
    //var rotation = "rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    //var rotation = "rotate("+ tiltLR +"deg) rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    init();
})(jQuery);


function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }
    
    return [h, s, l];
}