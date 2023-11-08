import Users from "../models/userModel.js";
import UserVerificationToken from '../models/auth.js';
import sendEmail from "./index.js"

const VerificationToken = async ({ userId, token }) => {
	const newVerificationToken = new UserVerificationToken({
		userId: userId,
		token: token,
		createdAt: Date.now(),
		expiresAt: Date.now() + 3600000,
	});

	await newVerificationToken.save();
	return token;
};

export const SendVerification = async (req, res) => {
	try {
		const userId = req.body.userId;
		if (!userId) {
			throw new Error('Empty params');
		} else {
			const exist = await UserVerificationToken.find({ userId });
			if (exist) {
				await UserVerificationToken.deleteMany({ userId });
			}

			const token = await VerificationToken({ userId: userId, token: req.body.token });

			// Get OTP from logs in development environment
			developerLog({ token });

			const subject = 'Portfol OTP email confirmation';
			const msg = `<div style="font-size: 16px;">
                      <p>Hi ${req.body.firstName}!</p>
                      <p>Please click on this link to verify your email address:
                      <p>${req.body.url}</p>
                      Kindly note that this link expires in 1 hour.</p>
                      <p>If this was not you, please ignore the email. 🚮</p>
                    </div>`;

			sendEmail(req.body.email, subject, msg, reg);

			res.json({
				status: 'PENDING',
				message: 'Verification otp email sent',
				userId: req.body.userId,
			});
		}
	} catch (err) {
		err.status = 'FAILED';
		handleError(res, 400, err);
	}
};

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  //validate fileds

  if (!firstName) {
    next("First Name is required");
  }
  if (!email) {
    next("Email is required");
  }
  if (!lastName) {
    next("Last Name is required");
  }
  if (!password) {
    next("Password is required");
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      next("Email Address already exists");
      return;
    }

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password,
    });

    // user token
    const token = await user.createJWT();

    const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
		await SendVerification({
      userId: user._id,
      firstName: user.firstName,
      email: user.email,
      url: url
    });

    res.status(201).send({
      success: true,
      message: "An email has been sent to your account, please verify.",
      // message: "Account created successfully",
      // user: {
      //   _id: user._id,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   email: user.email,
      //   accountType: user.accountType,
      // },
      // token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //validation
    if (!email || !password) {
      next("Please Provide AUser Credentials");
      return;
    }

    // find user by email
    const user = await Users.findOne({ email }).select("+password");

    if (!user) {
      next("Invalid -email or password");
      return;
    }

    // compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      next("Invalid email or password");
      return;
    }

    user.password = undefined;

    const token = user.createJWT();

    res.status(201).json({
      success: true,
      message: "Login successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};