// const { Resend } = require('resend')
// const nodemailer = require('nodemailer')
// const { createError } = require('./helperFuncs')

// const senderEmail = process.env.EMAIL
// const senderName = "Omoba Solomon and Partners"

// const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//         user: senderEmail,
//         pass: process.env.EMAIL_PASS
//     }
// })

// const sendEmail = async (to, subject, html) => {
//     try {
//         await transporter.sendMail({
//             from: `"${senderName}" <${senderEmail}>`,
//             to,
//             subject,
//             html
//         })
//     } catch (err) {
//         console.log(err)
//         throw createError("Error sending verification email", 409)
//     }
// }

// module.exports = sendEmail

// const resend = new Resend(process.env.RESEND_API_KEY)

// const sendEmail = async (sender, to, subject, html) => {
//     try {
//         await resend.emails.send({
//             from: sender,
//             to,
//             subject,
//             html,
//         })
//     } catch (err) {
//         console.log(err)
//         throw createError("Error sending verification email", 409)
//     }
// }

const { google } = require('googleapis')
const MailComposer = require('nodemailer/lib/mail-composer')

const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
)
oauth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN })

const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `Omoba Solomon and Partners <${process.env.OAUTH_EMAIL}>`,
            to: to,
            subject: subject,
            html: htmlContent,
            textEncoding: 'base64'
        }

        const mail = new MailComposer(mailOptions)
        const message = await mail.compile().build()
        const rawMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawMessage
            }
        })

        console.log('Email sent successfully:', result.data.id)
        return result.data
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
}

module.exports = { sendEmail }

// OOP Version
// class EmailService {
//   constructor() {
//     this.oauth2Client = new google.auth.OAuth2(
//       process.env.OAUTH_CLIENT_ID,
//       process.env.OAUTH_CLIENT_SECRET,
//       'https://developers.google.com/oauthplayground'
//     );
//     this.oauth2Client.setCredentials({
//       refresh_token: process.env.OAUTH_REFRESH_TOKEN
//     });
//     this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
//   }
//   async sendEmail(to, subject, htmlContent) {
//     try {
//       const mailOptions = {
//         from: `Omoba Solomon and Partners <${process.env.OAUTH_EMAIL}>`,
//         to: to,
//         subject: subject,
//         html: htmlContent,
//         textEncoding: 'base64'
//       };
//       const mail = new MailComposer(mailOptions);
//       const message = await mail.compile().build();
//       const rawMessage = Buffer.from(message)
//         .toString('base64')
//         .replace(/\+/g, '-')
//         .replace(/\//g, '_')
//         .replace(/=+$/, '');
//       const result = await this.gmail.users.messages.send({
//         userId: 'me',
//         requestBody: {
//           raw: rawMessage
//         }
//       });
//       console.log('Email sent successfully:', result.data.id);
//       return result.data;
//     } catch (error) {
//       console.error('Error sending email:', error);
//       throw error;
//     }
//   }
// }
// module.exports = new EmailService();