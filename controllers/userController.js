import dotenv from "dotenv";
dotenv.config();

import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import imageDownloader from "image-downloader";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import Place from "../models/Place.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const createToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: "1h" });
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
          { expiresIn: "1h" }
        );
        res.cookie("token", token).json(userDoc);
      } catch (err) {
        res
          .status(500)
          .json({ success: false, message: "Error generating token" });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid password" });
    }
  } else {
    res.status(400).json({ success: false, message: "User not found" });
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
      if (err)
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      const { name, email, _id } = await userModel.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logout successful" });
};

const upload = async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: path.join(__dirname, "../uploads/", newName),
  });
  res.json(newName);
};

const uploadPhotos = async (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;

    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace("../uploads/", ""));
  }
  res.json(uploadedFiles);
};

const addPlace = async (req, res) => {
  const { token } = req.cookies;
  const {
    title,
    address,
    addPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err)
      return res.status(401).json({ success: false, message: "Invalid token" });
    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    });
    res.json(placeDoc);
  });
};

const getUserPlaces = async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
};

const getPlacesId = async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id));
};

const putPlaces = async (req, res) => {
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err)
      return res.status(401).json({ success: false, message: "Invalid token" });
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("ok");
    }
  });
};

const getPlaces = async (req, res) => {
  res.json(await Place.find());
};

export {
  loginUser,
  registerUser,
  profile,
  logoutUser,
  upload,
  uploadPhotos,
  addPlace,
  getUserPlaces,
  getPlacesId,
  putPlaces,
  getPlaces,
};
