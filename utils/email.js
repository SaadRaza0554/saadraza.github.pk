const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  'contact-notification': {
    subject: 'New Contact Form Submission',
    html: (context) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Contact Details:</h3>
          <p><strong>Name:</strong> ${context.contact.name}</p>
          <p><strong>Email:</strong> ${context.contact.email}</p>
          <p><strong>Subject:</strong> ${context.contact.subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
            ${context.contact.message.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Submitted:</strong> ${new Date(context.contact.createdAt).toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${context.contact.ipAddress || 'Not available'}</p>
          ${context.contact.isSpam ? '<p style="color: #dc2626;"><strong>⚠️ This message was flagged as potential spam</strong></p>' : ''}
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${context.adminUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View in Admin Panel
          </a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated notification from your personal website contact form.
        </p>
      </div>
    `
  },
  
  'contact-confirmation': {
    subject: 'Thank you for your message',
    html: (context) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for reaching out!</h2>
        <p>Hi ${context.name},</p>
        <p>Thank you for your message regarding "<strong>${context.subject}</strong>". I've received your inquiry and will get back to you as soon as possible.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #1e40af;">What happens next?</h3>
          <ul style="color: #1e40af;">
            <li>I'll review your message within 24 hours</li>
            <li>You'll receive a detailed response via email</li>
            <li>If you have urgent inquiries, feel free to follow up</li>
          </ul>
        </div>
        
        <p>In the meantime, feel free to:</p>
        <ul>
          <li>Check out my <a href="${process.env.FRONTEND_URL}/#projects" style="color: #2563eb;">portfolio projects</a></li>
          <li>Learn more about my <a href="${process.env.FRONTEND_URL}/#skills" style="color: #2563eb;">skills and expertise</a></li>
          <li>Connect with me on <a href="https://linkedin.com/in/saadraza" style="color: #2563eb;">LinkedIn</a></li>
        </ul>
        
        <p>Best regards,<br><strong>Saad Raza</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated confirmation email. Please do not reply to this message.
        </p>
      </div>
    `
  },
  
  'password-reset': {
    subject: 'Password Reset Request',
    html: (context) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Hi ${context.name},</p>
        <p>You recently requested to reset your password. Click the button below to reset it:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${context.resetUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>This password reset link will expire in <strong>1 hour</strong>.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0; color: #991b1b;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support immediately.
          </p>
        </div>
        
        <p>Best regards,<br><strong>Saad Raza</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated password reset email. Please do not reply to this message.
        </p>
      </div>
    `
  },
  
  'welcome': {
    subject: 'Welcome to Your Personal Website',
    html: (context) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Welcome aboard! 🎉</h2>
        <p>Hi ${context.name},</p>
        <p>Welcome to your personal website! Your account has been successfully created and you now have access to the admin panel.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #166534;">Getting Started:</h3>
          <ul style="color: #166534;">
            <li>Access your <a href="${process.env.FRONTEND_URL}/admin" style="color: #059669;">admin dashboard</a></li>
            <li>Manage your portfolio projects</li>
            <li>Update your skills and expertise</li>
            <li>Monitor contact form submissions</li>
            <li>Customize your website content</li>
          </ul>
        </div>
        
        <p><strong>Your login credentials:</strong></p>
        <ul>
          <li><strong>Username:</strong> ${context.username}</li>
          <li><strong>Email:</strong> ${context.email}</li>
        </ul>
        
        <p>Best regards,<br><strong>Saad Raza</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated welcome email. Please do not reply to this message.
        </p>
      </div>
    `
  }
};

// Main email sending function
const sendEmail = async ({ to, subject, template, context, html, text }) => {
  try {
    // Check if required environment variables are set
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration incomplete. Skipping email send.');
      return { success: false, message: 'Email configuration incomplete' };
    }

    const transporter = createTransporter();
    
    // Prepare email content
    let emailSubject = subject;
    let emailHtml = html;
    let emailText = text;
    
    // Use template if provided
    if (template && emailTemplates[template]) {
      emailSubject = emailTemplates[template].subject;
      emailHtml = emailTemplates[template].html(context);
    }
    
    // Email options
    const mailOptions = {
      from: `"Saad Raza" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: emailSubject,
      html: emailHtml,
      text: emailText || emailHtml.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

// Send bulk emails (for newsletters, etc.)
const sendBulkEmail = async (recipients, template, context, subject) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        to: recipient.email,
        subject: subject || emailTemplates[template]?.subject || 'Message from Saad Raza',
        template,
        context: { ...context, name: recipient.name }
      });
      
      results.push({
        email: recipient.email,
        success: result.success,
        message: result.message
      });
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.push({
        email: recipient.email,
        success: false,
        message: error.message
      });
    }
  }
  
  return results;
};

module.exports = {
  sendEmail,
  testEmailConfig,
  sendBulkEmail,
  emailTemplates
};
