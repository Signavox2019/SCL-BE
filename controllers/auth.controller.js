const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const generateToken = require('../utils/generateToken');

// const token = generateToken(user._id, user.role); // optional: pass user.role


// ✅ Helper: OTP generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Mailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // defined in .env
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Register New User
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, phone, role,
      collegeName, course, department, university,
      degree, specialization, cgpa, currentYear,
      isGraduated, yearOfPassing, hasExperience,
      previousCompany, position, yearsOfExperience
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      collegeName,
      course,
      department,
      university,
      degree,
      specialization,
      cgpa,
      currentYear,
      isGraduated,
      yearOfPassing,
      hasExperience,
      previousCompany,
      position,
      yearsOfExperience
    });

    res.status(201).json({ message: "Registration successful. Awaiting admin approval." });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isApproved) {
      return res.status(403).json({ message: "Account not approved by admin yet" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

// ✅ Forgot Password (send OTP)
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - Signavox Career Ladder",
      html: `<p>Your OTP to reset password is: <strong>${otp}</strong>.<br/>It is valid for 10 minutes.</p>`
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

// ✅ Reset Password using OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error });
  }
};
