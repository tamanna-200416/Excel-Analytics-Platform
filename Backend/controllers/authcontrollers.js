import jwt from 'jsonwebtoken';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { sendOTP } from '../utils/sendEmail.js';
import { generateToken } from '../utils/generateToken.js';
import cloudinary from '../utils/cloudinary.js';
import streamifier from 'streamifier';
import File from '../models/File.js'; 

// Multer config for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// @desc Register new user
export const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Email, username, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const newUser = new User({
      email,
      password,
      username,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newUser.save();
    await sendOTP(email, otp);

    res.status(201).json({ message: 'OTP sent to your email. Please verify.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar || '',
      },
      token,
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// @desc Login user
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please verify OTP.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    const token = generateToken(user);

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar || '',
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc Get user profile
export const getUserProfile = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar: user.avatar || '',
  });
};

// Utility function to handle Cloudinary stream upload from buffer
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'avatars',
        transformation: [{ width: 512, height: 512, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (password) user.password = password;

    // 👇 Upload avatar buffer (if present)
    if (req.file) {
      const uploadResult = await streamUpload(req.file.buffer);
      user.avatar = uploadResult.secure_url;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');

    // Aggregate file counts by user ID
    const fileCounts = await File.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);

    // Map file counts to user IDs
    const fileCountMap = {};
    fileCounts.forEach((fc) => {
      fileCountMap[fc._id.toString()] = fc.count;
    });

    // Attach fileCount to each user
    const result = users.map((u) => ({
      id: u._id,
      email: u.email,
      username: u.username,
      role: u.role,
      isVerified: u.isVerified,
      avatar: u.avatar,
      fileCount: fileCountMap[u._id.toString()] || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const deleteUserByAdmin = async (req, res) => {
  try {
    // Make sure the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
