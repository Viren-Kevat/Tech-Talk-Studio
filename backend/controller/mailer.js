// utils/mailer.js

const sgMail = require("@sendgrid/mail");

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // You will store this in your .env file

// Function to send a welcome email
const sendWelcomeEmail = (userEmail, userName) => {
  const msg = {
    to: userEmail, // Recipient's email
    from: "your-email@yourdomain.com", // Your registered SendGrid email
    subject: "Welcome to Tech-Talk Studio!",
    text: `Hello ${userName},\n\nWelcome to Tech-Talk Studio! We're thrilled to have you here. Start exploring and join the conversation!\n\nBest regards,\nThe Tech-Talk Studio Team`,
    html: `<p>Hello <strong>${userName}</strong>,</p><p>Welcome to <strong>Tech-Talk Studio</strong>! We're thrilled to have you here. Start exploring and join the conversation!</p><p>Best regards,<br>The Tech-Talk Studio Team</p>`,
  };

  // Send email
  return sgMail.send(msg);
};

module.exports = sendWelcomeEmail;
