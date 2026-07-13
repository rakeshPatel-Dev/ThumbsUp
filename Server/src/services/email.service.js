import transporter from '../config/email.config.js';

const SMTP_FROM = process.env.SMTP_FROM;

// ==============================
// Core email sender
// ==============================
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: SMTP_FROM,
            to,
            subject,
            html,
        });
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId, to };
    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error.message);
        return { success: false, error: error.message, to };
    }
};

// ==============================
// Email templates
// ==============================
const templates = {
    welcome: (username) => `
        <p>Hi ${username},</p>
        <p>Welcome to ThumbsUp - Smart Task Manager! We're excited to have you on board.</p>
        <p>Best regards,<br>ThumbsUp Team</p>
    `,
    login: (username, deviceInfo) => `
        <p>Hi ${username},</p>
        <p>You have logged in from a new device:</p>
        <p><strong>${deviceInfo}</strong></p>
        <p>Best regards,<br>ThumbsUp Team</p>
    `,
    taskApproval: (task) => `
        <p>Hi,</p>
        <p>A new task requires your approval:</p>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Description:</strong> ${task.description || 'N/A'}</p>
        <p>Best regards,<br>ThumbsUp Team</p>
    `,
    taskStatus: (task) => `
        <p>Hi,</p>
        <p>Your task status has been updated:</p>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p>Best regards,<br>ThumbsUp Team</p>
    `,
    taskApproved: (task) => `
        <p>Hi,</p>
        <p>Your task has been approved:</p>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p>Best regards,<br>ThumbsUp Team</p>
    `,
    taskRejected: (task) => `
        <p>Hi,</p>
        <p>Your task has been rejected:</p>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        ${task.rejectionReason ? `<p><strong>Reason:</strong> ${task.rejectionReason}</p>` : ''}
        <p>Best regards,<br>ThumbsUp Team</p>
    `,
    emailVerification: (verificationLink) => `
        <p>Hi,</p>
        <p>Click the link below to verify your email:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>Best regards,<br>ThumbsUp Team</p>
    `,
};  

// ==============================
// Email functions
// ==============================

// Send welcome email
export const sendRegistrationEmail = (to, username) =>
    sendEmail({ to, subject: 'Welcome to ThumbsUp!', html: templates.welcome(username) });

// Send login notification email
export const sendLoginNotificationEmail = (to, username, deviceInfo) =>
    sendEmail({ to, subject: 'New Login Notification', html: templates.login(username, deviceInfo) });

// Send task approval email
export const sendTaskApprovalEmail = (to, task) =>
    sendEmail({ to, subject: 'New Task Approval Request', html: templates.taskApproval(task) });

// Send task status update email
export const sendTaskStatusUpdateEmail = (to, task) =>
    sendEmail({ to, subject: 'Task Status Update', html: templates.taskStatus(task) });

// Send task approval notification email
export const sendTaskApprovalNotificationEmail = (to, task) =>
    sendEmail({ to, subject: 'Task Approved', html: templates.taskApproved(task) });
  
// Send task creation email to manager
export const sendTaskCreationEmailToManager = (to, task) =>
    sendEmail({ to, subject: 'New Task Created', html: templates.taskApproval(task) });


//hello
// export const sendTaskApprovedEmailToManager = (to, task) =>
//     sendEmail({ to, subject: 'Task Approved', html: templates.taskApproved(task) });

// export const sendTaskRejectedEmailToManager = (to, task) =>
//     sendEmail({ to, subject: 'Task Rejected', html: templates.taskRejected(task) });


// export const sendTaskRejectedEmailToUser = (to, task) =>
//     sendEmail({ to, subject: 'Task Rejected', html: templates.taskRejected(task) });

// export const sendTaskApprovedEmailToUser = (to, task) =>
//     sendEmail({ to, subject: 'Task Approved', html: templates.taskApproved(task) });

// Send task rejection notification email
export const sendTaskRejectionNotificationEmail = (to, task) =>
    sendEmail({ to, subject: 'Task Rejected', html: templates.taskRejected(task) });

// Send email verification email
export const sendEmailVerificationEmail = (to, verificationLink) =>
    sendEmail({ to, subject: 'Email Verification', html: templates.emailVerification(verificationLink) });
