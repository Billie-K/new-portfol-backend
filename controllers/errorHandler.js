require('dotenv').config();
import { developerLog } from './logging.js';

const environment = process.env.APP_ENVIRONMENT;

const handleError = (res, status, mainError) => {
	if (environment === 'production') {
		switch (status) {
			case 500:
				res
					.status(status)
					.send({ success: false, error: 'Server error. Please try again.' });
				break;
			case 403:
				res.status(status).send({
					success: false,
					error: 'Access denied. Please sign in with correct credentials.',
				});
				break;
			default:
				res
					.status(status ?? 500)
					.send({ success: false, error: mainError.message });
		}
	} else {
		//we are in development env:
		//TODO: log this error to a cloud logging service
		developerLog(mainError);
		if (typeof mainError !== 'string') {
			res
				.status(status ?? 500)
				.send({ ...mainError, success: false, error: mainError.message });
		} else {
			res
				.status(status ?? 500)
				.send({ message: mainError, success: false, error: mainError.message });
		}
	}
};

export default { handleError };
