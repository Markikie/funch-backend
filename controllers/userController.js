import dotenv from 'dotenv';
dotenv.config();

import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const createToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: '1h' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await userModel.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      try {
        const token = jwt.sign(
          { email: userDoc.email, id: userDoc._id },
          jwtSecret,
          { expiresIn: '1h' }
        );
        res.cookie("token", token).json(userDoc);
      } catch (err) {
        res.status(500).json({ success: false, message: 'Error generating token' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid password' });
    }
  } else {
    res.status(400).json({ success: false, message: 'User not found' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const profile = async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) return res.status(401).json({ success: false, message: 'Invalid token' });
      const { name, email, _id } = await userModel.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
};

const logoutUser = (req, res) => {
    res.clearCookie("token"); // Clear the cookie
    res.json({ success: true, message: "Logout successful" }); // ✅ Only one response
  };

export { loginUser, registerUser, profile, logoutUser };
