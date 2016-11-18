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
    gameMode:10
}
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

socket.on('fieldstate', function (data) {
   // console.log(data);
    pingPong = true;
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
});

