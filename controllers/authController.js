import Users from "../models/userModel.js";
import UserVerificationToken from '../models/auth.js';
import sendEmail from "./index.js"
// import { handleError } from "./errorHandler.js";
import developerLog from "./logging.js";

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

export const VerifyEmail = async (req, res) => {
  const {id, token} = req.params;
  try {
    const user = await Users.findOne({ _id: id });

    if (!user) return res.status(400).send("Invalid link");

    const user_token = await UserVerificationToken.findOne({
      userId: user._id,
      token: token,
    });

    if (!user_token) return res.status(400).send("Invalid link or token already used.");

    user.verified = true;
    await user.save()
    await UserVerificationToken.findByIdAndRemove(user_token._id);

    res.send("email verified sucessfully");
  } catch (error) {
    res.status(400).send("An error occured");
  }
}

export const SendVerificationEmail = async ({email, firstName, url, user_id}) => {
	try {
      const subject = 'Welcome to Portfol.io - Your Gateway to Exciting Opportunities!';
      const msg = `
        <div style="font-size: 16px;">
          <p>Hi ${firstName}!</p>

          <p>
            Welcome to the future of freelancing with Portfolio Kenya - Africa's 
            first fully integrated freelance job marketplace platform! 🚀
          </p>

          <p>
            We're thrilled to have you on board, ready to embark on a journey of 
            exciting opportunities!
          </p>

          <p><b>Why Portfolio?</b></p>

          <p>
            For Freelancers: <br/>
            🌐 *Global Opportunities:* Connect with global clients and 
            showcase your talents on a world stage. <br/>
            💸 *Seamless Payments:* Get paid stress-free with our 
            streamlined payment system. <br/>
            🎯 *Easy Job Application:* Applying for work has never been 
            this straightforward! <br/>
          </p>

          <p>
            For Businesses: <br/>
            💼 *Talent as a Service:* Experience hassle-free onboarding with 
            our top-notch talent pool. <br/>
            🛠️ *Equipment as a Service:* Equip your operations effortlessly 
            for maximum efficiency. <br/>                      
          </p>

          <p><b>Your Portfol.io Experience Starts Here!</b></p>

          <p>
            We're not just a platform; we're a community. Get ready for a journey 
            filled with excitement, confidence, and a sense of belonging.

            <br/><br/>

            Feel free to explore all the amazing features waiting for you. 
            If you have any questions, our support team is here to assist.

            <br/><br/>

            <p>Please follow this link to verify your email address:
              <p><a href="http://${url}">Click to verify.</a></p>

              Kindly note that this link expires in 1 hour.
            </p>

            Let's build something incredible together!

            <br/><br/>

            Best, <br/>
            Wallace Milei - CEO <br />
            Portfol.io
          </p>

        </div>
      `

      sendEmail(email, subject, msg);

      return {
        status: 'PENDING',
        message: 'Verification otp email sent',
        userId: user_id,
      };
} catch (err) {
		err.status = 'FAILED';
		// handleError(res, err.status, err);
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
    let token = await new UserVerificationToken({
      userId: user._id,
      token: await user.createJWT(),
    }).save();

    // eslint-disable-next-line no-undef
    const url = `${process.env.BASE_URL}/auth/${user.id}/verify/${token.token}`;
		await SendVerificationEmail({
      user_id: user._id,
      firstName: user.firstName,
      email: user.email,
      url: url,
      userToken: token
    });

    res.status(201).send({
      success: true,
      message: "An email has been sent to your account, please verify.",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
      },
      token,
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

export const test = () => {
  sendEmail('billiemush@gmail.com', 'Portfol Greeting', 'Hi there Billie');
}