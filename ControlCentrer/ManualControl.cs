using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ControlCentrer
{
    public partial class ManualControl : Form
    {
        public event EventHandler<KeyEventArgs> KeyUpEvent = delegate { };

        public ManualControl()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Close();
        }

        private void ManualControl_KeyDown(object sender, KeyEventArgs e)
        {
            KeyUpEvent(sender, e);
        }
    }

}
