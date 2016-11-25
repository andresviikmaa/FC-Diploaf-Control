// JavaScript source code
var socket = io.connect();
var pingPong = false;
var was_online = false;
var OBJECT = {
    BLUE_GATE: 0, 
    YELLOW_GATE: 1, 
    BALL: 2, 
    FIELD: 3, 
    INNER_BORDER: 4, 
    OUTER_BORDER: 5, 
    TEAM1: 6, 
    TEAM2: 7, 
    NUMBER_OF_OBJECTS: 8, 
    SIGHT_MASK: 9
};

var RunMode = {
    MODE_IDLE: 0,
	MODE_1VS1: 1,
	MODE_2VS2: 2
};

var RobotState = {
    ourTeam: 2,
    oppoonentTeam: 3,
    targetGate:4,
    homeGate: 5,

    FIELD_MARKER: 6,
    TEAM_MARKER: 7,
    ROBOT_MARKER:8,

    runMode:9,
    gameMode: 10,
    pendingGameMode: 11,
    playState:12
}
var FieldState = {
    collisionWithBorder: 2,
    collisionWithUnknown: 3,
    obstacleNearBall: 4,
    gateObstructed: 5,
    
    ballCount: 6,
    closestBall: 7,
    closestBallInFront: 8,
    closestBallInTribbler: 9,
	collisionRange: 10

};
var lastRunMode = RunMode.MODE_IDLE;
setInterval(function () {
    
    if (was_online != pingPong) {
        if (pingPong == false) {
            $(".status").removeClass("online");
            $(".disable_offline").addClass("disabled");
        } else {
            $(".status").addClass("online");
            $(".disable_offline").removeClass("disabled");
        }
    }
    was_online = pingPong;
    pingPong = false;
}, 1000);

function parseStateData() {
    return {

    }
}
function printObjectPosition(obj, pos) {
    $(obj + " .valid").html(pos[0] ? "yes":"no")
    $(obj + " .distance").html(pos[1].toFixed(2))
    $(obj + " .angle").html(pos[2].toFixed(2))
    $(obj + " .heading").html(pos[3].toFixed(2))
    $(obj + " .fx").html(pos[4].toFixed(2))
    $(obj + " .fy").html(pos[5].toFixed(2))
    $(obj + " .rx").html(pos[6].toFixed(2))
    $(obj + " .ry").html(pos[7].toFixed(2))

}
socket.on('fieldstate', function (data) {
    // console.log(data);
    window.fieldState = data;
    pingPong = true;
    $("#collisionWithBorder").html(data.data[FieldState.collisionWithBorder] ? "yes":"no");
    $("#collisionWithUnknown").html(data.data[FieldState.collisionWithUnknown] ? "yes":"no");
    $("#obstacleNearBall").html(data.data[FieldState.obstacleNearBall] ? "yes":"no");
    $("#gateObstructed").html(data.data[FieldState.gateObstructed] ? "yes":"no");

    $("#ballCount").html(data.data[FieldState.ballCount]);
    $("#closestBall").html(data.data[FieldState.closestBall]);
    $("#closestBallInFront").html(data.data[FieldState.closestBallInFront]);
    $("#closestBallInTribbler").html(data.data[FieldState.closestBallInTribbler]);
    $("#collisionRange").html(data.data[FieldState.collisionRange] + ":" + data.data[FieldState.collisionRange + 1]);
    printObjectPosition("#blueGate", data.gates[0]);
    printObjectPosition("#yellowGate", data.gates[1]);
    printObjectPosition("#self", data.self);
    printObjectPosition("#partner", data.partner);
    printObjectPosition("#opponent1", data.oponents[0]);
    printObjectPosition("#opponent2", data.oponents[1]);
    for (var i = 0; i < 12; i++) {
        printObjectPosition("#ball" + i, data.balls[i]);
    }
    for (var i = 0; i < 4; i++) {
        printObjectPosition("#fball" + i, data.frontBalls[i]);
    }
    //
    //ballCount: 6,
    //closestBall: 7,
    //closestBallInFront: 8,
	//collisionRange: 9
});

socket.on('robotstate', function (data) {
    pingPong = true;
    if (lastRunMode != data[RobotState.runMode]) {
        lastRunMode = data[RobotState.runMode]

        switch (lastRunMode) {
            case RunMode.MODE_IDLE:
                $(".run_mode button[data-mode=0]").addClass("btn-primary").removeClass("btn-secondary");
                $(".run_mode button[data-mode=1]").addClass("btn-secondary").removeClass("btn-primary");
                $(".run_mode button[data-mode=2]").addClass("btn-secondary").removeClass("btn-primary");
                break;
            case RunMode.MODE_1VS1:
                $(".run_mode button[data-mode=0]").removeClass("btn-secondary").removeClass("btn-primary");
                $(".run_mode button[data-mode=1]").addClass("btn-primary").removeClass("btn-secondary");
                $(".run_mode button[data-mode=2]").removeClass("btn-secondary").removeClass("btn-primary");
                break;
            case RunMode.MODE_2VS2:
                $(".run_mode button[data-mode=0]").removeClass("btn-secondary").removeClass("btn-primary");
                $(".run_mode button[data-mode=1]").removeClass("btn-secondary").removeClass("btn-primary");
                $(".run_mode button[data-mode=2]").addClass("btn-primary").removeClass("btn-secondary");
                break;
        }
    }
    
    $('input[name=gate]:nth(' + (data[RobotState.targetGate]) + ')').prop('checked', true);
    $('input[name=robot]:nth(' + (data[RobotState.ourTeam]-6) + ')').prop('checked', true);
    $('input[name=field]:nth(' + (data[RobotState.FIELD_MARKER] - 65) + ')').prop('checked', true);
    $('input[name=team]:nth(' + (data[RobotState.TEAM_MARKER] - 65) + ')').prop('checked', true);
    $('input[name=marker]:nth(' + (data[RobotState.ROBOT_MARKER]-65) + ')').prop('checked', true);
});

