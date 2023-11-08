import {} from 'dotenv/config'

const environment = process.env.APP_ENVIRONMENT;

const developerLog = (...logMessages) => {
	if (environment !== 'production') {
		console.log(...logMessages);
	}
};

export default developerLog;
