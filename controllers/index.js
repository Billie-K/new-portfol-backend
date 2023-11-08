import {} from 'dotenv/config'
import { createTransport } from 'nodemailer';
import developerLog from './logging.js';

export const Index = () => true;

const sendEmail = async function (email, subject, message) {
	//developerLog("process.env.SMTP_SERVER =", process.env.SMTP_SERVER);
	const transporter = createTransport({
		host: process.env.SMTP_SERVER,
		secureConnection: true,
		requireTLS: true,
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PXWD,
		},
	});

	await transporter
		.sendMail({
			to: email,
			from: process.env.SMTP_USER,
			subject,
			html: `${message}`,
		})
		.then(() => {
			developerLog('email sent sucessfully');
			return 'Request submitted';
		})
		.catch((err) => {
			developerLog('email not sent', err);
			return `Email not sent: ${err.message}`
		});
};

export default sendEmail;

