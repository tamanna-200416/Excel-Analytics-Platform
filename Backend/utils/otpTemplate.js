const otpTemplate = (otp) => {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>OTP Verification</title>
    <style>
      body {
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        color: #333333;
        padding: 0;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }
      .header {
        font-size: 24px;
        font-weight: bold;
        color: #003366;
        margin-bottom: 20px;
      }
      .otp {
        font-size: 28px;
        font-weight: bold;
        color: #000000;
        background-color: #F5F5F5;
        display: inline-block;
        padding: 10px 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .footer {
        font-size: 14px;
        color: #999999;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"></div>
       <div class="header">Welcome to DataViz</div>
      <p>Dear User,</p>
      <p>Thank you for registering. Please use the OTP below to verify your email address:</p>
      <div class="otp">${otp}</div>
      <p>This OTP is valid for 10 minutes.</p>
      <div class="footer">If you did not request this, please ignore this email.<br>Contact us: info@dataviz.com</div>
    </div>
  </body>
  </html>`;
};

export default otpTemplate;
