using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ControlCentrer {
    class Point2d {
        public double x;
        public double y;
        public void parse(byte[] buffer, ref int startIndex) {
            x = BitConverter.ToDouble(buffer, startIndex);
            startIndex += 8;
            y = BitConverter.ToDouble(buffer, startIndex);
            startIndex += 8;

        }
    }
    class ObjectPosition {
        public bool isValid;
        public double distance;
        public double angle;
        public double heading;
        public Point2d fieldCoords = new Point2d();
        public Point2d rawPixelCoords = new Point2d();
        public Point2d polarMetricCoords = new Point2d();
        public void parse(byte[] buffer, ref int startIndex) {
            isValid = BitConverter.ToBoolean(buffer, startIndex);
            distance = BitConverter.ToDouble(buffer, startIndex + 8);
            angle = BitConverter.ToDouble(buffer, startIndex + 16); ;
            heading = BitConverter.ToDouble(buffer, startIndex + 24);
            startIndex += 32;
            fieldCoords.parse(buffer, ref startIndex);
            rawPixelCoords.parse(buffer, ref startIndex);
            polarMetricCoords.parse(buffer, ref startIndex);

        }
    };
    class RobotPosition {
        public ObjectPosition objectPos = new ObjectPosition();
        public void parse(byte[] buffer, ref int startIndex) {
            objectPos.parse(buffer, ref startIndex);
        }
    }
    class GatePosition {
        public ObjectPosition objectPos = new ObjectPosition();
        public Point2d minCornerPolarCoords = new Point2d();
        public void parse(byte[] buffer, ref int startIndex) {
            objectPos.parse(buffer, ref startIndex);
            minCornerPolarCoords.parse(buffer, ref startIndex);

        }
    }
    class BallPosition {
        public ObjectPosition objectPos = new ObjectPosition();
        public int id;
        public bool isUpdated;
        public double speed;
        public void parse(byte[] buffer, ref int startIndex) {
            objectPos.parse(buffer, ref startIndex);
            id = buffer[startIndex];
            isUpdated = BitConverter.ToBoolean(buffer, startIndex + 1);
            speed = BitConverter.ToDouble(buffer, startIndex + 4);
            startIndex += 16;
        }
    };
    class FieldState {
        public byte gameMode;
        public bool isPlaying;
        public byte robotColor;
        public bool collisionWithBorder;
        public bool collisionWithUnknown;
        public bool obstacleNearBall;
        public bool gateObstructed;
        public byte targetGate;
        public byte homeGate;
        public byte ballCount; // number or balls visible
        public byte closestBall; // index to closeset ball by distance
        public byte closestBallInFront;
        public ObjectPosition partner = new ObjectPosition();
        public RobotPosition self = new RobotPosition();
        public GatePosition yellowGate = new GatePosition();
        public GatePosition blueGate = new GatePosition();
        public ObjectPosition[] opponents = new ObjectPosition[2];
        public Point2d collisionRange = new Point2d();
        public BallPosition[] balls = new BallPosition[15];
        public FieldState() {
            opponents[0] = new ObjectPosition();
            opponents[1] = new ObjectPosition();
            for(int i = 0; i < 15; i++) {
                balls[i] = new BallPosition();
            }

        }

        public void parse(byte[] buffer){
            gameMode = buffer[4];
            robotColor = buffer[5];
            isPlaying = BitConverter.ToBoolean(buffer, 6);
            collisionWithBorder = BitConverter.ToBoolean(buffer, 7);
            collisionWithUnknown = BitConverter.ToBoolean(buffer, 8);
            obstacleNearBall = BitConverter.ToBoolean(buffer, 9);
            gateObstructed = BitConverter.ToBoolean(buffer, 10);
            targetGate = buffer[11];
            homeGate = buffer[12];
            ballCount = buffer[13];
            closestBall = buffer[14];
            closestBallInFront = buffer[15];
            int startIndex = 16;
            partner.parse(buffer, ref startIndex); //+ 80
            self.parse(buffer, ref startIndex);
            blueGate.parse(buffer, ref startIndex);
            yellowGate.parse(buffer, ref startIndex);
            opponents[0].parse(buffer, ref startIndex);
            opponents[1].parse(buffer, ref startIndex);
            collisionRange.parse(buffer, ref startIndex);
            for(int c = 0; c < ballCount; c++) {
                balls[c].parse(buffer, ref startIndex);
            }

        }

    }
}