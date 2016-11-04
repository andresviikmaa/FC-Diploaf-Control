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

namespace ControlCentrer
{
    public partial class Form1 : Form
    {
        private bool closePending;

        Pen myPen = new Pen(Color.Red);
        Graphics formGraphics;
        SolidBrush myBrush = new SolidBrush(System.Drawing.Color.Red);
        int fieldX;
        int fieldY;
        Bitmap field1 = new Bitmap(Properties.Resources.field2);
        Bitmap field2 = new Bitmap(Properties.Resources.field21);
        bool bMaster = true;
        bool restart = false;
        bool online = false;
        public Form1()
        {
            InitializeComponent();

            backgroundWorker1.RunWorkerAsync(null);

            formGraphics = this.panel1.CreateGraphics();
            fieldX = 304;
            fieldY = 202;
        }

        private void backgroundWorker1_DoWork(object sender, DoWorkEventArgs e)
        {
            BackgroundWorker worker = sender as BackgroundWorker;
            IPEndPoint remoteEndPoint = new IPEndPoint(IPAddress.Loopback, 0);
            using (var udpClient = new UdpClient(31000 + (bMaster ? 1 : 0)))
            {
                udpClient.Client.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReceiveTimeout, 1000);

                while (!worker.CancellationPending)
                {
                    try
                    {
                        var buffer = udpClient.Receive(ref remoteEndPoint);
                        var msg = System.Text.Encoding.ASCII.GetString(buffer);
                        worker.ReportProgress(0, msg);
                        if (!online)
                        {
                            online = true;
                            pnlOnline.BackColor = Color.Green;
                        }
                    }
                    catch (SocketException)
                    {
                        if (online)
                        {
                            online = false;
                            pnlOnline.BackColor = Color.Red;
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
            formGraphics.DrawImage(flipped ? field1 : field2, new Point(0,0));
            //panel1.Invalidate();
            string data = e.UserState as String;
            var items = data.Split(" ".ToCharArray());
            if (items[0] == "STT")
            {
                int ballCount = Int32.Parse(items[1]);
                for (int i = 0; i < ballCount; i++)
                {
                    drawBall(new Random().Next(1, 30) + fieldX + Int32.Parse(items[i * 2 + 3]), fieldY + Int32.Parse(items[i * 2 + 2]));
                }
            }

        }

        private void drawBall(int p1, int p2)
        {
            //throw new NotImplementedException();
            formGraphics.FillEllipse(myBrush, new Rectangle(p1, p2, 10, 10));
        }

        private void button1_Click(object sender, EventArgs e)
        {
            formGraphics.FillEllipse(myBrush, new Rectangle(0, 0, 200, 300));
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
    }
}
