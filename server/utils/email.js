const nodemailer = require('nodemailer');

let transporter = null;

const initEmailTransporter = () => {
  // Use Mailtrap or standard SMTP from env. If not configured, we'll log it.
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = process.env.SMTP_PORT || 2525;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.log('SMTP credentials not configured. Nodemailer will run in mock mode (emails logged to terminal).');
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n--- MOCK EMAIL SENT ---');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Text: ${mailOptions.text}`);
        console.log('-----------------------\n');
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
    return;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass
    }
  });

  console.log('Nodemailer SMTP Transporter Initialized.');
};

const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) initEmailTransporter();
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Job Portal'}" <${process.env.FROM_EMAIL || 'noreply@jobportal.com'}>`,
      to,
      subject,
      text,
      html
    });
    return info;
  } catch (error) {
    console.error('Nodemailer sendMail failed:', error.message);
  }
};

const sendStatusUpdateEmail = async (candidateEmail, candidateName, jobTitle, companyName, newStatus) => {
  const subject = `Job Application Update: ${jobTitle} at ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${candidateName},</h2>
      <p>We wanted to let you know that the status of your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to:</p>
      <p style="font-size: 18px; font-weight: bold; color: #16a34a; background-color: #f0fdf4; padding: 10px; display: inline-block; border-radius: 4px;">
        ${newStatus}
      </p>
      <p>Log in to your Candidate Dashboard to track your applications and view any specific updates.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">This is an automated message from the Job Portal Recruitment Team.</p>
    </div>
  `;
  const text = `Hi ${candidateName},\n\nThe status of your application for ${jobTitle} at ${companyName} has been updated to: ${newStatus}.\n\nLog in to your dashboard for details.`;
  
  return await sendMail({ to: candidateEmail, subject, html, text });
};

const sendInterviewEmail = async (candidateEmail, candidateName, jobTitle, companyName, interviewDetails) => {
  const { date, time, mode, meetingLink } = interviewDetails;
  const formattedDate = new Date(date).toLocaleDateString();
  const subject = `Interview Scheduled: ${jobTitle} at ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${candidateName},</h2>
      <p>Great news! An interview has been scheduled for your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
      
      <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 5px 0;"><strong>Mode:</strong> ${mode}</p>
        <p style="margin: 5px 0;"><strong>Details/Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
      </div>

      <p>Please make sure you are available at the scheduled time. Log in to your calendar on the Job Portal for more details.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">This is an automated message from the Job Portal Recruitment Team.</p>
    </div>
  `;
  const text = `Hi ${candidateName},\n\nAn interview has been scheduled for ${jobTitle} at ${companyName}.\nDate: ${formattedDate}\nTime: ${time}\nMode: ${mode}\nLink/Location: ${meetingLink}`;
  
  return await sendMail({ to: candidateEmail, subject, html, text });
};

module.exports = {
  initEmailTransporter,
  sendMail,
  sendStatusUpdateEmail,
  sendInterviewEmail
};
