const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Define Mongoose Schema and Model
const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const Lead = mongoose.model('Lead', LeadSchema);

// API Route to capture leads and send email
app.post('/api/lead', async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log("Received:", name, email);

    if (!name || !email) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newLead = new Lead({ name, email });
    await newLead.save();
    console.log("Saved to DB");

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to CloudDash 🚀',
      html: `<p>Hi ${name},</p><p>Thanks for signing up with CloudDash!</p><p>Stay tuned for updates.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", email);

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

