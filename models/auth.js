import mongoose, { model } from 'mongoose';

const { Schema } = mongoose;

const userVerificationTokenSchema = new Schema({
	userId: String,
	token: { type: String, required: true },
	createdAt: {
		type: Date,
		default: Date.now,
	},
	expiresAt: Date,
});

const UserVerificationToken = model('UserVerificationToken', userVerificationTokenSchema);

export default UserVerificationToken;