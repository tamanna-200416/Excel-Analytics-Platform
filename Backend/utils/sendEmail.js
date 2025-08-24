import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import otpTemplate from './otpTemplate.js';

dotenv.config();

export const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"DataViz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your DataViz Account',
      html: otpTemplate(otp), // ✅ Using custom template
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent');
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Could not send email');
  }
};

export const sendResetEmail = async (email, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, // your email
      pass: process.env.EMAIL_PASS, // app password
    },
  });

  await transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Password Reset',
    html: `<p>You requested a password reset</p>
          <a href="${resetLink}">Click here to reset your password</a>`,
  });
};
