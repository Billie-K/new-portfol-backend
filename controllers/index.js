import 'dotenv/config'
import { createTransport } from 'nodemailer';
import developerLog from './logging.js';

export const Index = () => true;

const sendEmail = async function (email, subject, message) {
	//developerLog("process.env.SMTP_SERVER =", process.env.SMTP_SERVER);
	const transporter = createTransport({
		// eslint-disable-next-line no-undef
		host: process.env.SMTP_SERVER,
		// eslint-disable-next-line no-undef
		port: process.env.SMTP_PORT,
		secure: false,
		auth: {
		// eslint-disable-next-line no-undef
			user: process.env.SMTP_USER,
		// eslint-disable-next-line no-undef
			pass: process.env.SMTP_PXWD,
		},
		tls: {
			rejectUnauthorized: false
		}	
	});

	await transporter
		.sendMail({
			to: email,
			from: {
				name: 'Portfol.io',
				// eslint-disable-next-line no-undef
				address: process.env.SMTP_USER
			},
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

