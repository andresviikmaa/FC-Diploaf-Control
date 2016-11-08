using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ControlCentrer {
    public partial class Form1 : Form {
        private bool closePending;
        Pen myPen = new Pen(Color.Red);
        Graphics formGraphics;
        SolidBrush myBrush = new SolidBrush(System.Drawing.Color.Red);
        SolidBrush BlueBrush = new SolidBrush(System.Drawing.Color.Blue);
        SolidBrush YellowBrush = new SolidBrush(System.Drawing.Color.Yellow);
        SolidBrush GreenBrush = new SolidBrush(System.Drawing.Color.Green);
        int fieldX;
        int fieldY;
        Bitmap field1 = new Bitmap(Properties.Resources.field2);
        Bitmap field2 = new Bitmap(Properties.Resources.field21);
        bool bMaster = true;
        bool restart = false;
        bool online = false;
        UdpClient udpSender = new UdpClient();
        IPEndPoint target;

        private readonly object syncLock = new object();
        string command = "";
        public Form1() {
            InitializeComponent();

            backgroundWorker1.RunWorkerAsync(null);

            formGraphics = this.panel1.CreateGraphics();
            fieldX = this.panel1.Width/2;
            fieldY = this.panel1.Height / 2;
        }
        private void backgroundWorker1_DoWork(object sender, DoWorkEventArgs e)
        {
            BackgroundWorker worker = sender as BackgroundWorker;
            IPEndPoint remoteEndPoint = new IPEndPoint(IPAddress.Loopback, 0);
            using (var udpClient = new UdpClient(30000 + (bMaster ? 0 : 1)))
            {
                udpClient.Client.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReceiveTimeout, 1000);
                FieldState field = new FieldState();

                while(!worker.CancellationPending)
                {
                    try
                    {
                        lock(syncLock) {
                            if(command != "") {
                                udpClient.Send(Encoding.ASCII.GetBytes(command), command.Length, remoteEndPoint);
                                command = "";
                            };
                        }

                        var buffer = udpClient.Receive(ref remoteEndPoint);
                        long size = BitConverter.ToInt32(buffer, 0);
                        field.parse(buffer);

                        if(size != 1600) {
                            worker.ReportProgress(0, "invalid field state received");
                        }
                        lock(syncLock) {
                            command = "Give me money";
                        }

                        worker.ReportProgress(0, field);
                        if (!online)
                        {
                            online = true;
                            pnlOnline.BackColor = Color.Green;
                            worker.ReportProgress(0, remoteEndPoint);

                        }
                    }
                    catch (SocketException)
                    {
                        if (online)
                        {
                            online = false;
                            pnlOnline.BackColor = Color.Red;
                            worker.ReportProgress(0, remoteEndPoint);
                        }
                        ;
                    }
                    // ...
                }

            }
        }
        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (backgroundWorker1.IsBusy)
            {
                closePending = true;
                backgroundWorker1.CancelAsync();
                e.Cancel = true;
                this.Enabled = false;   // or this.Hide()
                return;
            }
            base.OnFormClosing(e);
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
        }

        private void backgroundWorker1_ProgressChanged_1(object sender, ProgressChangedEventArgs e)
        {
            bool flipped = Tag.ToString() == "1";
            if(tabControl1.SelectedTab == tabPage1) {
                formGraphics.FillRectangle(GreenBrush, new Rectangle(0, 0, panel1.Width, panel1.Height));
            } else if(tabControl1.SelectedTab == tabPage3) {
                formGraphics.DrawImage(flipped ? field1 : field2, new Point(0, 0));
            }
            //panel1.Invalidate();
            if(e.UserState is FieldState) {
                drawBall(fieldX, fieldY, BlueBrush);

                var state = e.UserState as FieldState;
                txtBallCount.Text = state.ballCount.ToString();
                if(state.blueGate.objectPos.isValid) {
                    if(tabControl1.SelectedTab == tabPage1) {
                        int p1 = (int)(state.blueGate.objectPos.rawPixelCoords.x / 3);
                        int p2 = (int)(state.blueGate.objectPos.rawPixelCoords.y / 3);
                        drawBall(fieldX + p1, fieldY + p2, BlueBrush);
                    }
                }
                if(state.yellowGate.objectPos.isValid) {
                    if(tabControl1.SelectedTab == tabPage1) {
                        int p1 = (int)(state.yellowGate.objectPos.rawPixelCoords.x / 3);
                        int p2 = (int)(state.yellowGate.objectPos.rawPixelCoords.y / 3);
                        drawBall(fieldX + p1, fieldY + p2, YellowBrush);
                    }
                }
                for(int i = 0; i < state.ballCount; i++) {
                    if(tabControl1.SelectedTab == tabPage1) {
                        int p1 = (int)(state.balls[i].objectPos.rawPixelCoords.x/3);
                        int p2 = (int)(state.balls[i].objectPos.rawPixelCoords.y/3);
                        drawBall(fieldX + p1, fieldY + p2, myBrush);
                    }
                    if(tabControl1.SelectedTab == tabPage3) {
                        int p1 = (int)state.balls[i].objectPos.fieldCoords.y;
                        int p2 = (int)state.balls[i].objectPos.fieldCoords.x;
                        drawBall(fieldX + p1, fieldY + p2, myBrush);
                    }
                }
            } else if(e.UserState is IPEndPoint){
                var remoteEndPoint = e.UserState as IPEndPoint;
                textBox1.Text = "Data received from " + remoteEndPoint.Address.ToString();
                if(target == null) {
                    target = new IPEndPoint(remoteEndPoint.Address, 30000 + (bMaster ? 1 : 0));
                }
            }

        }

        private void drawBall(int p1, int p2, SolidBrush myBrush)
        {
            //throw new NotImplementedException();
            formGraphics.FillEllipse(myBrush, new Rectangle(p1, p2, 10, 10));
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if(target != null) {
                command = "Give me money\0";
                udpSender.Send(Encoding.ASCII.GetBytes(command), command.Length, target);
            }
        }

        private void backgroundWorker1_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            if (closePending) this.Close();
            closePending = false;
            if (restart)
            {
                backgroundWorker1.RunWorkerAsync(null);
                restart = false;
            }
                
        }

        private void button2_Click(object sender, EventArgs e)
        {
            bool flipped = Tag.ToString() == "1";
            Tag = flipped ? "0" : "1";
        }

        private void radioButton1_CheckedChanged(object sender, EventArgs e)
        {
            bMaster = (sender as RadioButton).Tag.ToString() == "1";
            backgroundWorker1.CancelAsync();
            restart = true;
        }

        private void Form1_KeyDown(object sender, KeyEventArgs e) {
            ;
        }

        private void button3_Click(object sender, EventArgs e) {
            Close();
        }
    }
}
